import json, traceback
from flask import jsonify
from db.get_db_conn import get_db_conn
from controllers.canvas_api import get_current_time
from os import getenv

production = getenv('PRODUCTION', False)

def check_required_keys(json_obj, required_keys):
    for key, value in required_keys.items():
        if key not in json_obj:
            return False, f"Missing required key: {key}"
        if not isinstance(json_obj[key], value['type']):
            return False, f"Invalid type for key: {key}. Expected {value['type'].__name__}, got {type(json_obj[key]).__name__}"
        if 'length' in value and len(str(json_obj[key])) > value['length']:
            return False, f"Value for key: {key} exceeds maximum length of {value['length']}"
        if 'enum' in value and json_obj[key] not in value['enum']:
            return False, f"Invalid value for key: {key}. Expected one of {value['enum']}, got {json_obj[key]}"
    return True, "All checks passed"

def check_course_create(conn, request):
    cur = conn.cursor()
    try:
        check_result, error_message = check_required_keys(request, {'name': {'type': str, 'length': 255}, 'course_code': {'type': str, 'length': 255}})

        if not check_result:
            return False, error_message

        cur.execute('SELECT * FROM courses WHERE course_code = %s', (request['course_code'], ))
        course = cur.fetchone()
        cur.close()

        if course:
            return False, "Error: Course exists already"
        return True, "All checks passed"

    except Exception as e:
        tb = traceback.format_exc()
        return False, f"Invalid JSON format. Error: {str(e)}, Traceback: {tb}"
    
def check_annotation_create(conn, change_id, request):
    cur = conn.cursor()
    try:
        check_result, error_message = check_required_keys(request, {'change_id': {'type': str,'length': 255},'text': {'type': str, 'length': 255}, 'user_id': {'type': str, 'length': 255}})

        if not check_result:
            return False, error_message

        cur.execute('SELECT * FROM changes WHERE id = %s', (change_id,))
        change = cur.fetchone()
        cur.close()
        
        if not change:
            return False, "Error: Change does not exist"
        return True, "All checks passed"
    except Exception as e:
        return False, "A exception accured in checking the data: " + str(e)
    
def check_change_create(conn, course_id, request):
    cur = conn.cursor()
    try:
        check_result, error_message = check_required_keys(request, {'course_id': {'type': int,'length': 255}, 'item_id': {'type': int,'length': 255}, 'change_type': {'type': str, 'enum': ['Deletion', 'Addition', 'Modification']}, 'item_type': {'type': str, 'enum': ['Assignments', 'Pages', 'Files', 'Quizzes', 'Modules', 'Sections']}, 'older_diff': {'type': int, 'length': 255}, 'diff': {'type': str}})

        if not check_result:
            return False, error_message

        cur.execute('SELECT * FROM courses WHERE id = %s', (course_id, ))
        course = cur.fetchone()
        change = True

        # Disabled for now, tracking to see if the values form a tree.
        # if int(request['old_value']) != 0:
        #     # Check if old_value links to an older change
        #     cur.execute('SELECT * FROM changes WHERE id = %s', (request['old_value'], ))
        #     change = cur.fetchone()
        # else:
        #     change = False

        cur.close()

        if not course:
            return False, "Error: Course does not exist"
        if not change:
            return False, "Error: Old value does not link to an old change {} ||".format(request['old_value'])
        return True, "All checks passed"
    except Exception as e:
        return False, "A exception accured in checking the data: " + str(e)
    
def check_user_create(conn, course_id, request):
    cur = conn.cursor()
    try:
        check_result, error_message = check_required_keys(request, {'email': {'type': str, 'length': 255}, 'name': {'type': str, 'length': 255}, 'role': {'type': str, 'enum': ['TA', 'Teacher']}})

        if not check_result:
            return False, error_message

        cur.execute('SELECT * FROM courses WHERE id = %s', (course_id, ))
        course = cur.fetchone()
        cur.close()

        if not course:
            return False, "Error: Course does not exist"
        return True, "All checks passed"
    except Exception as e:
        return False, "A exception accured in checking the data: " + str(e)
    
def get_course_by_id(conn, course_id):
    cur = conn.cursor()

    cur.execute('SELECT * FROM courses WHERE id = %s', (course_id,))
    course = cur.fetchone()

    cur.close()

    if course is None:
        return jsonify(error="Course not found"), 404

    # Assuming `course` is a dictionary with the course data
    return jsonify(course)

def get_users(conn):
    cur = conn.cursor()

    cur.execute('SELECT * FROM users')
    users = cur.fetchall()

    cur.close()

    return users

def get_users_by_courseid(conn, course_id):
    conn = get_db_conn()
    cur = conn.cursor()

    cur.execute('SELECT * FROM teacher_courses WHERE course_id = %s', (course_id,))
    user_ids = cur.fetchall()


    if not user_ids:
        return []
    user_ids = tuple([user_id[0] for user_id in user_ids])
    cur.execute('SELECT * FROM users WHERE id IN %s', (user_ids,))
    users = cur.fetchall()

    cur.close()

    return users


def get_annotations_by_changeid(conn, course_id, change_id):
    cur = conn.cursor()

    cur.execute('''
    SELECT a.* 
    FROM annotations a
    JOIN changes c ON a.change_id = c.id
    WHERE c.course_id = %s AND c.id = %s
    ''', (course_id, change_id))
    annotations = cur.fetchall()

    cur.close()

    return annotations

def get_changes_by_courseid(conn, course_id):
    cur = conn.cursor()

    cur.execute('SELECT * FROM changes WHERE course_id = %s', (course_id,))
    changes = cur.fetchall()

    cur.close()

    return changes

def post_course(conn, course_data):
    cur = conn.cursor()

    cur.execute('''
    INSERT INTO courses (name, course_code)
    VALUES (%s, %s)
    RETURNING id
    ''', (course_data['name'], course_data['course_code']))
    course_id = cur.fetchone()[0]

    # Check if the request succeeded
    if not course_id:
        return False, "Error: Course not created"

    conn.commit()
    cur.close()

    return True, course_id

def post_annotation(conn, course_id, change_id, request):
    cur = conn.cursor()

    cur.execute('''
    INSERT INTO annotations (change_id, user_id, text, timestamp)
    VALUES (%s, %s, %s, %s)
    RETURNING id
    ''', (change_id, request['user_id'], request['text'], get_current_time()))
    annotation_id = cur.fetchone()[0]

    conn.commit()
    cur.close()

    return True, annotation_id

def post_change(conn, course_id, request):
    cur = conn.cursor()

    if request['older_diff'] == 0:
        cur.execute('''
        INSERT INTO changes (course_id, timestamp, item_id, change_type, item_type, diff)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
        ''', (course_id, get_current_time(), request['item_id'], request['change_type'], request['item_type'], request['diff']))
    else:
        cur.execute('''
        INSERT INTO changes (course_id, timestamp, item_id, change_type, item_type, older_diff, diff)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        ''', (course_id, get_current_time(), request['item_id'], request['change_type'], request['item_type'], request['older_diff'], request['diff']))

    change_id = cur.fetchone()[0]

    conn.commit()
    cur.close()

    return True, change_id

def post_user(conn, course_id, request):
    cur = conn.cursor()
    
    # check if the user already exists
    cur.execute('SELECT * FROM users WHERE email = %s', (request['email'],))
    user = cur.fetchone()

    if not user:
        cur.execute('''
        INSERT INTO users (email, name)
        VALUES (%s, %s)
        RETURNING id
        ''', (request['email'], request['name']))
        user_id = cur.fetchone()[0]
        cur.execute('''INSERT INTO teacher_courses (user_id, course_id, role) VALUES (%s, %s, %s)''', (user_id, course_id, request['role']))
    else:
        user_id = user[0]
    
    conn.commit()
    cur.close()

    return True, user_id

