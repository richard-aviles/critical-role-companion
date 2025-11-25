"""
Diagnose which API call is failing in episode detail page
Replicates EXACTLY what the frontend does
"""
import requests
import random
import string
import json

BASE_URL = "http://localhost:8001"

def test_episode_detail_calls():
    print("\n" + "="*70)
    print("EPISODE DETAIL PAGE - API CALL DIAGNOSIS")
    print("="*70)

    # Setup: Create test data
    print("\n[SETUP] Creating test user, campaign, and episode...")
    rand_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"diagtest{rand_str}@example.com"

    # Signup
    signup = requests.post(f'{BASE_URL}/auth/signup', json={'email': email, 'password': 'testpass123'})
    user_id = signup.json()['id']

    # Login
    requests.post(f'{BASE_URL}/auth/login', json={'email': email, 'password': 'testpass123'})

    # Create campaign
    campaign_slug = f'diagtest-{random.randint(100000, 999999)}'
    campaign = requests.post(
        f'{BASE_URL}/campaigns',
        json={'slug': campaign_slug, 'name': 'Diagnosis Campaign'},
        headers={'Authorization': user_id}
    )
    campaign_id = campaign.json()['id']
    admin_token = campaign.json()['admin_token']
    print(f"[OK] Campaign created: {campaign_id}")
    print(f"[OK] Admin token: {admin_token}")

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

    # Create a character (for getCharacters call)
    character = requests.post(
        f'{BASE_URL}/campaigns/{campaign_id}/characters',
        json={'name': 'TestChar', 'class_name': 'Wizard', 'race': 'Human'},
        headers={'X-Token': admin_token}
    )
    print(f"[OK] Character created for testing")

    # Now simulate what the frontend does
    print("\n" + "="*70)
    print("REPLICATING FRONTEND API CALLS")
    print("="*70)

    # The frontend sets auth token first
    print("\n[Frontend Step 1] setAuthToken() - Sets header X-Token")
    print(f"  -> Would set: X-Token: {admin_token}")

    # Then makes three parallel API calls
    print("\n[Frontend Step 2] Making parallel API calls with X-Token header:")

    # Call 1: getEpisode
    print(f"\n[Call 1] GET /campaigns/{{campaignId}}/episodes/{{episodeId}}")
    print(f"         GET /campaigns/{campaign_id}/episodes/{episode_id}")
    print(f"         Headers: X-Token: {admin_token}")

    response1 = requests.get(
        f'{BASE_URL}/campaigns/{campaign_id}/episodes/{episode_id}',
        headers={'X-Token': admin_token}
    )
    print(f"         Status: {response1.status_code}")
    if response1.status_code != 200:
        print(f"         ERROR: {response1.text}")
    else:
        print(f"         OK - Episode fetched")

    # Call 2: getEvents
    print(f"\n[Call 2] GET /episodes/{{episodeId}}/events")
    print(f"         GET /episodes/{episode_id}/events")
    print(f"         Headers: X-Token: {admin_token}")

    response2 = requests.get(
        f'{BASE_URL}/episodes/{episode_id}/events',
        headers={'X-Token': admin_token}
    )
    print(f"         Status: {response2.status_code}")
    if response2.status_code != 200:
        print(f"         ERROR: {response2.text}")
    else:
        print(f"         OK - Events fetched")

    # Call 3: getCharacters
    print(f"\n[Call 3] GET /campaigns/{{campaignId}}/characters")
    print(f"         GET /campaigns/{campaign_id}/characters")
    print(f"         Headers: X-Token: {admin_token}")

    response3 = requests.get(
        f'{BASE_URL}/campaigns/{campaign_id}/characters',
        headers={'X-Token': admin_token}
    )
    print(f"         Status: {response3.status_code}")
    if response3.status_code != 200:
        print(f"         ERROR: {response3.text}")
    else:
        print(f"         OK - Characters fetched")

    # Summary
    print("\n" + "="*70)
    print("DIAGNOSIS SUMMARY")
    print("="*70)

    results = {
        'getEpisode': response1.status_code == 200,
        'getEvents': response2.status_code == 200,
        'getCharacters': response3.status_code == 200
    }

    all_ok = all(results.values())

    for call_name, success in results.items():
        status = "✓ OK" if success else "✗ FAILED"
        print(f"{status} - {call_name}")

    if not all_ok:
        print("\nFailing calls:")
        if not results['getEpisode']:
            print(f"  - getEpisode returned {response1.status_code}")
        if not results['getEvents']:
            print(f"  - getEvents returned {response2.status_code}")
        if not results['getCharacters']:
            print(f"  - getCharacters returned {response3.status_code}")

    print("="*70)
    return all_ok

if __name__ == "__main__":
    try:
        success = test_episode_detail_calls()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n[ERROR] Test failed: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
