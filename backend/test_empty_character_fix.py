#!/usr/bin/env python3
"""
Test script to verify the empty character array fix

This tests the complete flow:
1. Create an event with characters
2. Update to remove some characters
3. Update to remove ALL characters (empty array)
4. Verify the event shows 0 characters
5. Add characters back
"""

import requests
import json
import sys

# Configuration
API_BASE = "http://localhost:8001"


def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def print_event_info(event):
    """Print event information"""
    chars = event.get("characters_involved", [])
    char_count = len(chars) if chars else 0
    print(f"Event: {event['name']}")
    print(f"Characters: {char_count} involved")
    if chars:
        print(f"  Character IDs: {chars}")
    else:
        print("  Character IDs: []")


def test_empty_character_removal(episode_id, admin_token):
    """Test removing all characters from an event"""

    print_section("Step 1: Create Event with Characters")

    # First, get available characters
    episodes_response = requests.get(
        f"{API_BASE}/episodes/{episode_id}",
        headers={"X-Token": admin_token}
    )
    episode = episodes_response.json()
    campaign_id = episode["campaign_id"]

    # Get characters
    chars_response = requests.get(f"{API_BASE}/campaigns/{campaign_id}/characters")
    characters = chars_response.json()

    if not characters:
        print("ERROR: No characters found in campaign. Please create characters first.")
        return False

    character_ids = [c["id"] for c in characters[:2]]  # Get first 2 characters
    print(f"Found {len(characters)} characters in campaign")
    print(f"Using character IDs: {character_ids}")

    # Create event with characters
    create_payload = {
        "name": "Test Event - Character Removal",
        "description": "Testing empty character array handling",
        "characters_involved": character_ids,
    }

    response = requests.post(
        f"{API_BASE}/episodes/{episode_id}/events",
        json=create_payload,
        headers={"X-Token": admin_token}
    )

    if response.status_code != 201:
        print(f"ERROR: Failed to create event: {response.status_code}")
        print(response.text)
        return False

    event = response.json()
    event_id = event["id"]
    print(f"✓ Created event: {event_id}")
    print_event_info(event)

    # Verify characters were saved
    if len(event.get("characters_involved", [])) != len(character_ids):
        print(f"ERROR: Expected {len(character_ids)} characters, got {len(event.get('characters_involved', []))}")
        return False
    print(f"✓ Verified: {len(character_ids)} characters saved correctly")

    # Step 2: Remove one character (partial removal)
    print_section("Step 2: Remove One Character (Partial)")

    update_payload = {
        "name": "Test Event - Character Removal",
        "characters_involved": [character_ids[0]],  # Keep only first character
    }

    response = requests.patch(
        f"{API_BASE}/episodes/{episode_id}/events/{event_id}",
        json=update_payload,
        headers={"X-Token": admin_token}
    )

    if response.status_code != 200:
        print(f"ERROR: Failed to update event: {response.status_code}")
        print(response.text)
        return False

    event = response.json()
    print("✓ Updated event")
    print_event_info(event)

    if len(event.get("characters_involved", [])) != 1:
        print(f"ERROR: Expected 1 character, got {len(event.get('characters_involved', []))}")
        return False
    print("✓ Verified: 1 character remaining")

    # Step 3: Remove ALL characters (the critical test!)
    print_section("Step 3: Remove ALL Characters (Empty Array)")

    update_payload = {
        "name": "Test Event - Character Removal",
        "characters_involved": [],  # Empty array - this should work now!
    }

    print(f"Sending payload: {json.dumps(update_payload, indent=2)}")

    response = requests.patch(
        f"{API_BASE}/episodes/{episode_id}/events/{event_id}",
        json=update_payload,
        headers={"X-Token": admin_token}
    )

    if response.status_code != 200:
        print(f"ERROR: Failed to update event: {response.status_code}")
        print(response.text)
        return False

    event = response.json()
    print("✓ Updated event")
    print_event_info(event)

    # Verify empty array
    chars = event.get("characters_involved", None)
    if chars is None:
        print("ERROR: characters_involved is None (should be [])")
        return False
    if not isinstance(chars, list):
        print(f"ERROR: characters_involved is not a list: {type(chars)}")
        return False
    if len(chars) != 0:
        print(f"ERROR: Expected 0 characters, got {len(chars)}: {chars}")
        return False

    print("✓ Verified: characters_involved = [] (empty array)")

    # Step 4: Fetch the event again to verify persistence
    print_section("Step 4: Verify Persistence (Fetch Again)")

    response = requests.get(
        f"{API_BASE}/episodes/{episode_id}/events",
        headers={"X-Token": admin_token}
    )

    if response.status_code != 200:
        print(f"ERROR: Failed to fetch events: {response.status_code}")
        return False

    events = response.json()
    event = next((e for e in events if e["id"] == event_id), None)

    if not event:
        print("ERROR: Event not found in list")
        return False

    print_event_info(event)

    chars = event.get("characters_involved", None)
    if chars is None or len(chars) != 0:
        print(f"ERROR: After refetch, expected [], got {chars}")
        return False

    print("✓ Verified: Empty array persisted correctly")

    # Step 5: Add characters back
    print_section("Step 5: Add Characters Back")

    update_payload = {
        "name": "Test Event - Character Removal",
        "characters_involved": character_ids,
    }

    response = requests.patch(
        f"{API_BASE}/episodes/{episode_id}/events/{event_id}",
        json=update_payload,
        headers={"X-Token": admin_token}
    )

    if response.status_code != 200:
        print(f"ERROR: Failed to update event: {response.status_code}")
        return False

    event = response.json()
    print("✓ Updated event")
    print_event_info(event)

    if len(event.get("characters_involved", [])) != len(character_ids):
        print(f"ERROR: Expected {len(character_ids)} characters, got {len(event.get('characters_involved', []))}")
        return False

    print(f"✓ Verified: {len(character_ids)} characters restored")

    # Cleanup: Delete the test event
    print_section("Cleanup: Delete Test Event")

    response = requests.delete(
        f"{API_BASE}/episodes/{episode_id}/events/{event_id}",
        headers={"X-Token": admin_token}
    )

    if response.status_code == 204 or response.status_code == 200:
        print("✓ Test event deleted")
    else:
        print(f"WARNING: Failed to delete test event: {response.status_code}")

    return True


def main():
    """Main test function"""
    print("\n" + "=" * 70)
    print("  EMPTY CHARACTER ARRAY FIX - VERIFICATION TEST")
    print("=" * 70)

    # Get test parameters
    print("\nPlease provide test parameters:")
    episode_id = input("Episode ID: ").strip()
    admin_token = input("Admin Token: ").strip()

    if not episode_id or not admin_token:
        print("\nERROR: Episode ID and Admin Token are required")
        sys.exit(1)

    # Run the test
    success = test_empty_character_removal(episode_id, admin_token)

    # Print results
    print_section("TEST RESULTS")
    if success:
        print("✅ ALL TESTS PASSED!")
        print("\nThe fix is working correctly:")
        print("  • Events can be created with characters")
        print("  • Characters can be removed partially")
        print("  • ALL characters can be removed (empty array)")
        print("  • Empty array persists correctly in database")
        print("  • Characters can be added back")
        sys.exit(0)
    else:
        print("❌ TESTS FAILED")
        print("\nThe issue is not fully resolved.")
        sys.exit(1)


if __name__ == "__main__":
    main()
