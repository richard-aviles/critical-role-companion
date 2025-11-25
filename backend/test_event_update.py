"""
Test event update endpoint with PATCH method
"""
import requests
import random
import string
import json

BASE_URL = "http://localhost:8001"

def test_event_update():
    print("\n" + "="*70)
    print("TESTING EVENT UPDATE ENDPOINT")
    print("="*70)

    # Setup: Create test data
    print("\n[Setup] Creating test user, campaign, episode, and event...")
    rand_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"eventupdate{rand_str}@example.com"

    # Signup
    signup = requests.post(f'{BASE_URL}/auth/signup', json={'email': email, 'password': 'testpass123'})
    user_id = signup.json()['id']
    print(f"[OK] User created: {user_id}")

    # Login
    requests.post(f'{BASE_URL}/auth/login', json={'email': email, 'password': 'testpass123'})

    # Create campaign
    campaign_slug = f'eventupdate-{random.randint(100000, 999999)}'
    campaign = requests.post(
        f'{BASE_URL}/campaigns',
        json={'slug': campaign_slug, 'name': 'Event Update Test Campaign'},
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

    # Create event
    event_payload = {
        'name': 'Original Event Name',
        'description': 'Original description',
        'timestamp_in_episode': 1200,
        'event_type': 'combat',
        'characters_involved': ['char1', 'char2']
    }
    
    create_resp = requests.post(
        f'{BASE_URL}/episodes/{episode_id}/events',
        json=event_payload,
        headers={'X-Token': admin_token}
    )
    
    if create_resp.status_code != 201:
        print(f"[ERROR] Failed to create event: {create_resp.status_code}")
        print(f"Response: {create_resp.text}")
        return False
    
    event_id = create_resp.json()['id']
    print(f"[OK] Event created: {event_id}")

    # Test: Update event via PATCH
    print("\n" + "="*70)
    print("TEST: Update event via PATCH /episodes/{episodeId}/events/{eventId}")
    print("="*70)

    update_payload = {
        'name': 'Updated Event Name',
        'description': 'Updated description',
        'timestamp_in_episode': 1500,
        'event_type': 'dialogue',
        'characters_involved': ['char3']
    }

    print(f"\nPayload: {json.dumps(update_payload, indent=2)}")
    print(f"Headers: X-Token: {admin_token}")

    response = requests.patch(
        f'{BASE_URL}/episodes/{episode_id}/events/{event_id}',
        json=update_payload,
        headers={'X-Token': admin_token}
    )

    print(f"\nStatus Code: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print(f"[OK] Event updated successfully!")
        print(f"  Name: {result.get('name')}")
        print(f"  Description: {result.get('description')}")
        print(f"  Timestamp: {result.get('timestamp_in_episode')}")
        print(f"  Type: {result.get('event_type')}")
        print(f"  Characters: {result.get('characters_involved')}")
        return True
    else:
        print(f"[ERROR] Failed to update event")
        print(f"Response: {response.text}")
        return False

if __name__ == "__main__":
    try:
        success = test_event_update()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n[ERROR] Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
