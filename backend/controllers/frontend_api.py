
import json
import traceback
from flask import jsonify
from db.get_db_conn import get_db_conn
from controllers.canvas_api import get_current_time
import asyncio

from os import getenv
from datetime import datetime
import sys

# import os
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# from db.get_db_conn import create_pool


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


async def check_course_create(pool, request):
    async with pool.acquire() as conn:
        try:
            # check_result, error_message = check_required_keys(request, {'name': {'type': str, 'length': 255}, 'course_code': {'type': str, 'length': 255}})
            # if not check_result:
            #     return False, error_message

        cur.execute('SELECT * FROM courses WHERE course_code = %s',
                    (request['course_code'], ))
        course = cur.fetchone()
        cur.close()
            course = await conn.fetchrow('SELECT * FROM courses WHERE course_code = $1', request.course_code)

            if course:
                return 400, "Error: Course exists already"
            return 200, "All checks passed"
        except Exception as e:
            print(f"Error: {e}")
            return 400, str(e)
    except Exception as e:
        tb = traceback.format_exc()
        return False, f"Invalid JSON format. Error: {str(e)}, Traceback: {tb}"

async def check_annotation_create(pool, course_id, change_id, request):
    async with pool.acquire() as conn:
        try:
            # check_result, error_message = check_required_keys(request, {'change_id': {'type': str,'length': 255},'text': {'type': str, 'length': 255}, 'user_id': {'type': str, 'length': 255}})

            # if not check_result:
            #     return False, error_message
        if not course:
            return False, "Error: Course does not exist"
        return True, "All checks passed"
    except Exception as e:
        return False, "A exception accured in checking the data: " + str(e)

async def check_change_create(pool, course_id, request):
    async with pool.acquire() as conn:
        try:
            # check_result, error_message = check_required_keys(request, {'course_id': {'type': int,'length': 255}, 'item_id': {'type': int,'length': 255}, 'change_type': {'type': str, 'enum': ['Deletion', 'Addition', 'Modification']}, 'item_type': {'type': str, 'enum': ['Assignments', 'Pages', 'Files', 'Quizzes', 'Modules', 'Sections']}, 'older_diff': {'type': int, 'length': 255}, 'diff': {'type': str}})

            # if not check_result:
            #     return False, error_message

            course = await conn.fetchrow('SELECT * FROM courses WHERE id = $1', int(course_id))
            # change = True

            # Disabled for now, tracking to see if the values form a tree.
            # if int(request['old_value']) != 0:
            #     # Check if old_value links to an older change
            #     change = await conn.fetchrow('SELECT * FROM changes WHERE id = $1', request['old_value'])
            # else:
            #     change = False

            if not course:
                return 400, "Error: Course does not exist"
            # if not change:
            #     return False, "Error: Old value does not link to an old change {} ||".format(request['old_value'])
            return 200, "All checks passed"
        except Exception as e:
            return 400, "A exception occurred in checking the data: " + str(e)


async def check_user_create(pool, course_id, request):
    async with pool.acquire() as conn:
        try:
            # check_result, error_message = check_required_keys(request, {'email': {'type': str, 'length': 255}, 'name': {'type': str, 'length': 255}, 'role': {'type': str, 'enum': ['TA', 'Teacher']}})

            course = await conn.fetchrow('SELECT * FROM courses WHERE id = $1', int(course_id))

            if not course:
                return False, "Error: Course does not exist"
            return 200, "All checks passed"
        except Exception as e:
            print(f"Error:\n {e}")
            return 400, "A exception occurred in checking the data"


async def get_course_by_id(pool, course_id):
    async with pool.acquire() as conn:
        course = await conn.fetchrow('SELECT * FROM courses WHERE id = $1', course_id)
        if course is not None:
            course = dict(course)
        return json.dumps(course)


async def get_users(pool):
    async with pool.acquire() as conn:
        users = await conn.fetch('SELECT * FROM users')
        return users

async def get_user_by_id(pool, user_id):
    async with pool.acquire() as conn:
        user = await conn.fetch('SELECT * FROM users WHERE id = $1', user_id)
        return user


async def get_users_by_courseid(pool, course_id):
    async with pool.acquire() as conn:
        user_ids = await conn.fetch('SELECT * FROM teacher_courses WHERE course_id = $1', int(course_id))

        if not user_ids:
            return []
        user_ids = tuple([user_id[0] for user_id in user_ids])
        users = await conn.fetch('SELECT * FROM users WHERE id=ANY($1)', user_ids)


async def get_annotations_by_changeid(pool, course_id, change_id):
    async with pool.acquire() as conn:
        annotations = await conn.fetch('''
        SELECT a.* 
        FROM annotations a
        JOIN changes c ON a.change_id = c.id
        WHERE c.course_id = $1 AND c.id = $2
        ''', course_id, change_id)

        return annotations


async def get_changes_by_courseid(pool, course_id):
    async with pool.acquire() as conn:
        changes = await conn.fetch('SELECT * FROM changes WHERE course_id = $1', course_id)
        return changes


async def post_course(pool, course_data):
    try:
        async with pool.acquire() as conn:
            try:
                course_id = await conn.fetchval('''
                INSERT INTO courses (name, course_code)
                VALUES ($1, $2)
                RETURNING id
                ''', course_data.name, course_data.course_code)
            except Exception as e:
                return 500, "An error happend in the database"

            if not course_id:
                return 400, "Error: Course not created"

            return 200, course_id
    except Exception as e:
        return 500, "An error occurred in the database"

async def post_annotation(pool, change_id, request):
    try:
        async with pool.acquire() as conn:
            annotation_id = await conn.fetchval('''
            INSERT INTO annotations (change_id, user_id, text, timestamp)
            VALUES ($1, $2, $3, $4)
            RETURNING id
            ''', int(change_id), request.user_id, request.text, datetime.now())

            return True, annotation_id
    except Exception as e:
        print("request to post_annotation failed, datadump:", "change_id:\n", change_id, "request:\n", request, "error:\n", e)
        return False, "Error: Annotation not created"


async def post_change(pool, course_id, request):
    try:
        async with pool.acquire() as conn:
            if request.older_diff == 0:
                change_id = await conn.fetchval('''
                INSERT INTO changes (course_id, timestamp, item_id, change_type, item_type, diff)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
                ''', int(course_id), datetime.now(), request.item_id, request.change_type, request.item_type, json.dumps(request.diff))
            else:
                change_id = await conn.fetchval('''
                INSERT INTO changes (course_id, timestamp, item_id, change_type, item_type, older_diff, diff)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
                ''', int(course_id), datetime.now(), request.item_id, request.change_type, request.item_type, request.older_diff, json.dumps(request.diff))

            return True, change_id
    except Exception as e:
        print("request to post_change failed, datadump:", "course_id:\n", course_id, "request:\n", request, "error:\n", e)
        return False, "Error: Change not created"


async def post_user(pool, course_id, request):
    async with pool.acquire() as conn:
        # check if the user already exists
        user = await conn.fetchrow('SELECT * FROM users WHERE email = $1', request.email)
        try:
            if not user:
                user_id = await conn.fetchval('''
                INSERT INTO users (email, name)
                VALUES ($1, $2)
                RETURNING id
                ''', request.email, request.name)
                await conn.execute('''INSERT INTO teacher_courses (user_id, course_id, role) VALUES ($1, $2, $3)''', int(user_id), int(course_id), request.role)
            else:
                user_id = user[0]
                try:
                    await conn.execute('''INSERT INTO teacher_courses (user_id, course_id, role) VALUES ($1, $2, $3)''', int(user_id), int(course_id), request.role)
                except Exception as e:
                    return False, "Error: User already exists in course"

            return True, user_id
        except Exception as e:
            print("request to post_user failed, datadump:", "course_id:\n", course_id, "request:\n", request, "error:\n", e)
            return False, "Error: User not created"


async def run():
    pool = await create_pool()
    course_id = await post_course(pool, {'name': 'Test Course', 'course_code': 'TEST103'})
    print(course_id)
    course = await get_course_by_id(pool, 1)
    print(course)
    await pool.close()

if __name__ == '__main__':
    import os
    import sys
    # Create pool
    asyncio.run(run())
