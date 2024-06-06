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

def get_courses():
    # The URL for the API request
    url = f'https://{CANVAS_DOMAIN}/api/v1/courses'

    # The API request
    response = requests.get(url, headers=headers)

    # The response from the API request
    return response.json()

def get_canvas_export_list(course_id):
    # The URL for the API request
    url = f'https://{CANVAS_DOMAIN}/api/v1/courses/{course_id}/content_exports'

    # The API request
    response = requests.get(url, headers=headers)

    # The response from the API request
    return response.json()

def create_canvas_export(course_id):
    # The URL for the API request
    url = f'https://{CANVAS_DOMAIN}/api/v1/courses/{course_id}/content_exports'

    # The API request
    response = requests.post(url, headers=headers, data={'export_type': 'common_cartridge'})

    # The response from the API request
    return response.json()

def get_canvas_export(course_id, export_id):
    # The URL for the API request
    url = f'https://{CANVAS_DOMAIN}/api/v1/courses/{course_id}/content_exports/{export_id}'

    # The API request
    response = requests.get(url, headers=headers)

    # The response from the API request
    return response.json()

if __name__ == '__main__':
    # The course ID
    course_id = get_courses()[0]['id']

    # Get the list of Canvas exports
    canvas_export_list = get_canvas_export_list(course_id)
    print(canvas_export_list)

    # Create a new Canvas export
    canvas_export = create_canvas_export(course_id)
    print(canvas_export)

    # Get the Canvas export
    export_id = canvas_export['id']
    canvas_export = get_canvas_export(course_id, export_id)
    print(canvas_export)