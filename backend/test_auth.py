"""
Test authentication system
"""

import requests
import json
from datetime import datetime
import time

BASE_URL = "http://localhost:8001"

# Generate unique email based on timestamp to avoid conflicts
unique_email = f"testdm+{int(time.time())}@criticalrole.local"

print("=" * 80)
print("AUTHENTICATION SYSTEM TEST")
print("=" * 80)
print()

# Test 1: Signup
print("[1] Testing Signup...")
print("-" * 80)

signup_payload = {
    "email": unique_email,
    "password": "SecurePassword123!"
}

print(f"Using unique email: {unique_email}")
print()

try:
    response = requests.post(f"{BASE_URL}/auth/signup", json=signup_payload)
    print(f"Status: {response.status_code}")

    if response.status_code == 201:
        user_data = response.json()
        user_id = user_data["id"]
        print(f"[OK] User created!")
        print(f"  User ID: {user_id}")
        print(f"  Email: {user_data['email']}")
        print(f"  Created: {user_data['created_at']}")
    else:
        print(f"[FAIL] Signup failed: {response.text}")
        exit(1)
except Exception as e:
    print(f"[ERROR] {e}")
    exit(1)

print()

# Test 2: Login
print("[2] Testing Login...")
print("-" * 80)

login_payload = {
    "email": unique_email,
    "password": "SecurePassword123!"
}

try:
    response = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        login_data = response.json()
        returned_user_id = login_data["user_id"]
        print(f"[OK] Login successful!")
        print(f"  User ID: {returned_user_id}")
        print(f"  Email: {login_data['email']}")
        print(f"  Campaigns: {len(login_data['campaigns'])} campaigns")

        if returned_user_id != user_id:
            print(f"[WARN] User ID mismatch! Expected {user_id}, got {returned_user_id}")
    else:
        print(f"[FAIL] Login failed: {response.text}")
        exit(1)
except Exception as e:
    print(f"[ERROR] {e}")
    exit(1)

print()

# Test 3: Create Campaign with User Token
print("[3] Testing Campaign Creation (with user auth)...")
print("-" * 80)

campaign_payload = {
    "slug": "exandria-campaign-4",
    "name": "Exandria Campaign",
    "description": "Test campaign for auth system"
}

headers = {
    "Authorization": f"Bearer {user_id}"
}

try:
    response = requests.post(f"{BASE_URL}/campaigns", json=campaign_payload, headers=headers)
    print(f"Status: {response.status_code}")

    if response.status_code == 201:
        campaign_data = response.json()
        campaign_id = campaign_data["id"]
        campaign_token = campaign_data["admin_token"]
        print(f"[OK] Campaign created!")
        print(f"  Campaign ID: {campaign_id}")
        print(f"  Name: {campaign_data['name']}")
        print(f"  Campaign Token (for admin ops): {campaign_token[:20]}...")
        print(f"  Message: {campaign_data.get('message', 'N/A')}")
    else:
        print(f"[FAIL] Campaign creation failed: {response.text}")
        exit(1)
except Exception as e:
    print(f"[ERROR] {e}")
    exit(1)

print()

# Test 4: Login Again to See Campaigns
print("[4] Testing Login Again (to see campaign)...")
print("-" * 80)

try:
    response = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        login_data = response.json()
        print(f"[OK] Login successful!")
        print(f"  Campaigns: {len(login_data['campaigns'])} campaigns")

        if len(login_data['campaigns']) > 0:
            for i, campaign in enumerate(login_data['campaigns']):
                print(f"  Campaign {i+1}:")
                print(f"    ID: {campaign['id']}")
                print(f"    Name: {campaign['name']}")
                print(f"    Slug: {campaign['slug']}")
                print(f"    Token: {campaign['admin_token'][:20]}...")
        else:
            print(f"  [WARN] No campaigns found!")
    else:
        print(f"[FAIL] Login failed: {response.text}")
except Exception as e:
    print(f"[ERROR] {e}")

print()

# Test 5: Wrong Password
print("[5] Testing Login with Wrong Password...")
print("-" * 80)

wrong_login = {
    "email": unique_email,
    "password": "WrongPassword123!"
}

try:
    response = requests.post(f"{BASE_URL}/auth/login", json=wrong_login)
    print(f"Status: {response.status_code}")

    if response.status_code == 401:
        print(f"[OK] Correctly rejected wrong password!")
        print(f"  Message: {response.json()['detail']}")
    else:
        print(f"[FAIL] Should have returned 401, got {response.status_code}")
except Exception as e:
    print(f"[ERROR] {e}")

print()

# Test 6: Duplicate Email
print("[6] Testing Duplicate Email Signup...")
print("-" * 80)

try:
    response = requests.post(f"{BASE_URL}/auth/signup", json=signup_payload)
    print(f"Status: {response.status_code}")

    if response.status_code == 409:
        print(f"[OK] Correctly rejected duplicate email!")
        print(f"  Message: {response.json()['detail']}")
    else:
        print(f"[FAIL] Should have returned 409, got {response.status_code}")
except Exception as e:
    print(f"[ERROR] {e}")

print()
print("=" * 80)
print("ALL TESTS COMPLETE!")
print("=" * 80)
