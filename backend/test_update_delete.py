"""
Test campaign update and delete functionality
"""

import requests
import json
import time

BASE_URL = "http://localhost:8001"

def test_update_and_delete():
    print("\n[1] Creating test user...")
    email = f"update_test+{int(time.time())}@criticalrole.local"
    password = "Test@Pass123"

    requests.post(
        f"{BASE_URL}/auth/signup",
        json={"email": email, "password": password}
    )

    print("[2] Logging in...")
    login_resp = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password}
    )
    user_token = login_resp.json()['user_id']
    auth_header = f"Bearer {user_token}"

    print("[3] Creating campaign...")
    create_resp = requests.post(
        f"{BASE_URL}/campaigns",
        json={
            "slug": f"update-test-{int(time.time())}",
            "name": "Original Name",
            "description": "Original description"
        },
        headers={"Authorization": auth_header}
    )

    campaign = create_resp.json()
    campaign_id = campaign['id']
    original_token = campaign.get('admin_token')
    print(f"Campaign created with ID: {campaign_id}")
    print(f"Has admin_token: {original_token is not None}")

    print("\n[4] Updating campaign...")
    update_resp = requests.patch(
        f"{BASE_URL}/campaigns/{campaign_id}",
        json={
            "name": "Updated Name",
            "description": "Updated description"
        },
        headers={"Authorization": auth_header}
    )

    print(f"Update status: {update_resp.status_code}")
    updated = update_resp.json()
    print(f"Updated name: {updated.get('name')}")
    print(f"Updated description: {updated.get('description')}")
    print(f"Has admin_token in response: {updated.get('admin_token') is not None}")
    print(f"Token matches original: {updated.get('admin_token') == original_token}")

    print("\n[5] Fetching updated campaign...")
    get_resp = requests.get(
        f"{BASE_URL}/campaigns/{campaign_id}",
        headers={"Authorization": auth_header}
    )

    fetched = get_resp.json()
    print(f"Fetched name: {fetched.get('name')}")
    print(f"Fetched description: {fetched.get('description')}")
    print(f"Has admin_token: {fetched.get('admin_token') is not None}")

    print("\n[6] Deleting campaign...")
    delete_resp = requests.delete(
        f"{BASE_URL}/campaigns/{campaign_id}",
        headers={"Authorization": auth_header}
    )

    print(f"Delete status: {delete_resp.status_code}")

    print("[7] Verifying deletion (should return 404)...")
    verify_resp = requests.get(
        f"{BASE_URL}/campaigns/{campaign_id}",
        headers={"Authorization": auth_header}
    )

    print(f"After delete status: {verify_resp.status_code}")
    if verify_resp.status_code == 404:
        print("SUCCESS - Campaign properly deleted")
    else:
        print("ERROR - Campaign still exists")

if __name__ == "__main__":
    print("="*60)
    print("Testing Update and Delete Functionality")
    print("="*60)
    test_update_and_delete()
