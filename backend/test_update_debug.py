"""
Debug character update endpoint to see actual error
"""
import requests
import random
import string

BASE_URL = "http://localhost:8001"

# Create test data
rand_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
email = f"debugtest{rand_str}@example.com"

signup = requests.post(f'{BASE_URL}/auth/signup', json={'email': email, 'password': 'testpass123'})
user_id = signup.json()['id']

requests.post(f'{BASE_URL}/auth/login', json={'email': email, 'password': 'testpass123'})

campaign_slug = f'campaign-{random.randint(100000, 999999)}'
campaign = requests.post(
    f'{BASE_URL}/campaigns',
    json={'slug': campaign_slug, 'name': 'Test Campaign'},
    headers={'Authorization': user_id}
)
campaign_id = campaign.json()['id']
admin_token = campaign.json()['admin_token']

# Create a character
char = requests.post(
    f'{BASE_URL}/campaigns/{campaign_id}/characters',
    json={'name': 'TestChar', 'class_name': 'Wizard', 'race': 'Human'},
    headers={'X-Token': admin_token}
)
character_id = char.json()['id']

# Try to update with minimal payload
print(f'Character ID: {character_id}')
print(f'Campaign ID: {campaign_id}')
print(f'Admin Token: {admin_token}')
print(f'\nAttempting PATCH with class_name update...')

update = requests.patch(
    f'{BASE_URL}/campaigns/{campaign_id}/characters/{character_id}',
    json={'class_name': 'Rogue'},
    headers={'X-Token': admin_token}
)

print(f'Status Code: {update.status_code}')
print(f'Response Headers: {dict(update.headers)}')
print(f'Response Text: {update.text}')
print(f'Response JSON: {update.json() if update.status_code < 500 else "N/A"}')
