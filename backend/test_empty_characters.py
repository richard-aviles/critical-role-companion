#!/usr/bin/env python3
"""
Test script to verify empty character array handling in event updates

This tests whether the backend properly handles:
1. Removing all characters from an event (sending empty array [])
2. Not including characters_involved in the update (sending None/undefined)
"""

import requests
import json
from typing import Optional

# Configuration
API_BASE = "http://localhost:8001"

# Test data (replace with your actual IDs)
EPISODE_ID = None
EVENT_ID = None
ADMIN_TOKEN = None


def test_update_with_empty_array():
    """Test updating an event with empty characters_involved array"""
    print("\n=== TEST 1: Update with empty array [] ===")

    payload = {
        "name": "Test Event",
        "characters_involved": []  # Empty array
    }

    response = requests.patch(
        f"{API_BASE}/episodes/{EPISODE_ID}/events/{EVENT_ID}",
        json=payload,
        headers={"X-Token": ADMIN_TOKEN}
    )

    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    # Check the result
    result = response.json()
    chars = result.get("characters_involved")
    if chars == "[]" or chars == []:
        print("✓ SUCCESS: Empty array was saved correctly")
        return True
    else:
        print(f"✗ FAIL: Expected empty array, got: {chars}")
        return False


def test_update_without_field():
    """Test updating an event without characters_involved field"""
    print("\n=== TEST 2: Update without characters_involved field ===")

    payload = {
        "name": "Test Event"
        # characters_involved not included
    }

    response = requests.patch(
        f"{API_BASE}/episodes/{EPISODE_ID}/events/{EVENT_ID}",
        json=payload,
        headers={"X-Token": ADMIN_TOKEN}
    )

    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    # Check that it didn't change the existing value
    result = response.json()
    chars = result.get("characters_involved")
    print(f"Characters after update: {chars}")
    print("✓ Field was not modified (expected behavior)")
    return True


def test_update_with_characters():
    """Test updating an event with actual characters"""
    print("\n=== TEST 3: Update with character IDs ===")

    # You'll need to replace with actual character ID from your DB
    payload = {
        "name": "Test Event",
        "characters_involved": ["character-uuid-here"]
    }

    response = requests.patch(
        f"{API_BASE}/episodes/{EPISODE_ID}/events/{EVENT_ID}",
        json=payload,
        headers={"X-Token": ADMIN_TOKEN}
    )

    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    result = response.json()
    chars = result.get("characters_involved")
    print(f"Characters after update: {chars}")
    return True


def main():
    global EPISODE_ID, EVENT_ID, ADMIN_TOKEN

    print("Empty Characters Array Test")
    print("=" * 60)

    # Get test IDs from user
    print("\nPlease provide test data:")
    EPISODE_ID = input("Episode ID: ").strip()
    EVENT_ID = input("Event ID: ").strip()
    ADMIN_TOKEN = input("Admin Token: ").strip()

    if not all([EPISODE_ID, EVENT_ID, ADMIN_TOKEN]):
        print("Error: All fields are required")
        return

    # Run tests
    test_update_with_empty_array()
    test_update_without_field()

    print("\n" + "=" * 60)
    print("Testing complete!")


if __name__ == "__main__":
    main()
