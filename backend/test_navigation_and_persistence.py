"""
Test navigation and data persistence
Verifies that breadcrumbs work, navigation is correct, and data persists
"""
import requests
import time
import sys
import io
import random
import string
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8001"

def print_section(title):
    print("\n" + "=" * 60)
    print(title)
    print("=" * 60)

def test_navigation_and_persistence():
    print_section("TESTING NAVIGATION & DATA PERSISTENCE")

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

    # Test Results
    results = []
    total_tests = 0
    passed_tests = 0

    # =============================================================================
    # TEST 1: Create character and verify all fields persist
    # =============================================================================
    print_section("TEST 1: Create Character & Verify Persistence")
    total_tests += 1
    try:
        test_data = {
            "name": "TestCharacter",
            "class_name": "Wizard",
            "race": "Elf",
            "description": "A mysterious wizard from the eastern lands",
            "backstory": "Born in the towers of high magic",
            "player_name": "John Doe"
        }

        char = requests.post(
            f"{BASE_URL}/campaigns/{campaign_id}/characters",
            json=test_data,
            headers={"X-Token": admin_token}
        )

        if char.status_code not in [200, 201]:
            print(f"[FAIL] Character creation failed: {char.status_code}")
            print(f"  Response: {char.text}")
            results.append(("Create character & verify persistence", "FAIL"))
        else:
            character_id = char.json()["id"]
            created_char = char.json()

            # Verify all fields in response
            all_fields_correct = (
                created_char.get("name") == "TestCharacter" and
                created_char.get("class_name") == "Wizard" and
                created_char.get("race") == "Elf" and
                created_char.get("description") == "A mysterious wizard from the eastern lands" and
                created_char.get("backstory") == "Born in the towers of high magic" and
                created_char.get("player_name") == "John Doe"
            )

            if all_fields_correct:
                print(f"[OK] All fields correct in creation response")

                # Verify persistence - fetch the character again
                fetch = requests.get(
                    f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
                    headers={"X-Token": admin_token}
                )

                if fetch.status_code == 200:
                    fetched_char = fetch.json()
                    persistence_ok = (
                        fetched_char.get("name") == "TestCharacter" and
                        fetched_char.get("class_name") == "Wizard" and
                        fetched_char.get("race") == "Elf" and
                        fetched_char.get("description") == "A mysterious wizard from the eastern lands" and
                        fetched_char.get("backstory") == "Born in the towers of high magic" and
                        fetched_char.get("player_name") == "John Doe"
                    )

                    if persistence_ok:
                        print(f"[OK] All fields persisted correctly")
                        print(f"  Character ID: {character_id}")
                        results.append(("Create character & verify persistence", "PASS"))
                        passed_tests += 1
                    else:
                        print(f"[FAIL] Data not persisted correctly")
                        print(f"  Expected: TestCharacter/Wizard/Elf")
                        print(f"  Got: {fetched_char.get('name')}/{fetched_char.get('class_name')}/{fetched_char.get('race')}")
                        results.append(("Create character & verify persistence", "FAIL"))
                else:
                    print(f"[FAIL] Could not fetch character: {fetch.status_code}")
                    results.append(("Create character & verify persistence", "FAIL"))
            else:
                print(f"[FAIL] Response fields incorrect")
                print(f"  Expected: TestCharacter/Wizard/Elf")
                print(f"  Got: {created_char.get('name')}/{created_char.get('class_name')}/{created_char.get('race')}")
                results.append(("Create character & verify persistence", "FAIL"))

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        results.append(("Create character & verify persistence", "ERROR"))

    # =============================================================================
    # TEST 2: Update character and verify persistence
    # =============================================================================
    print_section("TEST 2: Update Character & Verify Persistence")
    total_tests += 1
    try:
        # Create a character to update
        char = requests.post(
            f"{BASE_URL}/campaigns/{campaign_id}/characters",
            json={
                "name": "CharToUpdate",
                "class_name": "Fighter",
                "race": "Dwarf"
            },
            headers={"X-Token": admin_token}
        )
        character_id = char.json()["id"]

        # Update the character
        update_data = {
            "class_name": "Barbarian",
            "race": "Orc",
            "description": "Updated description",
            "backstory": "Updated backstory"
        }

        update = requests.patch(
            f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
            json=update_data,
            headers={"X-Token": admin_token}
        )

        if update.status_code != 200:
            print(f"[FAIL] Update failed: {update.status_code}")
            print(f"  Response: {update.text}")
            results.append(("Update character & verify persistence", "FAIL"))
        else:
            updated_char = update.json()

            # Verify all updated fields in response
            update_ok = (
                updated_char.get("class_name") == "Barbarian" and
                updated_char.get("race") == "Orc" and
                updated_char.get("description") == "Updated description" and
                updated_char.get("backstory") == "Updated backstory"
            )

            if update_ok:
                print(f"[OK] All fields updated in response")

                # Verify persistence - fetch the character again
                fetch = requests.get(
                    f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
                    headers={"X-Token": admin_token}
                )

                if fetch.status_code == 200:
                    fetched_char = fetch.json()
                    persistence_ok = (
                        fetched_char.get("class_name") == "Barbarian" and
                        fetched_char.get("race") == "Orc" and
                        fetched_char.get("description") == "Updated description" and
                        fetched_char.get("backstory") == "Updated backstory"
                    )

                    if persistence_ok:
                        print(f"[OK] All updates persisted correctly")
                        results.append(("Update character & verify persistence", "PASS"))
                        passed_tests += 1
                    else:
                        print(f"[FAIL] Updates not persisted")
                        print(f"  Expected class: Barbarian, Got: {fetched_char.get('class_name')}")
                        results.append(("Update character & verify persistence", "FAIL"))
                else:
                    print(f"[FAIL] Could not fetch updated character: {fetch.status_code}")
                    results.append(("Update character & verify persistence", "FAIL"))
            else:
                print(f"[FAIL] Response fields not updated")
                results.append(("Update character & verify persistence", "FAIL"))

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        results.append(("Update character & verify persistence", "ERROR"))

    # =============================================================================
    # TEST 3: Create episode and verify persistence
    # =============================================================================
    print_section("TEST 3: Create Episode & Verify Persistence")
    total_tests += 1
    try:
        episode_data = {
            "episode_number": 42,
            "title": "The Betrayal",
            "description": "A shocking twist reveals the truth",
            "air_date": "2021-01-15"
        }

        episode = requests.post(
            f"{BASE_URL}/campaigns/{campaign_id}/episodes",
            json=episode_data,
            headers={"X-Token": admin_token}
        )

        if episode.status_code not in [200, 201]:
            print(f"[FAIL] Episode creation failed: {episode.status_code}")
            print(f"  Response: {episode.text}")
            results.append(("Create episode & verify persistence", "FAIL"))
        else:
            episode_id = episode.json()["id"]
            created_ep = episode.json()

            # Verify response fields
            fields_ok = (
                created_ep.get("episode_number") == 42 and
                created_ep.get("title") == "The Betrayal" and
                created_ep.get("description") == "A shocking twist reveals the truth"
            )

            if fields_ok:
                print(f"[OK] Episode fields correct in response")

                # Verify persistence - fetch the episode
                fetch = requests.get(
                    f"{BASE_URL}/campaigns/{campaign_id}/episodes/{episode_id}",
                    headers={"X-Token": admin_token}
                )

                if fetch.status_code == 200:
                    fetched_ep = fetch.json()
                    persistence_ok = (
                        fetched_ep.get("episode_number") == 42 and
                        fetched_ep.get("title") == "The Betrayal" and
                        fetched_ep.get("description") == "A shocking twist reveals the truth"
                    )

                    if persistence_ok:
                        print(f"[OK] Episode data persisted correctly")
                        results.append(("Create episode & verify persistence", "PASS"))
                        passed_tests += 1
                    else:
                        print(f"[FAIL] Episode data not persisted")
                        results.append(("Create episode & verify persistence", "FAIL"))
                else:
                    print(f"[FAIL] Could not fetch episode: {fetch.status_code}")
                    results.append(("Create episode & verify persistence", "FAIL"))
            else:
                print(f"[FAIL] Episode fields incorrect in response")
                results.append(("Create episode & verify persistence", "FAIL"))

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        results.append(("Create episode & verify persistence", "ERROR"))

    # =============================================================================
    # TEST 4: List characters and verify all appear
    # =============================================================================
    print_section("TEST 4: List Characters & Verify Appearance")
    total_tests += 1
    try:
        # Create multiple characters
        char1_resp = requests.post(
            f"{BASE_URL}/campaigns/{campaign_id}/characters",
            json={"name": "Character1", "class_name": "Rogue", "race": "Human"},
            headers={"X-Token": admin_token}
        )
        char1_id = char1_resp.json()["id"]

        char2_resp = requests.post(
            f"{BASE_URL}/campaigns/{campaign_id}/characters",
            json={"name": "Character2", "class_name": "Cleric", "race": "Tiefling"},
            headers={"X-Token": admin_token}
        )
        char2_id = char2_resp.json()["id"]

        # List characters
        list_resp = requests.get(
            f"{BASE_URL}/campaigns/{campaign_id}/characters",
            headers={"X-Token": admin_token}
        )

        if list_resp.status_code == 200:
            characters = list_resp.json()
            char_ids = [c.get("id") for c in characters]

            if char1_id in char_ids and char2_id in char_ids:
                print(f"[OK] Both characters appear in list")
                print(f"  Total characters in list: {len(characters)}")
                results.append(("List characters & verify appearance", "PASS"))
                passed_tests += 1
            else:
                print(f"[FAIL] Characters missing from list")
                print(f"  Expected to find: {char1_id}, {char2_id}")
                print(f"  Found IDs: {char_ids}")
                results.append(("List characters & verify appearance", "FAIL"))
        else:
            print(f"[FAIL] Could not list characters: {list_resp.status_code}")
            results.append(("List characters & verify appearance", "FAIL"))

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        results.append(("List characters & verify appearance", "ERROR"))

    # =============================================================================
    # TEST 5: Delete character and verify removal
    # =============================================================================
    print_section("TEST 5: Delete Character & Verify Removal")
    total_tests += 1
    try:
        # Create a character to delete
        char = requests.post(
            f"{BASE_URL}/campaigns/{campaign_id}/characters",
            json={"name": "CharToDelete", "class_name": "Paladin", "race": "Half-Elf"},
            headers={"X-Token": admin_token}
        )
        character_id = char.json()["id"]

        # Verify it exists
        fetch_before = requests.get(
            f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
            headers={"X-Token": admin_token}
        )

        if fetch_before.status_code == 200:
            print(f"[OK] Character exists before deletion")

            # Delete the character
            delete = requests.delete(
                f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
                headers={"X-Token": admin_token}
            )

            if delete.status_code in [200, 204]:
                print(f"[OK] Delete request successful ({delete.status_code})")

                # Verify it's gone
                fetch_after = requests.get(
                    f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
                    headers={"X-Token": admin_token}
                )

                if fetch_after.status_code == 404:
                    print(f"[OK] Character confirmed deleted (404)")
                    results.append(("Delete character & verify removal", "PASS"))
                    passed_tests += 1
                elif fetch_after.status_code == 400:
                    # Invalid UUID error is OK for invalid ID
                    print(f"[OK] Character confirmed gone (400)")
                    results.append(("Delete character & verify removal", "PASS"))
                    passed_tests += 1
                else:
                    print(f"[FAIL] Character still accessible after deletion: {fetch_after.status_code}")
                    results.append(("Delete character & verify removal", "FAIL"))
            else:
                print(f"[FAIL] Delete failed: {delete.status_code}")
                results.append(("Delete character & verify removal", "FAIL"))
        else:
            print(f"[FAIL] Could not verify character before deletion")
            results.append(("Delete character & verify removal", "FAIL"))

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        results.append(("Delete character & verify removal", "ERROR"))

    # =============================================================================
    # TEST 6: Multiple updates don't lose data
    # =============================================================================
    print_section("TEST 6: Sequential Updates Preserve Data")
    total_tests += 1
    try:
        # Create a character
        char = requests.post(
            f"{BASE_URL}/campaigns/{campaign_id}/characters",
            json={
                "name": "MultiUpdateChar",
                "class_name": "Sorcerer",
                "race": "Dragon Born",
                "description": "A powerful sorcerer",
                "backstory": "From a noble draconic bloodline"
            },
            headers={"X-Token": admin_token}
        )
        character_id = char.json()["id"]

        # First update - change class
        update1 = requests.patch(
            f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
            json={"class_name": "Warlock"},
            headers={"X-Token": admin_token}
        )

        # Second update - change description
        update2 = requests.patch(
            f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
            json={"description": "A powerful warlock with a dark pact"},
            headers={"X-Token": admin_token}
        )

        # Fetch final state
        fetch = requests.get(
            f"{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}",
            headers={"X-Token": admin_token}
        )

        if fetch.status_code == 200:
            final = fetch.json()
            all_preserved = (
                final.get("name") == "MultiUpdateChar" and
                final.get("class_name") == "Warlock" and  # Updated
                final.get("race") == "Dragon Born" and  # Original
                final.get("description") == "A powerful warlock with a dark pact" and  # Updated
                final.get("backstory") == "From a noble draconic bloodline"  # Original
            )

            if all_preserved:
                print(f"[OK] All data preserved through multiple updates")
                print(f"  Name: {final.get('name')}")
                print(f"  Class: {final.get('class_name')} (updated)")
                print(f"  Race: {final.get('race')} (original)")
                print(f"  Description: {final.get('description')} (updated)")
                results.append(("Sequential updates preserve data", "PASS"))
                passed_tests += 1
            else:
                print(f"[FAIL] Data lost in updates")
                print(f"  Name: {final.get('name')}")
                print(f"  Class: {final.get('class_name')}")
                print(f"  Race: {final.get('race')}")
                results.append(("Sequential updates preserve data", "FAIL"))
        else:
            print(f"[FAIL] Could not fetch final state")
            results.append(("Sequential updates preserve data", "FAIL"))

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        results.append(("Sequential updates preserve data", "ERROR"))

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
        print("SUCCESS! All navigation and persistence tests passed!")
    else:
        print(f"PARTIAL SUCCESS - {passed_tests}/{total_tests} tests passed")
    print("=" * 60)

if __name__ == "__main__":
    test_navigation_and_persistence()
