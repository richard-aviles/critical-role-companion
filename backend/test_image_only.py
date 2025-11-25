"""
Test image upload endpoint (FormData with image only)
"""
import requests
import time
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8001"

def create_test_image():
    """Create a small test image file"""
    png_data = bytes([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
        0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54,
        0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0xFF, 0x7F,
        0x00, 0x09, 0xFB, 0x03, 0xFD, 0x05, 0x39, 0x07, 0xE7,
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
        0xAE, 0x42, 0x60, 0x82
    ])
    test_image_path = Path("test_simple_image.png")
    test_image_path.write_bytes(png_data)
    return test_image_path

def test_image_upload():
    print("=" * 60)
    print("Testing Image Upload Endpoint")
    print("=" * 60)

    # Wait for server
    print("\n[1] Waiting for server...")
    for i in range(30):
        try:
            requests.get(f"{BASE_URL}/healthz", timeout=2)
            print("[OK] Server ready")
            break
        except:
            pass
        time.sleep(1)

    # Create test data
    print("\n[2] Creating character...")
    import random, string
    rand_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"testuser{rand_str}@example.com"

    signup = requests.post(f"{BASE_URL}/auth/signup", json={"email": email, "password": "testpass123"})
    user_id = signup.json()["id"]
    requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": "testpass123"})

    campaign_slug = f"campaign-{random.randint(100000, 999999)}"
    campaign = requests.post(
        f"{BASE_URL}/campaigns",
        json={"slug": campaign_slug, "name": "Test"},
        headers={"Authorization": user_id}
    )
    campaign_id = campaign.json()["id"]
    admin_token = campaign.json()["admin_token"]

    char = requests.post(
        f"{BASE_URL}/campaigns/{campaign_id}/characters",
        json={"name": "Test", "class_name": "Wizard"},
        headers={"X-Token": admin_token}
    )
    character_id = char.json()["id"]
    print(f"[OK] Character created: {character_id}")

    # Create and upload image
    print("\n[3] Creating test image...")
    image_path = create_test_image()
    print(f"[OK] Test image created")

    print("\n[4] Uploading image to dedicated endpoint...")
    try:
        with open(image_path, 'rb') as img_file:
            files = {'image': ('test.png', img_file, 'image/png')}

            # POST to the image endpoint
            upload = requests.patch(
                f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}/image",
                files=files,
                headers={"X-Token": admin_token}
            )

        print(f"[DEBUG] Status: {upload.status_code}")
        print(f"[DEBUG] Response: {upload.text[:200]}")

        if upload.status_code == 200:
            updated = upload.json()
            print(f"[OK] Image uploaded successfully!")
            print(f"    Image URL: {updated.get('image_url', 'N/A')}")

            # Verify
            fetch = requests.get(
                f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
                headers={"X-Token": admin_token}
            )
            fetched = fetch.json()
            if fetched.get('image_url'):
                print(f"[OK] Image persisted in database!")
            else:
                print(f"[ERROR] Image not persisted")
        else:
            print(f"[ERROR] Upload failed: {upload.status_code}")

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        image_path.unlink()

    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)

if __name__ == "__main__":
    test_image_upload()
