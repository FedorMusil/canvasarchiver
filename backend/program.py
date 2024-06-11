from flask import Flask, request
import subprocess, os, hmac
from hashlib import sha1
from db.get_db_conn import get_db_conn
from controllers.frontend_api import *

app = Flask(__name__)
conn = get_db_conn()
# Example routes to show how the server works.
# Run the server with `python program.py` and visit the routes in your browser.

def load_json(json_obj):
    try:
        return json.loads(json_obj)
    except json.JSONDecodeError:
        return False

# Get Routes
@app.route('/course/<course_id>/id')
def get_course_info_route(course_id):
    '''Get a course by id.'''
    return get_course_by_id(conn, course_id)

@app.route('/course/<course_id>/users')
def get_course_users_route(course_id):
    '''Get all users in a course.'''
    return get_users_by_courseid(conn, course_id)

@app.route('/course/<course_id>/annotations/<change_id>')
def get_annotation(course_id, change_id):
    '''Get all annotations for a change.'''
    return get_annotations_by_changeid(conn, course_id, change_id)

@app.route('/course/<course_id>/changes')
def get_changes(course_id):
    '''Get all changes for a course.'''
    return get_changes_by_courseid(conn, course_id)

# Post Routes
@app.route('/course/create', methods=['POST'])
def post_course_route():
    '''Create a course.
    JSON body must contain:
    {
        "name": "New Course",
        "course_code": "123457"
    }'''
    request_unpacked = load_json(request.get_json())
    passed_test, error_message = check_course_create(conn, request_unpacked)
    if not passed_test:
        return error_message
    succes, return_message = post_course(conn, request_unpacked)
    if succes:
        return jsonify({"course_id": return_message})
    return return_message

@app.route('/course/<course_id>/create/annotation/<change_id>', methods=['POST'])
def post_annotation_route(course_id, change_id):
    '''Create an annotation.
    JSON body must contain:
    {
        "change_id": "1",
        "user_id": "1",
        "text": "This is an annotation",
    }'''
    request_unpacked = load_json(request.get_json())
    passed_test, error_message = check_annotation_create(conn, change_id, request_unpacked)
    if not passed_test:
        return error_message
    succes, return_message = post_annotation(conn, course_id, change_id, request_unpacked)
    if succes:
        return jsonify({"annotation_id": return_message})
    return return_message

@app.route('/course/<course_id>/change', methods=['POST'])
def post_change_route(course_id):
    '''Create a change.
    JSON body must contain:
    {
        "change_type": "Deletion",
        "item_type": "Assignments",
        "old_value": "10", # Reference to the item(change_id) being changed.
        "new_value": "{'name': 'New Course', 'course_code': '123457'}"
    }'''
    request_unpacked = load_json(request.get_json())
    passed_test, error_message = check_change_create(conn, course_id, request_unpacked)
    if not passed_test:
        return error_message
    succes, return_message = post_change(conn, course_id, request_unpacked)
    if succes:
        return jsonify({"change_id": return_message})
    return return_message

@app.route('/course/<course_id>/user', methods=['POST'])
def post_user_route(course_id):
    '''Create a user.
    JSON body must contain:
    {
        "email": "test@test.nl",
        "name": "New User",
        "role": "Teacher"
        }'''
    request_unpacked = load_json(request.get_json())
    passed_test, error_message = check_user_create(conn, course_id, request_unpacked)
    if not passed_test:
        return error_message
    succes, return_message = post_user(conn, course_id, request_unpacked)
    if succes:
        return jsonify({"user_id": return_message})
    return jsonify(return_message)

@app.route('/deploy', methods=['POST'])
def deploy():
    signature = request.headers.get('X-Hub-Signature')

    # Get the payload
    payload = request.data

    # Create a HMAC hex digest of the payload
    secret = os.getenv('GITHUB_SECRET').encode()
    digest = 'sha1=' + hmac.new(secret, payload, sha1).hexdigest()

    # Check if the digest matches the signature
    if not hmac.compare_digest(signature, digest):
        return 'Invalid signature', 400

    # Get the JSON data sent by GitHub
    data = request.get_json()

    # Check if the push event is for the main branch
    if data['ref'] == 'refs/heads/main':
        # Run your deployment script
        subprocess.run(['./deploy.sh'], check=True)

    return '', 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
