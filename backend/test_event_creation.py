"""
Test event creation endpoint with updated schema
"""
import requests
import random
import string
import json

BASE_URL = "http://localhost:8001"

def test_event_creation():
    print("\n" + "="*70)
    print("TESTING EVENT CREATION ENDPOINT")
    print("="*70)

    # Setup: Create test data
    print("\n[Setup] Creating test user, campaign, and episode...")
    rand_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"eventtest{rand_str}@example.com"

    # Signup
    signup = requests.post(f'{BASE_URL}/auth/signup', json={'email': email, 'password': 'testpass123'})
    user_id = signup.json()['id']
    print(f"[OK] User created: {user_id}")

    # Login
    requests.post(f'{BASE_URL}/auth/login', json={'email': email, 'password': 'testpass123'})

    # Create campaign
    campaign_slug = f'eventtest-{random.randint(100000, 999999)}'
    campaign = requests.post(
        f'{BASE_URL}/campaigns',
        json={'slug': campaign_slug, 'name': 'Event Test Campaign'},
        headers={'Authorization': user_id}
    )
    campaign_id = campaign.json()['id']
    admin_token = campaign.json()['admin_token']
    print(f"[OK] Campaign created: {campaign_id}")

    # Create episode
    episode = requests.post(
        f'{BASE_URL}/campaigns/{campaign_id}/episodes',
        json={
            'name': 'Test Episode',
            'episode_number': 1,
            'season': 1,
            'description': 'Test',
            'slug': 'test-episode'
        },
        headers={'X-Token': admin_token}
    )
    episode_id = episode.json()['id']
    print(f"[OK] Episode created: {episode_id}")

    # Test 1: Create event via episode endpoint
    print("\n" + "="*70)
    print("TEST 1: Create event via POST /episodes/{episodeId}/events")
    print("="*70)

    event_payload = {
        'name': 'Critical Battle',
        'description': 'A crucial battle moment',
        'timestamp_in_episode': 1200,
        'event_type': 'combat',
        'characters_involved': []
    }

    print(f"\nPayload: {json.dumps(event_payload, indent=2)}")
    print(f"Headers: X-Token: {admin_token}")

    response = requests.post(
        f'{BASE_URL}/episodes/{episode_id}/events',
        json=event_payload,
        headers={'X-Token': admin_token}
    )

    print(f"\nStatus Code: {response.status_code}")

    if response.status_code == 201:
        result = response.json()
        print(f"[OK] Event created successfully!")
        print(f"  Event ID: {result.get('id')}")
        print(f"  Name: {result.get('name')}")
        print(f"  Type: {result.get('event_type')}")
        print(f"  Description: {result.get('description')}")
        return True
    else:
        print(f"[ERROR] Failed to create event")
        print(f"Response: {response.text}")
        return False

if __name__ == "__main__":
    try:
        success = test_event_creation()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n[ERROR] Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
