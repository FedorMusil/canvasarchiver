import requests
import jwt
import random
import string
from typing import Dict, Any
import time

import random
import string
from typing import Dict, Any


def generate_random_data():
    # Generate a random integer between 1 and 1000
    item_id = random.randint(1, 1000)
    # Randomly choose a change type
    change_type = random.choice(['Deletion', 'Addition', 'Modification'])
    # , 'Pages', 'Files', 'Quizzes', 'Modules', 'Sections'])  # Randomly choose an item type
    item_type = random.choice(['Assignments'])
    older_diff = 0  # Generate a random integer between -100 and 100

    # Generate a random dictionary for 'diff'
    diff_keys = [
        ''.join(
            random.choices(
                string.ascii_lowercase +
                string.digits,
                k=5)) for _ in range(5)]
    diff_values = [random.randint(1, 100) for _ in range(5)]
    diff = dict(zip(diff_keys, diff_values))

    return {
        "course_id": 1,  # Hardcoded to 1 for now, will be changed later
        'timestamp': time.time(),
        "item_id": item_id,
        "change_type": change_type,
        "item_type": item_type,
        "older_diff": older_diff,
        "diff": diff
    }


token = jwt.encode({"user_id": 1,
                    "course_id": 1},
                   'f3104b82021b97756ba5016a19f03d57722f75bd05e79bb596eacaba1e012558',
                   algorithm="HS256")
url = "https://192.168.0.206:3000/"
headers = {"accept": "application/json", "Content-Type": "application/json"}
cookies = {"token": token}


def test_get(extra_url):
    response = requests.get(
        url + extra_url,
        headers=headers,
        cookies=cookies,
        verify=False)
    return response


def test_post(extra_url, data):
    response = requests.post(
        url + extra_url,
        headers=headers,
        cookies=cookies,
        json=data,
        verify=False)
    return response


def test_put(extra_url, data):
    response = requests.put(
        url + extra_url,
        headers=headers,
        cookies=cookies,
        json=data,
        verify=False)
    return response


random_data = generate_random_data()

response_data = test_put("changes", random_data).json()
assert isinstance(response_data.get('change_id'),
                  int), "change_id is not an integer"
print(test_get("change/Assignments").text)

print("----")

print(random_data)
