import requests, os
from datetime import datetime

# Make sure there is a .env file in the same directory as this script

# Replace with your Canvas API token
API_TOKEN = os.environ.get('CANVAS_API_TOKEN')

# Replace with your Canvas domain
CANVAS_DOMAIN = os.environ.get('CANVAS_DOMAIN')

# The headers for the API request
headers = {
    'Authorization': f'Bearer {API_TOKEN}',
}

# The URL for the API request
url = f'https://{CANVAS_DOMAIN}/api/v1/courses'

# Make the API request and print the response
response = requests.get(url, headers=headers)
print(response.json())

def test_connection():
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return True
    else:
        return False

def get_current_time():
    return str(datetime.now())

