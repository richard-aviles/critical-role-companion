"""
Test script to verify character creation works with the fixed field names
"""
import requests
import json
import time

BASE_URL = "http://localhost:8001"

def test_character_creation():
    print("=" * 60)
    print("Testing Character Creation with Fixed Field Names")
    print("=" * 60)

    # Wait for server to start
    print("\n[1] Waiting for server to be ready...")
    for i in range(30):
        try:
            response = requests.get(f"{BASE_URL}/healthz")
            if response.status_code == 200:
                print("✓ Server is ready")
                break
        except:
            pass
        if i == 29:
            print("✗ Server did not start in time")
            return
        time.sleep(1)

    # Step 1: Create test user
    print("\n[2] Creating test user...")
    signup_response = requests.post(
        f"{BASE_URL}/auth/signup",
        json={"email": "testuser@example.com", "password": "testpass123"}
    )
    print(f"Status: {signup_response.status_code}")
    if signup_response.status_code != 200:
        print(f"Error: {signup_response.text}")
        return
    user_data = signup_response.json()
    user_id = user_data["id"]
    print(f"✓ User created: {user_id}")

    # Step 2: Login
    print("\n[3] Logging in...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "testuser@example.com", "password": "testpass123"}
    )
    print(f"Status: {login_response.status_code}")
    if login_response.status_code != 200:
        print(f"Error: {login_response.text}")
        return
    login_data = login_response.json()
    print(f"✓ Logged in, user_id: {login_data['user_id']}")
    print(f"  Campaigns count: {len(login_data['campaigns'])}")

    # Step 3: Create campaign
    print("\n[4] Creating campaign...")
    campaign_response = requests.post(
        f"{BASE_URL}/campaigns",
        json={
            "slug": "test-campaign",
            "name": "Test Campaign",
            "description": "A test campaign"
        },
        headers={"X-Token": user_id}
    )
    print(f"Status: {campaign_response.status_code}")
    if campaign_response.status_code != 200:
        print(f"Error: {campaign_response.text}")
        return
    campaign_data = campaign_response.json()
    campaign_id = campaign_data["id"]
    admin_token = campaign_data["admin_token"]
    print(f"✓ Campaign created: {campaign_id}")
    print(f"  Admin token: {admin_token}")

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
    print(f"Sending character data: {json.dumps(character_data, indent=2)}")

    character_response = requests.post(
        f"{BASE_URL}/campaigns/{campaign_id}/characters",
        json=character_data,
        headers={"X-Token": admin_token}
    )

    print(f"\nStatus: {character_response.status_code}")
    if character_response.status_code != 200:
        print(f"✗ Error creating character:")
        print(f"  Response: {character_response.text}")
        return

    character = character_response.json()
    print(f"✓ Character created successfully!")
    print(f"  ID: {character['id']}")
    print(f"  Name: {character['name']}")
    print(f"  Slug: {character.get('slug', 'N/A')}")
    print(f"  Description: {character.get('description', 'N/A')}")
    print(f"  Backstory: {character.get('backstory', 'N/A')}")

    # Step 5: Verify character can be fetched
    print("\n[6] Fetching character to verify...")
    fetch_response = requests.get(
        f"{BASE_URL}/campaigns/{campaign_id}/characters/{character['id']}",
        headers={"X-Token": admin_token}
    )
    print(f"Status: {fetch_response.status_code}")
    if fetch_response.status_code != 200:
        print(f"✗ Error fetching character: {fetch_response.text}")
        return

    fetched_character = fetch_response.json()
    print(f"✓ Character fetched successfully!")
    print(f"  Name: {fetched_character['name']}")
    print(f"  Class: {fetched_character['class_name']}")
    print(f"  Race: {fetched_character['race']}")

    print("\n" + "=" * 60)
    print("✓ ALL TESTS PASSED - Character creation is working!")
    print("=" * 60)

if __name__ == "__main__":
    test_character_creation()
