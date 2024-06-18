import random
import string
import requests
import json
from os import getenv

production = getenv('PRODUCTION', False)

if not production:
    print("|TEST is running in debug mode|")


def generate_random_string(length=10):
    letters = string.ascii_letters
    result_str = ''.join(random.choice(letters) for i in range(length))
    return result_str


def create_course(
    course_content={
        "name": "New Course",
        "course_code": '127457'}):
    course_content = json.dumps(course_content)
    create_course_url = "http://localhost:5000/course/create"
    response = requests.post(
        create_course_url, json=course_content, headers={
            'Content-Type': 'application/json'})
    if not production:
        try:
            return response.json()
        except BaseException:
            print(response.text)
    return response.json()


def check_course_create(course_id):
    check_course_create_url = "http://localhost:5000/course/{}/id".format(
        course_id)
    response = requests.get(check_course_create_url)
    if not production:
        try:
            return response.json()
        except BaseException:
            print(response.text)
    return response.json()


def create_user(
    course_id,
    user_data={
        "email": "test@test.nl",
        "name": "test User",
        "role": "Teacher"}):
    user_data = json.dumps(user_data)
    create_user_url = "http://localhost:5000/course/{}/user".format(course_id)
    response = requests.post(
        create_user_url, json=user_data, headers={
            'Content-Type': 'application/json'})
    if not production:
        try:
            return response.json()
        except BaseException:
            print(response.text)
    return response.json()


def create_user(
    course_id,
    user_data={
        "email": "test@test.nl",
        "name": "test User",
        "role": "Teacher"}):
    user_data = json.dumps(user_data)
    create_user_url = "http://localhost:5000/course/{}/user".format(course_id)
    response = requests.post(
        create_user_url, json=user_data, headers={
            'Content-Type': 'application/json'})
    return response.json()


def get_all_course_users(course_id):
    check_user_create_url = "http://localhost:5000/course/{}/users".format(
        course_id)
    response = requests.get(check_user_create_url)
    if not production:
        try:
            return response.json()
        except BaseException:
            print(response.text)
    return response.json()


def create_change(
    course_id,
    change_data={
        "change_type": "Deletion",
        "item_type": "Assignments",
        "old_value": "0",
        "new_value": "{'name': 'New Course', 'course_code': '123457'}"}):
    change_data = json.dumps(change_data)
    create_change_url = "http://localhost:5000/course/{}/change".format(
        course_id)
    response = requests.post(
        create_change_url, json=change_data, headers={
            'Content-Type': 'application/json'})
    if not production:
        try:
            return response.json()
        except BaseException:
            print(response.text)
    return response.json()


def create_annotation(
    course_id,
    change_id,
    annotation_data={
        "change_id": "1",
        "user_id": "1",
        "text": "This is an annotation"}):
    annotation_data = json.dumps(annotation_data)
    create_annotation_url = "http://localhost:5000/course/{}/create/annotation/{}".format(
        course_id, change_id)
    response = requests.post(
        create_annotation_url,
        json=annotation_data,
        headers={
            'Content-Type': 'application/json'})
    if not production:
        try:
            return response.json()
        except BaseException:
            print(response.text)
    return response.json()


def get_all_changes(course_id):
    check_change_create_url = "http://localhost:5000/course/{}/changes".format(
        course_id)
    response = requests.get(check_change_create_url)
    if not production:
        try:
            return response.json()
        except BaseException:
            print(response.text)
    return response.json()


def get_all_annotations(course_id, change_id):
    check_annotation_create_url = "http://localhost:5000/course/{}/annotations/{}".format(
        course_id, change_id)
    response = requests.get(check_annotation_create_url)
    if not production:
        try:
            return response.json()
        except BaseException:
            print(response.text)
    return response.json()


def create_and_check_course():
    course_name = generate_random_string(10)
    course_code = generate_random_string(6)
    id = create_course({"name": course_name, "course_code": course_code})
    course_in_database = check_course_create(id.get("course_id"))
    # Check if course in database is also course that was created
    assert course_in_database[1] == course_name
    assert course_in_database[2] == course_code
    print("Course created successfully")
    return id


def create_and_check_user(course_id):
    user_email = generate_random_string(10) + "@test.nl"
    user_name = generate_random_string(10)
    user_role = "Teacher"
    id = create_user(
        course_id, {
            "email": user_email, "name": user_name, "role": user_role})
    users_in_database = get_all_course_users(course_id)
    # Check if user in database is also user that was created
    in_database = False
    for i in range(len(users_in_database)):
        if users_in_database[i][1] == user_email:
            in_database = True
            break
    if not in_database:
        assert False
    print("User created successfully")
    return id


if __name__ == "__main__":

    # Course generation
    course_id = create_and_check_course()

    # User generation
    create_and_check_user(course_id.get("course_id"))

    # Change generation
    change_id = create_change(course_id.get("course_id"),
                              {"course_id": course_id.get("course_id"),
                               "item_id": 10,
                               "change_type": "Deletion",
                               "item_type": "Assignments",
                               "older_diff": 0,
                               "diff": json.dumps({"name": "New Course",
                                                   "course_code": "123457"})})
    annotation_id = create_annotation(
        course_id.get("course_id"), change_id.get("change_id"), {
            "change_id": "0", "user_id": "1", "text": "This is an annotation"})
    changes = get_all_changes(course_id.get("course_id"))

    change_found = False

    for i in range(len(changes)):
        if changes[i][0] == change_id.get("change_id"):
            assert changes[i][3] == "Deletion"
            assert changes[i][5] == "Assignments"
            assert changes[i][7] == {
                'name': 'New Course',
                'course_code': '123457'}
            change_found = True
            break
    if not change_found:
        assert False

    annotations = get_all_annotations(
        course_id.get("course_id"),
        change_id.get("change_id"))
    annotation_found = False

    for i in range(len(annotations)):
        if annotations[i][0] == annotation_id.get("annotation_id"):
            assert annotations[i][2] == 1
            assert annotations[i][3] == "This is an annotation"
            annotation_found = True
            break

    if not annotation_found:
        assert False

    print("Changes and annotations created successfully")
