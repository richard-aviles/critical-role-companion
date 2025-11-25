"""
Test character update using JSON (new endpoint)
"""
import requests
import time
import sys
import io
import random
import string

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8001"

def test_json_update():
    print("=" * 60)
    print("Testing Character Update with JSON")
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
            "description": "Initial",
            "backstory": "Initial backstory"
        },
        headers={"X-Token": admin_token}
    )
    character_id = char.json()["id"]
    print(f"[OK] Character created")
    print(f"    Initial Class: {char.json().get('class', 'N/A')}")

    # Update character using JSON (new endpoint)
    print("\n[4] Updating character using JSON...")

    update_payload = {
        'class_name': 'Rogue',
        'race': 'Elf',
        'description': 'Updated description',
        'backstory': 'Updated backstory'
    }

    update = requests.patch(
        f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
        json=update_payload,
        headers={"X-Token": admin_token}
    )

    if update.status_code != 200:
        print(f"[ERROR] Update failed: {update.status_code}")
        print(f"  Response: {update.text}")
        return

    updated = update.json()
    print(f"[OK] Character update response status: {update.status_code}")
    print(f"    Response class: {updated.get('class_name', 'N/A')}")
    print(f"    Response race: {updated.get('race', 'N/A')}")
    print(f"    Response description: {updated.get('description', 'N/A')}")

    # Verify
    print("\n[5] Verifying updates persisted...")
    fetch = requests.get(
        f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
        headers={"X-Token": admin_token}
    )
    fetched = fetch.json()

    success = (
        fetched.get('class_name') == 'Rogue' and
        fetched.get('race') == 'Elf' and
        fetched.get('description') == 'Updated description' and
        fetched.get('backstory') == 'Updated backstory'
    )

    if success:
        print("[OK] All fields correctly saved!")
        print(f"    Class: {fetched['class_name']}")
        print(f"    Race: {fetched['race']}")
        print(f"    Description: {fetched['description']}")
        print(f"    Backstory: {fetched['backstory']}")
    else:
        print("[ERROR] Updates not persisted:")
        print(f"    Expected class: Rogue, Got: {fetched.get('class_name')}")
        print(f"    Expected race: Elf, Got: {fetched.get('race')}")

    print("\n" + "=" * 60)
    if success:
        print("SUCCESS!")
    else:
        print("FAILED")
    print("=" * 60)

if __name__ == "__main__":
    test_json_update()
