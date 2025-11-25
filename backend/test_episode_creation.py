"""
Test script to verify episode creation functionality
"""
import requests
import time
import sys
import io
import random
import string

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8001"

def test_episode_creation():
    print("=" * 60)
    print("Testing Episode Creation")
    print("=" * 60)

    # Wait for server
    print("\n[1] Waiting for server...")
    for i in range(30):
        try:
            requests.get(f"{BASE_URL}/healthz", timeout=2)
            print("[OK] Server ready")
            break
        except:
            pass
        time.sleep(1)

    # Create test data
    print("\n[2] Creating test user and campaign...")
    rand_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"testuser{rand_str}@example.com"

    signup = requests.post(f"{BASE_URL}/auth/signup", json={"email": email, "password": "testpass123"})
    if signup.status_code not in [200, 201]:
        print(f"    [ERROR] {signup.json().get('detail', signup.text)}")
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
    print(f"[OK] Campaign created: {campaign_id}")

    # Create episode
    print("\n[3] Creating episode...")
    episode_data = {
        "name": "Episode 1: Welcome to Emon",
        "episode_number": 1,
        "season": 1,
        "description": "The party arrives in Emon for the first time",
        "air_date": "2015-10-10",
        "runtime": 180,
        "is_published": False
    }

    episode = requests.post(
        f"{BASE_URL}/campaigns/{campaign_id}/episodes",
        json=episode_data,
        headers={"X-Token": admin_token}
    )

    if episode.status_code != 201:
        print(f"[ERROR] Episode creation failed: {episode.status_code}")
        print(f"  Response: {episode.text}")
        return

    episode_json = episode.json()
    episode_id = episode_json["id"]
    print(f"[OK] Episode created successfully!")
    print(f"    ID: {episode_id}")
    print(f"    Name: {episode_json.get('name')}")
    print(f"    Episode Number: {episode_json.get('episode_number')}")
    print(f"    Season: {episode_json.get('season')}")
    print(f"    Published: {episode_json.get('is_published')}")

    # Verify fetch
    print("\n[4] Fetching episode to verify...")
    fetch = requests.get(
        f"{BASE_URL}/campaigns/{campaign_id}/episodes/{episode_id}",
        headers={"X-Token": admin_token}
    )

    if fetch.status_code != 200:
        print(f"[ERROR] Failed to fetch episode: {fetch.status_code}")
        print(f"  Response: {fetch.text}")
        return

    fetched = fetch.json()
    print(f"[OK] Episode fetched successfully!")
    print(f"    Name: {fetched.get('name')}")
    print(f"    Description: {fetched.get('description')}")
    print(f"    Runtime: {fetched.get('runtime')} minutes")

    # Get all episodes
    print("\n[5] Fetching all episodes for campaign...")
    episodes = requests.get(
        f"{BASE_URL}/campaigns/{campaign_id}/episodes",
        headers={"X-Token": admin_token}
    )

    if episodes.status_code != 200:
        print(f"[ERROR] Failed to fetch episodes: {episodes.status_code}")
        return

    episodes_list = episodes.json()
    print(f"[OK] Got {len(episodes_list)} episode(s)")
    if isinstance(episodes_list, list):
        for ep in episodes_list:
            print(f"    - {ep.get('name')} (Episode {ep.get('episode_number')})")

    print("\n" + "=" * 60)
    print("SUCCESS - Episode Creation Test Passed!")
    print("=" * 60)

if __name__ == "__main__":
    test_episode_creation()
