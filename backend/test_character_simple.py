"""
Test script to verify character creation works with the fixed field names
"""
import requests
import json
import time
import sys
import random
import string

# Force UTF-8 encoding output
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8001"

# Generate random email
def random_email():
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"testuser{random_str}@example.com"

def test_character_creation():
    print("=" * 60)
    print("Testing Character Creation with Fixed Field Names")
    print("=" * 60)

    # Wait for server to start
    print("\n[1] Waiting for server to be ready...")
    server_ready = False
    for i in range(30):
        try:
            response = requests.get(f"{BASE_URL}/healthz", timeout=2)
            if response.status_code == 200:
                print("[OK] Server is ready")
                server_ready = True
                break
        except Exception as e:
            pass
        if i % 5 == 0:
            print(f"    Attempt {i+1}/30...")
        time.sleep(1)

    if not server_ready:
        print("[ERROR] Server did not start in time")
        return

    # Step 1: Create test user
    print("\n[2] Creating test user...")
    test_email = random_email()
    print(f"    Email: {test_email}")
    signup_response = requests.post(
        f"{BASE_URL}/auth/signup",
        json={"email": test_email, "password": "testpass123"}
    )
    print(f"    Status: {signup_response.status_code}")
    if signup_response.status_code not in [200, 201]:
        print(f"    Error: {signup_response.text}")
        return
    user_data = signup_response.json()
    user_id = user_data["id"]
    print(f"[OK] User created: {user_id}")

    # Step 2: Login
    print("\n[3] Logging in...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": test_email, "password": "testpass123"}
    )
    print(f"    Status: {login_response.status_code}")
    if login_response.status_code != 200:
        print(f"    Error: {login_response.text}")
        return
    login_data = login_response.json()
    print(f"[OK] Logged in")
    print(f"    Campaigns count: {len(login_data['campaigns'])}")

    # Step 3: Create campaign
    print("\n[4] Creating campaign...")
    campaign_slug = f"test-campaign-{random.randint(100000, 999999)}"
    campaign_response = requests.post(
        f"{BASE_URL}/campaigns",
        json={
            "slug": campaign_slug,
            "name": "Test Campaign",
            "description": "A test campaign"
        },
        headers={"Authorization": user_id}
    )
    print(f"    Status: {campaign_response.status_code}")
    if campaign_response.status_code != 201:
        print(f"    Error: {campaign_response.text}")
        return
    campaign_data = campaign_response.json()
    campaign_id = campaign_data["id"]
    admin_token = campaign_data["admin_token"]
    print(f"[OK] Campaign created: {campaign_id}")
    print(f"    Admin token: {admin_token[:20]}...")

    # Step 4: Create character with NEW field names (description, backstory)
    print("\n[5] Creating character with fixed field names...")
    character_data = {
        "name": "Jester Lavorre",
        "class_name": "Bard",
        "race": "Tiefling",
        "player_name": "Laura Bailey",
        "description": "A purple-skinned tiefling with golden eyes",
        "backstory": "Jester is a member of Mighty Nein"
    }
    print("    Sending character data...")

    character_response = requests.post(
        f"{BASE_URL}/campaigns/{campaign_id}/characters",
        json=character_data,
        headers={"X-Token": admin_token}
    )

    print(f"    Status: {character_response.status_code}")
    if character_response.status_code != 201:
        print(f"[ERROR] Failed to create character:")
        print(f"    Response: {character_response.text}")
        return

    character = character_response.json()
    print("[OK] Character created successfully!")
    print(f"    ID: {character['id']}")
    print(f"    Name: {character['name']}")
    print(f"    Slug: {character.get('slug', 'N/A')}")
    print(f"    Description: {character.get('description', 'N/A')}")
    print(f"    Backstory: {character.get('backstory', 'N/A')}")

    # Step 5: Verify character can be fetched
    print("\n[6] Fetching character to verify...")
    fetch_response = requests.get(
        f"{BASE_URL}/campaigns/{campaign_id}/characters/{character['id']}",
        headers={"X-Token": admin_token}
    )
    print(f"    Status: {fetch_response.status_code}")
    if fetch_response.status_code != 200:
        print(f"[ERROR] Failed to fetch character: {fetch_response.text}")
        return

    fetched_character = fetch_response.json()
    print("[OK] Character fetched successfully!")
    print(f"    Name: {fetched_character['name']}")
    print(f"    Class: {fetched_character.get('class', 'N/A')}")
    print(f"    Race: {fetched_character.get('race', 'N/A')}")

    print("\n" + "=" * 60)
    print("SUCCESS - All tests passed!")
    print("Character creation is working with fixed field names!")
    print("=" * 60)

if __name__ == "__main__":
    test_character_creation()
