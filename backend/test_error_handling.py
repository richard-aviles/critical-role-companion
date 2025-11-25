"""
Test error handling and error messages
Verifies that proper error messages are returned for various failure scenarios
"""
import requests
import time
import sys
import io
import random
import string

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8001"

def print_section(title):
    print("\n" + "=" * 60)
    print(title)
    print("=" * 60)

def test_error_handling():
    print_section("TESTING ERROR HANDLING & ERROR MESSAGES")

    # Wait for server
    print("\n[Setup] Waiting for server...")
    for i in range(30):
        try:
            requests.get(f"{BASE_URL}/healthz", timeout=2)
            print("[OK] Server ready")
            break
        except:
            pass
        time.sleep(1)

    # Create test data
    print("\n[Setup] Creating test user and campaign...")
    rand_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"testuser{rand_str}@example.com"

    signup = requests.post(f"{BASE_URL}/auth/signup", json={"email": email, "password": "testpass123"})
    if signup.status_code not in [200, 201]:
        print(f"[ERROR] Signup failed: {signup.json().get('detail', signup.text)}")
        return

    user_id = signup.json()["id"]
    requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": "testpass123"})

    campaign_slug = f"campaign-{random.randint(100000, 999999)}"
    campaign = requests.post(
        f"{BASE_URL}/campaigns",
        json={"slug": campaign_slug, "name": "Test Campaign"},
        headers={"Authorization": user_id}
    )
    campaign_id = campaign.json()["id"]
    admin_token = campaign.json()["admin_token"]
    print(f"[OK] Test campaign created: {campaign_id}")

    # Create a character for testing
    print("\n[Setup] Creating test character...")
    char = requests.post(
        f"{BASE_URL}/campaigns/{campaign_id}/characters",
        json={
            "name": "TestChar",
            "class_name": "Wizard",
            "race": "Human",
            "description": "Test description",
            "backstory": "Test backstory"
        },
        headers={"X-Token": admin_token}
    )
    if char.status_code not in [200, 201]:
        print(f"[ERROR] Character creation failed: {char.text}")
        return

    character_id = char.json()["id"]
    print(f"[OK] Test character created: {character_id}")

    # Test Results
    results = []
    total_tests = 0
    passed_tests = 0

    # TEST 1: Missing auth token
    print_section("TEST 1: Missing Auth Token")
    total_tests += 1
    try:
        resp = requests.get(f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}")
        if resp.status_code in [401, 403]:
            print(f"[OK] Got expected error: {resp.status_code}")
            print(f"    Message: {resp.json().get('detail', resp.text)}")
            results.append(("Missing auth token", "PASS"))
            passed_tests += 1
        else:
            print(f"[FAIL] Expected 401/403, got {resp.status_code}")
            results.append(("Missing auth token", "FAIL"))
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        results.append(("Missing auth token", "ERROR"))

    # TEST 2: Invalid auth token
    print_section("TEST 2: Invalid Auth Token")
    total_tests += 1
    try:
        resp = requests.get(
            f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
            headers={"X-Token": "invalid_token_12345"}
        )
        if resp.status_code in [401, 403]:
            print(f"[OK] Got expected error: {resp.status_code}")
            print(f"    Message: {resp.json().get('detail', resp.text)}")
            results.append(("Invalid auth token", "PASS"))
            passed_tests += 1
        else:
            print(f"[FAIL] Expected 401/403, got {resp.status_code}")
            results.append(("Invalid auth token", "FAIL"))
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        results.append(("Invalid auth token", "ERROR"))

    # TEST 3: Invalid campaign ID
    print_section("TEST 3: Invalid Campaign ID")
    total_tests += 1
    try:
        fake_campaign_id = "invalid-campaign-id-99999999"
        resp = requests.get(
            f"{BASE_URL}/campaigns/{fake_campaign_id}/characters/{character_id}",
            headers={"X-Token": admin_token}
        )
        if resp.status_code in [403, 404]:
            print(f"[OK] Got expected error: {resp.status_code}")
            print(f"    Message: {resp.json().get('detail', resp.text)}")
            results.append(("Invalid campaign ID", "PASS"))
            passed_tests += 1
        else:
            print(f"[FAIL] Expected 403/404, got {resp.status_code}")
            results.append(("Invalid campaign ID", "FAIL"))
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        results.append(("Invalid campaign ID", "ERROR"))

    # TEST 4: Invalid character ID
    print_section("TEST 4: Invalid Character ID")
    total_tests += 1
    try:
        fake_char_id = "invalid-char-id-99999999"
        resp = requests.get(
            f"{BASE_URL}/campaigns/{campaign_id}/characters/{fake_char_id}",
            headers={"X-Token": admin_token}
        )
        if resp.status_code == 404:
            print(f"[OK] Got expected 404")
            print(f"    Message: {resp.json().get('detail', resp.text)}")
            results.append(("Invalid character ID", "PASS"))
            passed_tests += 1
        else:
            print(f"[FAIL] Expected 404, got {resp.status_code}")
            results.append(("Invalid character ID", "FAIL"))
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        results.append(("Invalid character ID", "ERROR"))

    # TEST 5: Missing required field on create
    print_section("TEST 5: Missing Required Field (Create)")
    total_tests += 1
    try:
        resp = requests.post(
            f"{BASE_URL}/campaigns/{campaign_id}/characters",
            json={
                "class_name": "Wizard",
                "race": "Human"
                # Missing 'name' field
            },
            headers={"X-Token": admin_token}
        )
        if resp.status_code in [400, 422]:
            print(f"[OK] Got expected error: {resp.status_code}")
            print(f"    Message: {resp.json().get('detail', resp.text)}")
            results.append(("Missing required field (create)", "PASS"))
            passed_tests += 1
        else:
            print(f"[FAIL] Expected 400/422, got {resp.status_code}")
            print(f"    Response: {resp.text}")
            results.append(("Missing required field (create)", "FAIL"))
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        results.append(("Missing required field (create)", "ERROR"))

    # TEST 6: Invalid data type
    print_section("TEST 6: Invalid Data Type")
    total_tests += 1
    try:
        resp = requests.post(
            f"{BASE_URL}/campaigns/{campaign_id}/characters",
            json={
                "name": "TestChar",
                "class_name": "Wizard",
                "race": "Human",
                "description": "Test",
                "backstory": "Test",
                "created_at": "invalid-date"  # Invalid format
            },
            headers={"X-Token": admin_token}
        )
        if resp.status_code in [400, 422]:
            print(f"[OK] Got expected error: {resp.status_code}")
            print(f"    Message: {resp.json().get('detail', resp.text)}")
            results.append(("Invalid data type", "PASS"))
            passed_tests += 1
        else:
            print(f"[FAIL] Expected 400/422, got {resp.status_code}")
            results.append(("Invalid data type", "FAIL"))
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        results.append(("Invalid data type", "ERROR"))

    # TEST 7: Update non-existent character
    print_section("TEST 7: Update Non-Existent Character")
    total_tests += 1
    try:
        fake_char_id = "fake-char-id-99999999"
        resp = requests.patch(
            f"{BASE_URL}/campaigns/{campaign_id}/characters/{fake_char_id}",
            json={"class_name": "Rogue"},
            headers={"X-Token": admin_token}
        )
        if resp.status_code == 404:
            print(f"[OK] Got expected 404")
            print(f"    Message: {resp.json().get('detail', resp.text)}")
            results.append(("Update non-existent character", "PASS"))
            passed_tests += 1
        else:
            print(f"[FAIL] Expected 404, got {resp.status_code}")
            results.append(("Update non-existent character", "FAIL"))
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        results.append(("Update non-existent character", "ERROR"))

    # TEST 8: Delete non-existent character
    print_section("TEST 8: Delete Non-Existent Character")
    total_tests += 1
    try:
        fake_char_id = "fake-char-id-99999999"
        resp = requests.delete(
            f"{BASE_URL}/campaigns/{campaign_id}/characters/{fake_char_id}",
            headers={"X-Token": admin_token}
        )
        if resp.status_code == 404:
            print(f"[OK] Got expected 404")
            print(f"    Message: {resp.json().get('detail', resp.text)}")
            results.append(("Delete non-existent character", "PASS"))
            passed_tests += 1
        else:
            print(f"[FAIL] Expected 404, got {resp.status_code}")
            results.append(("Delete non-existent character", "FAIL"))
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        results.append(("Delete non-existent character", "ERROR"))

    # TEST 9: Create episode with invalid campaign
    print_section("TEST 9: Create Episode Invalid Campaign")
    total_tests += 1
    try:
        fake_campaign_id = "fake-campaign-id-99999999"
        resp = requests.post(
            f"{BASE_URL}/campaigns/{fake_campaign_id}/episodes",
            json={
                "episode_number": 1,
                "title": "Test Episode",
                "description": "Test description"
            },
            headers={"X-Token": admin_token}
        )
        if resp.status_code in [403, 404]:
            print(f"[OK] Got expected error: {resp.status_code}")
            print(f"    Message: {resp.json().get('detail', resp.text)}")
            results.append(("Create episode invalid campaign", "PASS"))
            passed_tests += 1
        else:
            print(f"[FAIL] Expected 403/404, got {resp.status_code}")
            results.append(("Create episode invalid campaign", "FAIL"))
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        results.append(("Create episode invalid campaign", "ERROR"))

    # TEST 10: Wrong token for campaign
    print_section("TEST 10: Wrong Token for Campaign")
    total_tests += 1
    try:
        # Create a second campaign with different token
        campaign_slug2 = f"campaign-{random.randint(100000, 999999)}"
        campaign2 = requests.post(
            f"{BASE_URL}/campaigns",
            json={"slug": campaign_slug2, "name": "Campaign 2"},
            headers={"Authorization": user_id}
        )
        admin_token2 = campaign2.json()["admin_token"]

        # Try to access first campaign with second token
        resp = requests.get(
            f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
            headers={"X-Token": admin_token2}
        )
        if resp.status_code in [403, 404]:
            print(f"[OK] Got expected error: {resp.status_code}")
            print(f"    Message: {resp.json().get('detail', resp.text)}")
            results.append(("Wrong token for campaign", "PASS"))
            passed_tests += 1
        else:
            print(f"[FAIL] Expected 403/404, got {resp.status_code}")
            results.append(("Wrong token for campaign", "FAIL"))
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        results.append(("Wrong token for campaign", "ERROR"))

    # Print Summary
    print_section("SUMMARY")
    print(f"\nTotal Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"\nTest Results:")
    for test_name, result in results:
        status_symbol = "✓" if result == "PASS" else "✗" if result == "FAIL" else "?"
        print(f"  {status_symbol} {test_name}: {result}")

    all_passed = passed_tests == total_tests
    print("\n" + "=" * 60)
    if all_passed:
        print("SUCCESS! All error handling tests passed!")
    else:
        print(f"PARTIAL SUCCESS - {passed_tests}/{total_tests} tests passed")
    print("=" * 60)

if __name__ == "__main__":
    test_error_handling()
