"""
Test episode creation flow to verify 401 error is fixed
"""
import requests
import random
import string

BASE_URL = "http://localhost:8001"

def test_episode_creation():
    print("\n" + "="*60)
    print("TESTING EPISODE CREATION FLOW")
    print("="*60)

    # Create test data
    print("\n[Setup] Creating test user and campaign...")
    rand_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"episodetest{rand_str}@example.com"

    # Signup
    signup = requests.post(f'{BASE_URL}/auth/signup', json={'email': email, 'password': 'testpass123'})
    if signup.status_code not in [200, 201]:
        print(f"[ERROR] Signup failed: {signup.text}")
        return False

    user_id = signup.json()['id']
    print(f"[OK] User created: {user_id}")

    # Login
    requests.post(f'{BASE_URL}/auth/login', json={'email': email, 'password': 'testpass123'})

    # Create campaign
    campaign_slug = f'episode-test-{random.randint(100000, 999999)}'
    campaign = requests.post(
        f'{BASE_URL}/campaigns',
        json={'slug': campaign_slug, 'name': 'Episode Test Campaign'},
        headers={'Authorization': user_id}
    )
    if campaign.status_code not in [200, 201]:
        print(f"[ERROR] Campaign creation failed: {campaign.text}")
        return False

    campaign_id = campaign.json()['id']
    admin_token = campaign.json()['admin_token']
    print(f"[OK] Campaign created: {campaign_id}")

    # Create episode
    print("\n[Test] Creating episode...")
    episode_data = {
        'name': 'Test Episode',
        'episode_number': 1,
        'season': 1,
        'description': 'Test episode description',
        'slug': 'test-episode'
    }

    episode = requests.post(
        f'{BASE_URL}/campaigns/{campaign_id}/episodes',
        json=episode_data,
        headers={'X-Token': admin_token}
    )

    if episode.status_code not in [200, 201]:
        print(f"[ERROR] Episode creation failed: {episode.status_code}")
        print(f"Response: {episode.text}")
        return False

    episode_id = episode.json()['id']
    print(f"[OK] Episode created successfully: {episode_id}")

    # Now test fetching the episode (this is what would happen when redirecting to detail page)
    print("\n[Test] Fetching episode details (simulating detail page load)...")

    # The fix: The frontend should now have the auth token set when fetching
    # Let's verify the endpoint works with the token
    fetch = requests.get(
        f'{BASE_URL}/campaigns/{campaign_id}/episodes/{episode_id}',
        headers={'X-Token': admin_token}
    )

    if fetch.status_code != 200:
        print(f"[ERROR] Episode fetch failed with status {fetch.status_code}")
        print(f"Response: {fetch.text}")
        return False

    fetched_episode = fetch.json()
    print(f"[OK] Episode fetched successfully")
    print(f"    Name: {fetched_episode['name']}")
    print(f"    Episode Number: {fetched_episode.get('episode_number')}")

    # Test without token (to ensure 401 is returned properly)
    print("\n[Test] Verifying auth is enforced (request without token)...")
    fetch_no_token = requests.get(
        f'{BASE_URL}/campaigns/{campaign_id}/episodes/{episode_id}'
    )

    if fetch_no_token.status_code in [401, 403]:
        print(f"[OK] Correctly returned {fetch_no_token.status_code} for request without token")
    else:
        print(f"[WARNING] Expected 401/403 without token, got {fetch_no_token.status_code}")

    print("\n" + "="*60)
    print("SUCCESS! Episode creation flow works correctly")
    print("="*60)
    return True

if __name__ == "__main__":
    try:
        success = test_episode_creation()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n[ERROR] Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
