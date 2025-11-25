"""
Test image upload using FormData (like frontend does now)
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
    # Create a minimal PNG file (1x1 pixel, white)
    png_data = bytes([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
        0x00, 0x00, 0x00, 0x0D,  # IHDR chunk length
        0x49, 0x48, 0x44, 0x52,  # IHDR
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  # 1x1
        0x08, 0x02, 0x00, 0x00, 0x00,  # 8-bit RGB
        0x90, 0x77, 0x53, 0xDE,  # CRC
        0x00, 0x00, 0x00, 0x0C,  # IDAT chunk length
        0x49, 0x44, 0x41, 0x54,  # IDAT
        0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0xFF, 0x7F,
        0x00, 0x09, 0xFB, 0x03, 0xFD,
        0x05, 0x39, 0x07, 0xE7,  # CRC
        0x00, 0x00, 0x00, 0x00,  # IEND chunk length
        0x49, 0x45, 0x4E, 0x44,  # IEND
        0xAE, 0x42, 0x60, 0x82   # CRC
    ])

    test_image_path = Path("test_image_upload.png")
    test_image_path.write_bytes(png_data)
    return test_image_path

def test_upload_with_formdata():
    print("=" * 60)
    print("Testing Image Upload with FormData")
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
    print("\n[2] Creating test user and campaign...")
    import random, string
    rand_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"testuser{rand_str}@example.com"

    signup = requests.post(f"{BASE_URL}/auth/signup", json={"email": email, "password": "testpass123"})
    if signup.status_code not in [200, 201]:
        print(f"    [ERROR] {signup.json().get('detail', signup.text)}")
        return
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

    # Create character
    print("\n[3] Creating character...")
    char = requests.post(
        f"{BASE_URL}/campaigns/{campaign_id}/characters",
        json={
            "name": "TestChar",
            "class_name": "Wizard",
            "race": "Human",
            "description": "Test",
            "backstory": "Test backstory"
        },
        headers={"X-Token": admin_token}
    )
    character_id = char.json()["id"]
    print(f"[OK] Character created")

    # Create test image
    print("\n[4] Creating test image...")
    image_path = create_test_image()
    print(f"[OK] Test image created: {image_path}")

    # Upload image with FormData (like frontend now does)
    print("\n[5] Uploading image with FormData...")
    try:
        # Build FormData with both text fields and image
        form_data = {
            'class_name': 'Rogue',  # Also update class while uploading
            'race': 'Elf',
        }

        with open(image_path, 'rb') as img_file:
            files = {'image': ('test_image.png', img_file, 'image/png')}

            update = requests.patch(
                f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
                data=form_data,
                files=files,
                headers={"X-Token": admin_token}
            )

        print(f"[DEBUG] Status: {update.status_code}")
        print(f"[DEBUG] Response headers: {dict(update.headers)}")
        if update.status_code != 200:
            print(f"[ERROR] Upload failed: {update.status_code}")
            print(f"  Response: {update.text}")
            image_path.unlink()
            return

        updated = update.json()
        print(f"[OK] Response status: {update.status_code}")
        print(f"    Class updated: {updated.get('class', 'N/A')}")
        print(f"    Image URL: {updated.get('image_url', 'Not set')}")

        # Verify
        print("\n[6] Verifying persistence...")
        fetch = requests.get(
            f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
            headers={"X-Token": admin_token}
        )
        fetched = fetch.json()

        has_image = bool(fetched.get('image_url'))
        class_updated = fetched.get('class') == 'Rogue'

        print(f"    Class: {fetched.get('class')}")
        print(f"    Image URL set: {has_image}")

        if class_updated and has_image:
            print("[OK] Both class and image updated successfully!")
        else:
            print("[WARNING] Partial update:")
            print(f"    Class updated: {class_updated}")
            print(f"    Image uploaded: {has_image}")

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        image_path.unlink()

    print("\n" + "=" * 60)
    print("Upload Test Complete")
    print("=" * 60)

if __name__ == "__main__":
    test_upload_with_formdata()
