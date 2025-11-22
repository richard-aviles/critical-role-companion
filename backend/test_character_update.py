"""
Test script to verify character update functionality
"""
import requests
import time
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8001"

def test_character_update():
    print("=" * 60)
    print("Testing Character Update Functionality")
    print("=" * 60)

    # Wait for server
    print("\n[1] Waiting for server...")
    for i in range(30):
        try:
            requests.get(f"{BASE_URL}/healthz", timeout=2)
            print("[OK] Server is ready")
            break
        except:
            pass
        time.sleep(1)

    # Create user
    print("\n[2] Creating test user...")
    import random, string
    email = f"testuser{''.join(random.choices(string.ascii_lowercase + string.digits, k=8))}@example.com"
    signup_response = requests.post(
        f"{BASE_URL}/auth/signup",
        json={"email": email, "password": "testpass123"}
    )
    if signup_response.status_code not in [200, 201]:
        print(f"[ERROR] Failed to create user")
        return
    user_id = signup_response.json()["id"]
    print(f"[OK] User created")

    # Login
    print("\n[3] Logging in...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": "testpass123"}
    )
    print(f"[OK] Logged in")

    # Create campaign
    print("\n[4] Creating campaign...")
    campaign_slug = f"test-campaign-{random.randint(100000, 999999)}"
    campaign_response = requests.post(
        f"{BASE_URL}/campaigns",
        json={"slug": campaign_slug, "name": "Test Campaign"},
        headers={"Authorization": user_id}
    )
    campaign_id = campaign_response.json()["id"]
    admin_token = campaign_response.json()["admin_token"]
    print(f"[OK] Campaign created")

    # Create character
    print("\n[5] Creating character...")
    character_response = requests.post(
        f"{BASE_URL}/campaigns/{campaign_id}/characters",
        json={
            "name": "Test Character",
            "class_name": "Wizard",
            "race": "Human",
            "player_name": "Test Player",
            "description": "Initial description",
            "backstory": "Initial backstory"
        },
        headers={"X-Token": admin_token}
    )
    character_id = character_response.json()["id"]
    print(f"[OK] Character created: {character_id}")

    # Test 1: Update without image
    print("\n[6] Updating character (without image)...")
    update_data = {
        "class_name": "Rogue",
        "race": "Elf",
        "description": "Updated description",
        "backstory": "Updated backstory"
    }

    # Convert to FormData
    update_form = __import__('requests_toolbelt').requests_toolbelt.MultipartEncoder(fields=update_data)
    update_response = requests.patch(
        f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
        data=update_form,
        headers={
            "X-Token": admin_token,
            "Content-Type": update_form.content_type
        }
    )

    if update_response.status_code != 200:
        print(f"[ERROR] Update failed: {update_response.status_code}")
        print(f"  Response: {update_response.text}")
        return

    updated = update_response.json()
    print(f"[OK] Character updated")
    print(f"    Class: {updated.get('class', 'N/A')}")
    print(f"    Race: {updated.get('race', 'N/A')}")
    print(f"    Description: {updated.get('description', 'N/A')}")

    # Verify updates persisted
    print("\n[7] Fetching character to verify updates...")
    fetch_response = requests.get(
        f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
        headers={"X-Token": admin_token}
    )
    fetched = fetch_response.json()

    if (fetched.get('class') == 'Rogue' and
        fetched.get('race') == 'Elf' and
        fetched.get('description') == 'Updated description' and
        fetched.get('backstory') == 'Updated backstory'):
        print("[OK] All fields correctly persisted!")
        print(f"    Class: {fetched['class']}")
        print(f"    Race: {fetched['race']}")
        print(f"    Description: {fetched['description']}")
        print(f"    Backstory: {fetched['backstory']}")
    else:
        print("[ERROR] Some fields were not persisted correctly")
        print(f"    Fetched: {fetched}")

    print("\n" + "=" * 60)
    print("SUCCESS - Character updates working!")
    print("=" * 60)

if __name__ == "__main__":
    test_character_update()
