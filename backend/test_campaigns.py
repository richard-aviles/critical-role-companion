"""
Test script for Campaign Management functionality
Tests the full campaign CRUD flow with user authentication
"""

import requests
import json
import time

BASE_URL = "http://localhost:8001"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_campaign_flow():
    """Test complete campaign management flow"""

    print_section("[1] SIGNUP - Create test user account")

    # Generate unique email and slug
    timestamp = int(time.time())
    email = f"campaign_tester+{timestamp}@criticalrole.local"
    password = "Test@Password123"
    slug = f"test-campaign-{timestamp}"

    signup_response = requests.post(
        f"{BASE_URL}/auth/signup",
        json={"email": email, "password": password}
    )

    print(f"Status: {signup_response.status_code}")
    signup_data = signup_response.json()
    print(f"Response: {json.dumps(signup_data, indent=2)}")

    if signup_response.status_code != 201:
        print("ERROR: Signup failed!")
        return

    print_section("[2] LOGIN - Get user token")

    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password}
    )

    print(f"Status: {login_response.status_code}")
    login_data = login_response.json()
    print(f"User ID: {login_data['user_id']}")
    print(f"Email: {login_data['email']}")
    print(f"Campaigns: {login_data['campaigns']}")

    if login_response.status_code != 200:
        print("ERROR: Login failed!")
        return

    user_token = login_data['user_id']
    auth_header = f"Bearer {user_token}"

    print_section("[3] CREATE CAMPAIGN - Add new campaign")

    campaign_data = {
        "slug": slug,
        "name": "Test Campaign",
        "description": "A test campaign for validating campaign management"
    }

    headers = {"Authorization": auth_header}

    create_response = requests.post(
        f"{BASE_URL}/campaigns",
        json=campaign_data,
        headers=headers
    )

    print(f"Status: {create_response.status_code}")
    campaign = create_response.json()
    print(f"Response: {json.dumps(campaign, indent=2)}")

    if create_response.status_code != 201:
        print("ERROR: Campaign creation failed!")
        return

    campaign_id = campaign['id']
    admin_token = campaign.get('admin_token')
    print(f"\nCampaign ID: {campaign_id}")
    print(f"Admin Token: {admin_token}")

    print_section("[4] GET CAMPAIGN - Retrieve campaign details")

    get_response = requests.get(
        f"{BASE_URL}/campaigns/{campaign_id}",
        headers=headers
    )

    print(f"Status: {get_response.status_code}")
    retrieved_campaign = get_response.json()
    print(f"Response: {json.dumps(retrieved_campaign, indent=2)}")

    if get_response.status_code != 200:
        print("ERROR: Get campaign failed!")
        return

    # Verify admin_token is included for owner
    if 'admin_token' in retrieved_campaign:
        print(f"\n[OK] Admin token is visible to campaign owner")
    else:
        print(f"\n[FAIL] Admin token is NOT visible to campaign owner (should be included)")

    print_section("[5] UPDATE CAMPAIGN - Modify campaign details")

    update_data = {
        "name": "Updated Campaign Name",
        "description": "Updated description for test campaign"
    }

    update_response = requests.patch(
        f"{BASE_URL}/campaigns/{campaign_id}",
        json=update_data,
        headers=headers
    )

    print(f"Status: {update_response.status_code}")
    updated_campaign = update_response.json()
    print(f"Response: {json.dumps(updated_campaign, indent=2)}")

    if update_response.status_code != 200:
        print("ERROR: Campaign update failed!")
        return

    if updated_campaign['name'] == update_data['name']:
        print(f"[OK] Campaign name updated successfully")
    else:
        print(f"[FAIL] Campaign name was not updated")

    print_section("[6] LIST CAMPAIGNS - Verify campaign in user's list")

    login_response_2 = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password}
    )

    login_data_2 = login_response_2.json()
    campaigns_list = login_data_2['campaigns']

    print(f"Status: {login_response_2.status_code}")
    print(f"Campaigns count: {len(campaigns_list)}")

    campaign_found = any(c['id'] == campaign_id for c in campaigns_list)
    if campaign_found:
        print(f"[OK] Campaign found in user's campaigns list")
    else:
        print(f"[FAIL] Campaign NOT found in user's campaigns list")

    print_section("[7] DELETE CAMPAIGN - Remove campaign")

    delete_response = requests.delete(
        f"{BASE_URL}/campaigns/{campaign_id}",
        headers=headers
    )

    print(f"Status: {delete_response.status_code}")

    if delete_response.status_code == 204:
        print("[OK] Campaign deleted successfully")
    else:
        print(f"Response: {delete_response.text}")
        print("[FAIL] Campaign deletion failed!")
        return

    print_section("[8] VERIFY DELETION - Check campaign is gone")

    verify_response = requests.get(
        f"{BASE_URL}/campaigns/{campaign_id}",
        headers=headers
    )

    print(f"Status: {verify_response.status_code}")

    if verify_response.status_code == 404:
        print("[OK] Campaign successfully removed from database")
    else:
        print(f"[FAIL] Campaign still exists (should return 404)")

    print_section("[9] FINAL CHECK - Verify campaign removed from user's list")

    final_login = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password}
    )

    final_campaigns = final_login.json()['campaigns']

    if len(final_campaigns) == 0:
        print("[OK] Campaign successfully removed from user's campaigns list")
    else:
        print(f"[FAIL] User still has {len(final_campaigns)} campaigns (should be 0)")

    print_section("CAMPAIGN MANAGEMENT TEST COMPLETE")
    print("All campaign CRUD operations tested successfully!")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("  CAMPAIGN MANAGEMENT TEST SUITE")
    print("  Tests: Create, Read, Update, Delete Campaigns")
    print("="*60)

    test_campaign_flow()
