"""
Integration tests for character color theme override endpoints
Tests the complete workflow: set override, get colors, clear override
"""

import requests
import json
import uuid
from datetime import datetime
import sys
import io

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE_URL = "http://localhost:8001"

# Test data
TEST_OVERRIDE_COLORS = {
    "border_colors": ["#FF0000", "#00FF00", "#0000FF", "#FFFF00"],
    "text_color": "#FFFFFF",
    "badge_interior_gradient": {
        "type": "radial",
        "colors": ["#FF69B4", "#C71585"]
    },
    "hp_color": {
        "border": "#FF0000",
        "interior_gradient": {
            "type": "radial",
            "colors": ["#FF6B6B", "#CC0000"]
        }
    },
    "ac_color": {
        "border": "#808080",
        "interior_gradient": {
            "type": "radial",
            "colors": ["#A9A9A9", "#696969"]
        }
    }
}

class TestCharacterColorOverrides:
    """Test character color override endpoints"""

    def __init__(self):
        self.campaign_id = None
        self.character_id = None
        self.admin_token = None
        self.test_results = []

    def log_test(self, test_name, passed, details=""):
        """Log test result"""
        status = "[PASS]" if passed else "[FAIL]"
        self.test_results.append({
            "test": test_name,
            "status": status,
            "details": details
        })
        print("{}: {}".format(status, test_name))
        if details:
            print("     {}".format(details))

    def setup_test_data(self):
        """Create test campaign and character"""
        print("\n" + "="*70)
        print("SETUP: Creating test campaign and character")
        print("="*70)

        # Create user
        user_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        user_password = "TestPassword123!"

        user_data = {
            "email": user_email,
            "password": user_password
        }

        response = requests.post(f"{BASE_URL}/auth/signup", json=user_data)
        if response.status_code != 201:
            print(f"❌ Failed to create user: {response.text}")
            return False

        user_info = response.json()
        print(f"✓ Created user: {user_email}")

        # Create campaign
        campaign_data = {
            "name": f"Test Campaign {uuid.uuid4().hex[:8]}",
            "slug": f"test-campaign-{uuid.uuid4().hex[:8]}",
            "description": "Test campaign for color overrides"
        }

        response = requests.post(
            f"{BASE_URL}/campaigns",
            json=campaign_data,
            headers={"Authorization": f"Bearer {user_info['access_token']}"}
        )

        if response.status_code != 201:
            print(f"❌ Failed to create campaign: {response.text}")
            return False

        campaign = response.json()
        self.campaign_id = campaign["id"]
        self.admin_token = campaign["admin_token"]
        print(f"✓ Created campaign: {campaign['name']}")
        print(f"✓ Admin token: {self.admin_token[:20]}...")

        # Create character
        character_data = {
            "name": "Test Character",
            "slug": "test-character",
            "class_name": "Rogue",
            "race": "Half-Elf",
            "player_name": "Test Player"
        }

        response = requests.post(
            f"{BASE_URL}/campaigns/{self.campaign_id}/characters",
            json=character_data,
            headers={"X-Token": self.admin_token}
        )

        if response.status_code != 201:
            print(f"❌ Failed to create character: {response.text}")
            return False

        character = response.json()
        self.character_id = character["id"]
        print(f"✓ Created character: {character['name']}")

        return True

    def test_set_color_override(self):
        """Test setting character color override"""
        print("\n" + "="*70)
        print("TEST 1: Set Character Color Override")
        print("="*70)

        url = f"{BASE_URL}/campaigns/{self.campaign_id}/characters/{self.character_id}/color-theme"

        response = requests.post(
            url,
            json=TEST_OVERRIDE_COLORS,
            headers={"X-Token": self.admin_token}
        )

        passed = response.status_code == 200
        self.log_test(
            "POST /color-theme - Set override",
            passed,
            f"Status: {response.status_code}"
        )

        if passed:
            result = response.json()
            character = result.get("character", {})
            override = character.get("color_theme_override")

            # Verify override was set
            override_set = override is not None
            self.log_test(
                "Color override stored in character",
                override_set,
                f"Override: {override is not None}"
            )

            if override_set:
                # Verify structure
                has_all_fields = all(key in override for key in [
                    "border_colors", "text_color", "badge_interior_gradient",
                    "hp_color", "ac_color"
                ])
                self.log_test(
                    "Color override has all required fields",
                    has_all_fields
                )
        else:
            print(f"Response: {response.text}")

    def test_get_character(self):
        """Test that character response includes color_theme_override"""
        print("\n" + "="*70)
        print("TEST 2: Get Character (Verify color_theme_override in response)")
        print("="*70)

        url = f"{BASE_URL}/campaigns/{self.campaign_id}/characters/{self.character_id}"

        response = requests.get(
            url,
            headers={"X-Token": self.admin_token}
        )

        passed = response.status_code == 200
        self.log_test(
            "GET /characters/{id} - Retrieve character",
            passed,
            f"Status: {response.status_code}"
        )

        if passed:
            character = response.json()
            has_override_field = "color_theme_override" in character
            self.log_test(
                "Character response includes color_theme_override field",
                has_override_field
            )

            if has_override_field and character["color_theme_override"]:
                self.log_test(
                    "color_theme_override is populated",
                    True,
                    f"Colors set: {character['color_theme_override'] is not None}"
                )

    def test_get_resolved_colors_with_override(self):
        """Test getting resolved colors when character has override"""
        print("\n" + "="*70)
        print("TEST 3: Get Resolved Colors (Character Override Priority)")
        print("="*70)

        url = f"{BASE_URL}/campaigns/{self.campaign_id}/characters/{self.character_id}/resolved-colors"

        response = requests.get(url)

        passed = response.status_code == 200
        self.log_test(
            "GET /resolved-colors - Retrieve resolved colors",
            passed,
            f"Status: {response.status_code}"
        )

        if passed:
            result = response.json()

            # Check source is character_override
            source_correct = result.get("source") == "character_override"
            self.log_test(
                "Resolved colors source is 'character_override'",
                source_correct,
                f"Source: {result.get('source')}"
            )

            # Check colors are present
            colors = result.get("colors", {})
            has_colors = all(key in colors for key in [
                "border_colors", "text_color", "badge_interior_gradient",
                "hp_color", "ac_color"
            ])
            self.log_test(
                "Resolved colors include all required color fields",
                has_colors
            )

            # Verify it's the override colors
            if has_colors:
                border_match = colors.get("border_colors") == TEST_OVERRIDE_COLORS["border_colors"]
                self.log_test(
                    "Resolved colors match the override colors set",
                    border_match
                )

    def test_clear_color_override(self):
        """Test clearing character color override"""
        print("\n" + "="*70)
        print("TEST 4: Clear Character Color Override")
        print("="*70)

        url = f"{BASE_URL}/campaigns/{self.campaign_id}/characters/{self.character_id}/color-theme"

        response = requests.delete(
            url,
            headers={"X-Token": self.admin_token}
        )

        passed = response.status_code == 200
        self.log_test(
            "DELETE /color-theme - Clear override",
            passed,
            f"Status: {response.status_code}"
        )

        if passed:
            result = response.json()
            character = result.get("character", {})
            override = character.get("color_theme_override")

            # Verify override is cleared
            override_cleared = override is None
            self.log_test(
                "Color override cleared (set to null)",
                override_cleared,
                f"Override value: {override}"
            )

    def test_get_resolved_colors_no_override(self):
        """Test resolved colors fallback when no override"""
        print("\n" + "="*70)
        print("TEST 5: Get Resolved Colors (Fallback to System Default)")
        print("="*70)

        url = f"{BASE_URL}/campaigns/{self.campaign_id}/characters/{self.character_id}/resolved-colors"

        response = requests.get(url)

        passed = response.status_code == 200
        self.log_test(
            "GET /resolved-colors - Retrieve resolved colors",
            passed,
            f"Status: {response.status_code}"
        )

        if passed:
            result = response.json()

            # Should fallback to system default or campaign default
            source = result.get("source")
            valid_source = source in ["campaign_default", "system_default"]
            self.log_test(
                "Resolved colors source is fallback (campaign_default or system_default)",
                valid_source,
                f"Source: {source}"
            )

            # Verify colors are still present
            colors = result.get("colors", {})
            has_colors = all(key in colors for key in [
                "border_colors", "text_color", "badge_interior_gradient",
                "hp_color", "ac_color"
            ])
            self.log_test(
                "Fallback colors include all required fields",
                has_colors
            )

    def test_update_character_with_override(self):
        """Test updating character with color override"""
        print("\n" + "="*70)
        print("TEST 6: Update Character with Color Override")
        print("="*70)

        new_colors = {
            "border_colors": ["#123456", "#654321", "#ABCDEF", "#FEDCBA"],
            "text_color": "#000000",
            "badge_interior_gradient": {
                "type": "radial",
                "colors": ["#111111", "#222222"]
            },
            "hp_color": {
                "border": "#FF0000",
                "interior_gradient": {
                    "type": "radial",
                    "colors": ["#FF6B6B", "#CC0000"]
                }
            },
            "ac_color": {
                "border": "#808080",
                "interior_gradient": {
                    "type": "radial",
                    "colors": ["#A9A9A9", "#696969"]
                }
            }
        }

        url = f"{BASE_URL}/campaigns/{self.campaign_id}/characters/{self.character_id}"

        update_data = {
            "name": "Updated Test Character",
            "color_theme_override": new_colors
        }

        response = requests.patch(
            url,
            json=update_data,
            headers={"X-Token": self.admin_token}
        )

        passed = response.status_code == 200
        self.log_test(
            "PATCH /characters/{id} - Update with color override",
            passed,
            f"Status: {response.status_code}"
        )

        if passed:
            character = response.json()

            # Verify name was updated
            name_updated = character.get("name") == "Updated Test Character"
            self.log_test(
                "Character name updated",
                name_updated
            )

            # Verify override was updated
            override = character.get("color_theme_override")
            override_updated = override is not None
            self.log_test(
                "Color override updated in PATCH",
                override_updated
            )

            if override_updated:
                # Verify new colors
                colors_match = override.get("border_colors") == new_colors["border_colors"]
                self.log_test(
                    "New override colors match input",
                    colors_match
                )

    def test_error_cases(self):
        """Test error handling"""
        print("\n" + "="*70)
        print("TEST 7: Error Handling")
        print("="*70)

        # Test invalid campaign ID
        response = requests.post(
            f"{BASE_URL}/campaigns/invalid-uuid/characters/invalid-uuid/color-theme",
            json=TEST_OVERRIDE_COLORS,
            headers={"X-Token": self.admin_token}
        )

        bad_uuid = response.status_code == 400
        self.log_test(
            "Invalid UUID returns 400 Bad Request",
            bad_uuid,
            f"Status: {response.status_code}"
        )

        # Test unauthorized (no token)
        response = requests.post(
            f"{BASE_URL}/campaigns/{self.campaign_id}/characters/{self.character_id}/color-theme",
            json=TEST_OVERRIDE_COLORS
        )

        unauthorized = response.status_code == 403
        self.log_test(
            "Missing admin token returns 403 Forbidden",
            unauthorized,
            f"Status: {response.status_code}"
        )

        # Test not found (invalid character)
        fake_char_id = uuid.uuid4()
        response = requests.post(
            f"{BASE_URL}/campaigns/{self.campaign_id}/characters/{fake_char_id}/color-theme",
            json=TEST_OVERRIDE_COLORS,
            headers={"X-Token": self.admin_token}
        )

        not_found = response.status_code == 404
        self.log_test(
            "Non-existent character returns 404 Not Found",
            not_found,
            f"Status: {response.status_code}"
        )

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*70)
        print("TEST SUMMARY")
        print("="*70)

        passed = sum(1 for r in self.test_results if "PASS" in r["status"])
        total = len(self.test_results)

        print(f"\nResults: {passed}/{total} tests passed\n")

        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
            if result['details']:
                print(f"         {result['details']}")

        print("\n" + "="*70)
        if passed == total:
            print("✅ ALL TESTS PASSED - Ready for production")
        else:
            print(f"⚠️  {total - passed} test(s) failed - Review errors above")
        print("="*70 + "\n")

        return passed == total

    def run_all_tests(self):
        """Run all tests"""
        print("\n" + "="*70)
        print("CHARACTER COLOR OVERRIDE INTEGRATION TESTS")
        print("="*70)

        # Setup
        if not self.setup_test_data():
            print("❌ Setup failed - cannot run tests")
            return False

        # Run tests
        try:
            self.test_set_color_override()
            self.test_get_character()
            self.test_get_resolved_colors_with_override()
            self.test_clear_color_override()
            self.test_get_resolved_colors_no_override()
            self.test_update_character_with_override()
            self.test_error_cases()
        except Exception as e:
            print(f"\n❌ Test execution failed with error:")
            print(f"   {str(e)}")
            return False

        # Print summary
        return self.print_summary()


if __name__ == "__main__":
    print("\nStarting Character Color Override Integration Tests...")
    print("Make sure backend is running on http://localhost:8001\n")

    tester = TestCharacterColorOverrides()
    success = tester.run_all_tests()

    exit(0 if success else 1)
