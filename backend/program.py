from flask import Flask, request, send_file, redirect, render_template_string
import subprocess, os, hmac, ssl, sys
from hashlib import sha1
from db.get_db_conn import get_db_conn
from controllers.frontend_api import *
import secrets
import requests
import jwt
from jwt.algorithms import RSAAlgorithm
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv('CLIENT_ID')
conn = None


# Checks Command-line parameter for true for DB connection
if len(sys.argv) > 1 and sys.argv[1].lower() == 'true':
    conn = get_db_conn()


app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')

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


@app.route('/course/<course_id>/create/annotation/<change_id>',
           methods=['POST'])
def post_annotation_route(course_id, change_id):
    '''Create an annotation.
    JSON body must contain:
    {
        "change_id": "1",
        "user_id": "1",
        "text": "This is an annotation",
    }'''
    request_unpacked = load_json(request.get_json())
    passed_test, error_message = check_annotation_create(
        conn, change_id, request_unpacked)
    if not passed_test:
        return error_message
    succes, return_message = post_annotation(
        conn, course_id, change_id, request_unpacked)
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
    passed_test, error_message = check_change_create(
        conn, course_id, request_unpacked)
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
    passed_test, error_message = check_user_create(
        conn, course_id, request_unpacked)
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


@app.route('/canvas')
def canvas():
    return '', 200

# Use a dictionary to store state and nonce with an expiration time
# Possibly change this in the future??
state_nonce_store = {}

def clean_expired_state_nonce():
    current_time = datetime.now(timezone.utc)
    expired_keys = [state for state, details in state_nonce_store.items() if details['expiry'] < current_time]
    for key in expired_keys:
        del state_nonce_store[key]

@app.route('/initiation', methods=['POST'])
def handle_initiation_post():
    clean_expired_state_nonce()

    if request.content_type == 'application/x-www-form-urlencoded':
        data = request.form
    else:
        data = request.json

    iss = data.get('iss')
    login_hint = data.get('login_hint')
    client_id = data.get('client_id')
    redirect_uri = data.get('target_link_uri')
    message_hint = data.get('lti_message_hint')
    state = secrets.token_urlsafe(16)
    nonce = secrets.token_urlsafe(16)

    # Store nonce securely with expiration time
    state_nonce_store[state] = {'nonce': nonce, 'expiry': datetime.now(timezone.utc) + timedelta(minutes=10)}


    if not all([iss, login_hint, client_id, redirect_uri]):
        return jsonify({'error': 'Missing required LTI parameters'}), 400

    # Construct the OIDC Authentication Request URL
    oidc_auth_endpoint = "https://sso.test.canvaslms.com/api/lti/authorize_redirect"
    auth_request_params = {
        'scope': 'openid',
        'response_type': 'id_token',
        'client_id': client_id,
        'redirect_uri': 'https://localhost:3000/redirect',
        'lti_message_hint': message_hint,
        'login_hint': login_hint,
        'state': state,
        'response_mode': 'form_post',
        'nonce': nonce,
        'prompt': 'none'
    }

    auth_request_url = f"{oidc_auth_endpoint}?{'&'.join([f'{key}={value}' for key, value in auth_request_params.items()])}"

    return redirect(auth_request_url)

@app.route('/redirect', methods=['POST'])
def handle_redirect():
    clean_expired_state_nonce()

    data = request.form
    id_token = data.get('id_token')
    state = data.get('state')
    client_id = CLIENT_ID

    if not id_token or not state:
        return jsonify({'error': 'Missing id_token or state'}), 400

    # Verify the state parameter
    if state not in state_nonce_store:
        return jsonify({'error': 'Invalid state parameter'}), 400
    nonce = state_nonce_store.pop(state)['nonce']

    # Fetch Canvas' public keys
    jwks_url = "https://sso.test.canvaslms.com/api/lti/security/jwks"
    jwks = requests.get(jwks_url).json()

    # Validate the JWT
    try:
        header = jwt.get_unverified_header(id_token)
        key = next(key for key in jwks['keys'] if key['kid'] == header['kid'])
        rsa_key = RSAAlgorithm.from_jwk(key)
        payload = jwt.decode(id_token, rsa_key, algorithms=['RS256'], audience=client_id, nonce=nonce)
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Expired JWT token'}), 400
    except Exception as e:
        print(f"JWT validation error: {e}")
        return jsonify({'error': 'Invalid JWT'}), 400

    # Extract user_id and course_id from payload
    user_id = payload.get('https://purl.imsglobal.org/spec/lti/claim/lti1p1', {}).get('user_id')
    course_id = payload.get('https://purl.imsglobal.org/spec/lti/claim/custom', {}).get('courseid')

    # Create a response to set the user_id and course_id in cookies
    response = redirect('/')
    response.set_cookie('user_id', user_id, httponly=True, secure=True)
    response.set_cookie('course_id', course_id, httponly=True, secure=True)

    return response

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_file(os.path.join(app.static_folder, path))
    else:
        return render_template_string(open(os.path.join(app.static_folder, 'index.html')).read())



if __name__ == '__main__':
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(
        '../frontend/localhost.pem',
        '../frontend/localhost-key.pem')
    app.run(
        host='0.0.0.0',
        port=3000,
        debug=False,
        ssl_context=context,
        use_reloader=False)
