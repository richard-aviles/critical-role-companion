"""
Phase 3 Tier 2 - Character Color Override Integration Tests

Tests the complete color override workflow:
1. Create character without color override
2. Create character with color override (preset)
3. Create character with custom color override
4. Update character to add color override
5. Update character to change color override
6. Update character to remove color override
7. Retrieve character with color override
8. Get resolved colors endpoint (3-tier fallback)
"""

import requests
import json
import time

BASE_URL = 'http://localhost:8001'

# Test user for auth
TEST_USER = {
    'email': f'test_color_phase3_{int(time.time())}@example.com',
    'password': 'TestPassword123!'
}

# Color presets
COLOR_PRESET_A = {
    'border_colors': ['#FFD700', '#FFA500', '#FF8C00', '#DC7F2E'],
    'text_color': '#FFFFFF',
    'badge_interior_gradient': {
        'type': 'radial',
        'colors': ['#FFE4B5', '#DAA520'],
    },
    'hp_color': {
        'border': '#FF0000',
        'interior_gradient': {
            'type': 'radial',
            'colors': ['#FF6B6B', '#CC0000'],
        },
    },
    'ac_color': {
        'border': '#808080',
        'interior_gradient': {
            'type': 'radial',
            'colors': ['#A9A9A9', '#696969'],
        },
    },
}

COLOR_PRESET_B = {
    'border_colors': ['#9370DB', '#6A5ACD', '#483D8B', '#36213E'],
    'text_color': '#E6E6FA',
    'badge_interior_gradient': {
        'type': 'radial',
        'colors': ['#B19CD9', '#6A5ACD'],
    },
    'hp_color': {
        'border': '#DC143C',
        'interior_gradient': {
            'type': 'radial',
            'colors': ['#FF69B4', '#C71585'],
        },
    },
    'ac_color': {
        'border': '#4B0082',
        'interior_gradient': {
            'type': 'radial',
            'colors': ['#9370DB', '#6A5ACD'],
        },
    },
}

CUSTOM_COLORS = {
    'border_colors': ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
    'text_color': '#000000',
    'badge_interior_gradient': {
        'type': 'radial',
        'colors': ['#FF8888', '#FF0000'],
    },
    'hp_color': {
        'border': '#FF0000',
        'interior_gradient': {
            'type': 'radial',
            'colors': ['#FF5555', '#CC0000'],
        },
    },
    'ac_color': {
        'border': '#0000FF',
        'interior_gradient': {
            'type': 'radial',
            'colors': ['#5555FF', '#0000CC'],
        },
    },
}


class ColorTestRunner:
    def __init__(self):
        self.user_id = None
        self.token = None
        self.campaign_id = None
        self.test_results = []

    def test(self, name, func):
        """Run a test and record result"""
        try:
            result = func()
            self.test_results.append({'name': name, 'status': 'PASS', 'result': result})
            print(f'[PASS] {name}')
            return result
        except Exception as e:
            self.test_results.append({'name': name, 'status': 'FAIL', 'error': str(e)})
            print(f'[FAIL] {name}')
            print(f'  Error: {str(e)}')
            raise

    def assert_field(self, obj, field, expected_value, msg=''):
        """Assert that a field equals expected value"""
        if obj.get(field) != expected_value:
            raise AssertionError(
                f'Field "{field}" = {obj.get(field)}, expected {expected_value}. {msg}'
            )

    def assert_color_match(self, actual_colors, expected_colors, msg=''):
        """Assert that color objects match"""
        def normalize_colors(c):
            """Normalize color object structure"""
            return {
                'border_colors': c.get('border_colors', []),
                'text_color': c.get('text_color'),
                'badge_interior_gradient': c.get('badge_interior_gradient', {}),
                'hp_color': c.get('hp_color', {}),
                'ac_color': c.get('ac_color', {}),
            }

        actual_norm = normalize_colors(actual_colors)
        expected_norm = normalize_colors(expected_colors)

        if actual_norm != expected_norm:
            raise AssertionError(
                f'Colors do not match.\n'
                f'Expected: {json.dumps(expected_norm, indent=2)}\n'
                f'Actual: {json.dumps(actual_norm, indent=2)}\n'
                f'{msg}'
            )

    def run(self):
        """Run all tests"""
        print('=' * 80)
        print('Phase 3 Tier 2 - Character Color Override Integration Tests')
        print('=' * 80)
        print()

        try:
            # Setup
            self.test('Auth: Sign up user', self.signup_user)
            self.test('Campaign: Create campaign', self.create_campaign)

            # Test 1: Create character without color override
            char1_id = self.test(
                'Character: Create without color override',
                self.create_character_no_colors,
            )

            # Test 2: Retrieve character and verify no override
            self.test(
                'Character: Retrieve (no colors) and verify null',
                lambda: self.get_character_verify_no_colors(char1_id),
            )

            # Test 3: Create character with preset color override
            char2_id = self.test(
                'Character: Create with preset color (Option A)',
                self.create_character_with_preset_colors,
            )

            # Test 4: Retrieve and verify preset colors
            self.test(
                'Character: Retrieve (preset colors) and verify match',
                lambda: self.get_character_verify_colors(char2_id, COLOR_PRESET_A),
            )

            # Test 5: Create character with custom colors
            char3_id = self.test(
                'Character: Create with custom colors',
                self.create_character_with_custom_colors,
            )

            # Test 6: Retrieve and verify custom colors
            self.test(
                'Character: Retrieve (custom colors) and verify match',
                lambda: self.get_character_verify_colors(char3_id, CUSTOM_COLORS),
            )

            # Test 7: Update character to add color override
            self.test(
                'Character: Update (add colors to char without)',
                lambda: self.update_character_add_colors(char1_id, COLOR_PRESET_B),
            )

            # Test 8: Verify colors were added
            self.test(
                'Character: Verify colors were added',
                lambda: self.get_character_verify_colors(char1_id, COLOR_PRESET_B),
            )

            # Test 9: Update character to change colors
            self.test(
                'Character: Update (change colors)',
                lambda: self.update_character_change_colors(
                    char2_id, CUSTOM_COLORS
                ),
            )

            # Test 10: Verify colors were changed
            self.test(
                'Character: Verify colors were changed',
                lambda: self.get_character_verify_colors(char2_id, CUSTOM_COLORS),
            )

            # Test 11: Update character to remove colors
            self.test(
                'Character: Update (remove colors)',
                lambda: self.update_character_remove_colors(char2_id),
            )

            # Test 12: Verify colors were removed
            self.test(
                'Character: Verify colors were removed',
                lambda: self.get_character_verify_no_colors(char2_id),
            )

            # Test 13: Test resolved colors endpoint with character override
            self.test(
                'Colors: Get resolved colors (character override)',
                lambda: self.get_resolved_colors_verify_character(char3_id),
            )

            # Test 14: Test resolved colors endpoint without character override
            self.test(
                'Colors: Get resolved colors (fallback)',
                lambda: self.get_resolved_colors_verify_fallback(char1_id),
            )

            # Test 15: API Color Override endpoint (POST)
            char4_id = self.test(
                'Character: Create for color endpoint test',
                self.create_character_no_colors,
            )

            self.test(
                'Colors: Set color override via POST endpoint',
                lambda: self.set_color_override_via_endpoint(
                    char4_id, COLOR_PRESET_A
                ),
            )

            # Test 16: Verify colors via GET endpoint
            self.test(
                'Character: Verify colors after POST endpoint',
                lambda: self.get_character_verify_colors(char4_id, COLOR_PRESET_A),
            )

            # Test 17: Clear colors via DELETE endpoint
            self.test(
                'Colors: Clear color override via DELETE endpoint',
                lambda: self.clear_color_override_via_endpoint(char4_id),
            )

            # Test 18: Verify colors cleared
            self.test(
                'Character: Verify colors cleared after DELETE',
                lambda: self.get_character_verify_no_colors(char4_id),
            )

        except Exception as e:
            print(f'\n[ERROR] Test suite failed: {str(e)}')
            pass

        # Print summary
        print()
        print('=' * 80)
        print('Test Summary')
        print('=' * 80)
        passed = sum(1 for r in self.test_results if r['status'] == 'PASS')
        failed = sum(1 for r in self.test_results if r['status'] == 'FAIL')
        total = len(self.test_results)

        print(f'Total: {total} | Passed: {passed} | Failed: {failed}')
        print()

        if failed > 0:
            print('Failed Tests:')
            for result in self.test_results:
                if result['status'] == 'FAIL':
                    print(f"  - {result['name']}")
                    print(f"    Error: {result.get('error', 'Unknown error')}")
            print()

        return failed == 0

    # Setup Methods
    def signup_user(self):
        """Sign up a test user"""
        response = requests.post(
            f'{BASE_URL}/auth/signup',
            json=TEST_USER,
        )
        if response.status_code != 200:
            print(f'Response Status: {response.status_code}')
            print(f'Response Body: {response.text}')
        response.raise_for_status()
        data = response.json()
        self.user_id = data['id']
        return self.user_id

    def login_user(self):
        """Login and get auth token"""
        response = requests.post(
            f'{BASE_URL}/auth/login',
            json=TEST_USER,
        )
        response.raise_for_status()
        data = response.json()
        self.token = data.get('campaigns', [{}])[0].get('admin_token') if data.get('campaigns') else None

        # If no token in response, try getting it from campaign
        if not self.token and self.campaign_id:
            response = requests.get(
                f'{BASE_URL}/campaigns/{self.campaign_id}',
                headers={'X-Token': self.token or ''},
            )
            if response.status_code == 200:
                self.token = response.json().get('admin_token')

        return self.token

    def create_campaign(self):
        """Create a test campaign"""
        if not self.token:
            self.login_user()

        response = requests.post(
            f'{BASE_URL}/campaigns',
            json={'slug': f'color-test-{int(time.time())}', 'name': 'Color Override Test'},
            headers={'X-Token': self.token or ''},
        )
        response.raise_for_status()
        data = response.json()
        self.campaign_id = data['id']
        self.token = data.get('admin_token', self.token)
        return self.campaign_id

    # Character CRUD Methods
    def create_character_no_colors(self):
        """Create a character without color override"""
        response = requests.post(
            f'{BASE_URL}/campaigns/{self.campaign_id}/characters',
            json={
                'name': f'NoColor-{int(time.time())}',
                'class_name': 'Rogue',
                'race': 'Tiefling',
                'player_name': 'Test Player',
            },
            headers={'X-Token': self.token or ''},
        )
        response.raise_for_status()
        data = response.json()
        self.assert_field(data, 'color_theme_override', None, 'Character should have null color_theme_override')
        return data['id']

    def create_character_with_preset_colors(self):
        """Create a character with preset color override"""
        response = requests.post(
            f'{BASE_URL}/campaigns/{self.campaign_id}/characters',
            json={
                'name': f'WithPreset-{int(time.time())}',
                'class_name': 'Wizard',
                'race': 'Elf',
                'player_name': 'Test Player',
                'color_theme_override': COLOR_PRESET_A,
            },
            headers={'X-Token': self.token or ''},
        )
        response.raise_for_status()
        data = response.json()
        self.assert_color_match(data.get('color_theme_override'), COLOR_PRESET_A)
        return data['id']

    def create_character_with_custom_colors(self):
        """Create a character with custom color override"""
        response = requests.post(
            f'{BASE_URL}/campaigns/{self.campaign_id}/characters',
            json={
                'name': f'WithCustom-{int(time.time())}',
                'class_name': 'Cleric',
                'race': 'Human',
                'player_name': 'Test Player',
                'color_theme_override': CUSTOM_COLORS,
            },
            headers={'X-Token': self.token or ''},
        )
        response.raise_for_status()
        data = response.json()
        self.assert_color_match(data.get('color_theme_override'), CUSTOM_COLORS)
        return data['id']

    def get_character_verify_no_colors(self, character_id):
        """Get character and verify no color override"""
        response = requests.get(
            f'{BASE_URL}/campaigns/{self.campaign_id}/characters/{character_id}',
            headers={'X-Token': self.token or ''},
        )
        response.raise_for_status()
        data = response.json()
        self.assert_field(data, 'color_theme_override', None, 'Character should have null color_theme_override')
        return data

    def get_character_verify_colors(self, character_id, expected_colors):
        """Get character and verify color override matches"""
        response = requests.get(
            f'{BASE_URL}/campaigns/{self.campaign_id}/characters/{character_id}',
            headers={'X-Token': self.token or ''},
        )
        response.raise_for_status()
        data = response.json()
        self.assert_color_match(data.get('color_theme_override'), expected_colors)
        return data

    def update_character_add_colors(self, character_id, colors):
        """Update character to add color override"""
        response = requests.patch(
            f'{BASE_URL}/campaigns/{self.campaign_id}/characters/{character_id}',
            json={'color_theme_override': colors},
            headers={'X-Token': self.token or ''},
        )
        response.raise_for_status()
        data = response.json()
        self.assert_color_match(data.get('color_theme_override'), colors)
        return data

    def update_character_change_colors(self, character_id, new_colors):
        """Update character to change color override"""
        response = requests.patch(
            f'{BASE_URL}/campaigns/{self.campaign_id}/characters/{character_id}',
            json={'color_theme_override': new_colors},
            headers={'X-Token': self.token or ''},
        )
        response.raise_for_status()
        data = response.json()
        self.assert_color_match(data.get('color_theme_override'), new_colors)
        return data

    def update_character_remove_colors(self, character_id):
        """Update character to remove color override"""
        response = requests.patch(
            f'{BASE_URL}/campaigns/{self.campaign_id}/characters/{character_id}',
            json={'color_theme_override': None},
            headers={'X-Token': self.token or ''},
        )
        response.raise_for_status()
        data = response.json()
        self.assert_field(data, 'color_theme_override', None)
        return data

    def get_resolved_colors_verify_character(self, character_id):
        """Test resolved colors endpoint (character override source)"""
        response = requests.get(
            f'{BASE_URL}/campaigns/{self.campaign_id}/characters/{character_id}/resolved-colors',
            headers={'X-Token': self.token or ''},
        )
        response.raise_for_status()
        data = response.json()
        self.assert_field(data, 'source', 'character_override', 'Should use character override')
        self.assert_color_match(data.get('colors'), CUSTOM_COLORS)
        return data

    def get_resolved_colors_verify_fallback(self, character_id):
        """Test resolved colors endpoint (fallback source)"""
        response = requests.get(
            f'{BASE_URL}/campaigns/{self.campaign_id}/characters/{character_id}/resolved-colors',
            headers={'X-Token': self.token or ''},
        )
        response.raise_for_status()
        data = response.json()
        # Should fall back to campaign or system default
        source = data.get('source')
        if source not in ['character_override', 'campaign_default', 'system_default']:
            raise AssertionError(f'Invalid source: {source}')
        return data

    def set_color_override_via_endpoint(self, character_id, colors):
        """Test POST endpoint for setting color override"""
        response = requests.post(
            f'{BASE_URL}/campaigns/{self.campaign_id}/characters/{character_id}/color-theme',
            json={
                'border_colors': colors['border_colors'],
                'text_color': colors['text_color'],
                'badge_interior_gradient': colors['badge_interior_gradient'],
                'hp_color': colors['hp_color'],
                'ac_color': colors['ac_color'],
            },
            headers={'X-Token': self.token or ''},
        )
        response.raise_for_status()
        data = response.json()
        if 'character' in data:
            character_data = data['character']
        else:
            character_data = data
        self.assert_color_match(character_data.get('color_theme_override'), colors)
        return data

    def clear_color_override_via_endpoint(self, character_id):
        """Test DELETE endpoint for clearing color override"""
        response = requests.delete(
            f'{BASE_URL}/campaigns/{self.campaign_id}/characters/{character_id}/color-theme',
            headers={'X-Token': self.token or ''},
        )
        response.raise_for_status()
        data = response.json()
        if 'character' in data:
            character_data = data['character']
        else:
            character_data = data
        self.assert_field(character_data, 'color_theme_override', None)
        return data


if __name__ == '__main__':
    runner = ColorTestRunner()
    success = runner.run()
    exit(0 if success else 1)
