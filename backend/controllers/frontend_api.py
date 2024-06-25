import json
import traceback
import asyncio

from os import getenv
from datetime import datetime
import sys
import json
import tempfile

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
    """
    Check if a course can be created based on the provided request.

    Args:
        pool: The connection pool to the database.
        request: The request object containing the course information.

    Returns:
        A tuple containing the HTTP status code and a message indicating the result of the checks.
    """
    async with pool.acquire() as conn:
        try:
            # check_result, error_message = check_required_keys(request, {'name': {'type': str, 'length': 255}, 'course_code': {'type': str, 'length': 255}})
            # if not check_result:
            #     return False, error_message

            course = await conn.fetchrow('SELECT * FROM courses WHERE course_code = $1', request.course_code)

            if course:
                return 400, "Error: Course exists already"
            return 200, "All checks passed"
        except Exception as e:
            print(f"Error: {e}")
            return 400, str(e)


async def check_annotation_create(pool, course_id, change_id, request):
    """
    Check if the user has permission to annotate a change and if the change exists.

    Args:
        pool: The connection pool to the database.
        course_id: The ID of the course.
        change_id: The ID of the change.
        request: The request object containing user information.

    Returns:
        A tuple containing the status code and a message.
        - If the user has permission and the change exists, returns (200, "All checks passed").
        - If the user does not have permission, returns (400, "Error: User does not have permission to annotate this change").
        - If the change does not exist, returns (400, "Error: Change does not exist").
        - If an exception occurs during the data check, returns (400, "An exception occurred in checking the data: <exception message>").
    """
    async with pool.acquire() as conn:
        try:
            # check_result, error_message = check_required_keys(request, {'change_id': {'type': str,'length': 255},'text': {'type': str, 'length': 255}, 'user_id': {'type': str, 'length': 255}})

            # if not check_result:
            #     return False, error_message

            # Check if the user has permission to do so
            user = await conn.fetchrow('SELECT * FROM teacher_courses WHERE user_id = $1 AND course_id = $2', request.user_id, course_id)

            if not user:
                return 400, "Error: User does not have permission to annotate this change"

            change = await conn.fetchrow('SELECT * FROM changes WHERE id = $1', int(change_id))

            if not change:
                return 400, "Error: Change does not exist"
            return 200, "All checks passed"
        except Exception as e:
            return 400, "An exception occurred in checking the data: " + str(e)


async def check_change_create(pool, course_id, request):
    """
    Check if the change can be created for the given course.

    Args:
        pool: The connection pool to the database.
        course_id: The ID of the course.
        request: The request data containing the change details.

    Returns:
        A tuple containing the status code and a message.
        - If the checks pass, returns (200, "All checks passed").
        - If the course does not exist, returns (400, "Error: Course does not exist").
        - If an exception occurs during the check, returns (400, "An exception occurred in checking the data: <exception message>").
    """
    async with pool.acquire() as conn:
        try:
            course = await conn.fetchrow('SELECT * FROM courses WHERE id = $1', int(course_id))

            if not course:
                return 400, "Error: Course does not exist"

            return 200, "All checks passed"
        except Exception as e:
            return 400, "An exception occurred in checking the data: " + str(e)


async def check_user_create(pool, course_id, request):
    """
    Check if a user can be created for a given course.

    Args:
        pool (object): The connection pool to the database.
        course_id (int): The ID of the course.
        request (object): The request object containing user data.

    Returns:
        tuple: A tuple containing the result code and a message.
            - If the checks pass, returns (200, "All checks passed").
            - If the course does not exist, returns (False, "Error: Course does not exist").
            - If an exception occurs, returns (400, "An exception occurred in checking the data").
    """
    async with pool.acquire() as conn:
        try:
            # check_result, error_message = check_required_keys(request, {'email': {'type': str, 'length': 255}, 'name': {'type': str, 'length': 255}, 'role': {'type': str, 'enum': ['TA', 'Teacher']}})

            # if not check_result:
            #     return False, error_message

            course = await conn.fetchrow('SELECT * FROM courses WHERE id = $1', int(course_id))

            if not course:
                return False, "Error: Course does not exist"
            return 200, "All checks passed"
        except Exception as e:
            print(f"Error:\n {e}")
            return 400, "An exception occurred in checking the data"


async def get_change_by_materialid(pool, course_id, material_id):
    """
    Retrieve a change record from the database based on the material ID.

    Args:
        pool: The connection pool to the database.
        course_id: The ID of the course.
        material_id: The ID of the material.

    Returns:
        The change record if found, otherwise None.
    """
    print(material_id, course_id)
    async with pool.acquire() as conn:
        change = await conn.fetchrow('SELECT * FROM changes WHERE item_type = $1 AND course_id = $2', material_id, int(course_id))
        return change


async def get_changes_recent(pool, course_id):
    """
    Retrieve the most recent changes for a given course.

    Args:
        pool: The connection pool to the database.
        course_id: The ID of the course.

    Returns:
        A list of the most recent changes for the given course.
    """
    async with pool.acquire() as conn:
        internal_course_id = await convert_course_id_to_id(pool, int(course_id))

        changes = await conn.fetch('SELECT * FROM changes WHERE course_id = $1 ORDER BY timestamp DESC LIMIT 10', int(internal_course_id))
        change_list = []
        for change in changes:
            change_dict = {
                "id": change['id'],
                "old_id": change['older_diff'],
                "change_type": change['change_type'],
                "item_type": change['item_type'],
                "timestamp": change['timestamp'],
                "diff": change['diff'],
            }
            change_list.append(change_dict)
        return change_list


async def get_change_by_id(pool, course_id, change_id):
    """
    Retrieve a change record by its ID.

    Args:
        pool: The connection pool to the database.
        course_id: The ID of the course.
        change_id: The ID of the change.

    Returns:
        The change record if found, otherwise None.
    """
    async with pool.acquire() as conn:
        change = await conn.fetchrow('SELECT * FROM changes WHERE course_id = $1 AND id = $2', course_id, change_id)
        return change


async def get_annotation_by_id(pool, course_id, annotation_id):
    """
    Retrieve an annotation by its ID.

    Args:
        pool: The connection pool to the database.
        course_id: The ID of the course.
        annotation_id: The ID of the annotation.

    Returns:
        The annotation record if found, otherwise None.
    """
    async with pool.acquire() as conn:
        change = await conn.fetchrow('SELECT * FROM changes WHERE course_id = $1', course_id)

        annotation = await conn.fetchrow('SELECT * FROM annotations WHERE change_id = $1 AND id = $2', change[0], annotation_id)

        return annotation


async def delete_annotation_by_id(pool, course_id, annotation_id):
    """
    Delete an annotation by its ID.

    Args:
        pool: The connection pool to the database.
        course_id: The ID of the course.
        annotation_id: The ID of the annotation.

    Returns:
        A boolean indicating the success of the operation.
    """
    async with pool.acquire() as conn:
        change = await conn.fetchrow('SELECT * FROM changes WHERE course_id = $1', course_id)

        await conn.execute('DELETE FROM annotations WHERE change_id = $1 AND id = $2', change[0], annotation_id)

        return True


async def get_courses_by_user(pool, user_id):
    """
    Retrieve courses associated with a given user ID.

    Args:
        pool: The connection pool to the database.
        user_id: The ID of the user.

    Returns:
        A list of courses associated with the given user ID.
    """
    async with pool.acquire() as conn:
        course_ids = await conn.fetch('SELECT * FROM teacher_courses WHERE user_id = $1', user_id)
        if not course_ids:
            return []
        course_ids = tuple([course_id[1] for course_id in course_ids])
        courses = await conn.fetch('SELECT * FROM courses WHERE id=ANY($1)', course_ids)
        return courses


async def get_course_by_id(pool, course_id):
    """
    Retrieve a course by its ID from the database.

    Args:
        pool: The connection pool to the database.
        course_id: The ID of the course to retrieve.

    Returns:
        A JSON string representation of the course if found, otherwise None.
    """
    async with pool.acquire() as conn:
        course = await conn.fetchrow('SELECT * FROM courses WHERE id = $1', course_id)
        if course is not None:
            course = dict(course)
        return json.dumps(course)


async def get_users(pool):
    """
    Retrieve all users from the database.

    Args:
        pool: The connection pool to the database.

    Returns:
        A list of user records retrieved from the database.
    """
    async with pool.acquire() as conn:
        users = await conn.fetch('SELECT * FROM users')
        return users


async def convert_course_id_to_id(pool, course_id):
    """
    Convert a course ID to the course code.

    Args:
        pool: The connection pool to the database.
        course_id: The ID of the course to convert.

    Returns:
        The internal identifier of the course.
    """
    async with pool.acquire() as conn:
        course = await conn.fetchrow('SELECT * FROM courses WHERE $1 = ANY(course_ids)', int(course_id))
        print("TEST", course, "TEST")
        return course['id']


async def get_user_by_id(pool, user_id, course_id):
    """
    Retrieve a user from the database by their ID.

    Args:
        pool: The connection pool to the database.
        user_id: The ID of the user to retrieve.

    Returns:
        The user record as a dictionary, or None if the user is not found.
    """
    async with pool.acquire() as conn:
        user = await conn.fetch('SELECT * FROM users WHERE id = $1', user_id)

        internal_course_id = await convert_course_id_to_id(pool, int(course_id))

        additional_info = await conn.fetch('SELECT * FROM teacher_courses WHERE user_id = $1 AND course_id = $2', user_id, internal_course_id)
        record_dicr = {
            "id": user[0]['id'],
            "email": user[0]['email'],
            "name": user[0]['name'],
            "role": additional_info[0]['role'],
            "courseId": int(course_id)
        }

        return record_dicr


async def get_users_by_courseid(pool, course_id):
    """
    Retrieve users associated with a given course ID.

    Args:
        pool: The connection pool to the database.
        course_id: The ID of the course.

    Returns:
        A list of users associated with the given course ID.
    """
    async with pool.acquire() as conn:
        user_ids = await conn.fetch('SELECT * FROM teacher_courses WHERE course_id = $1', int(course_id))

        if not user_ids:
            return []
        user_ids = tuple([user_id[0] for user_id in user_ids])
        users = await conn.fetch('SELECT * FROM users WHERE id=ANY($1)', user_ids)

        return users


async def get_annotations_by_changeid(pool, course_id, change_id):
    """
    Retrieve annotations by change ID.

    Args:
        pool: The connection pool to the database.
        course_id: The ID of the course.
        change_id: The ID of the change.

    Returns:
        A list of annotations associated with the specified change ID.
    """
    async with pool.acquire() as conn:
        annotations = await conn.fetch('''
        SELECT a.*
        FROM annotations a
        JOIN changes c ON a.change_id = c.id
        WHERE c.course_id = $1 AND c.id = $2
        ''', course_id, change_id)

        return annotations


async def get_changes_by_courseid(pool, course_id):
    """
    Retrieve changes from the database based on the given course ID.

    Args:
        pool: The connection pool to the database.
        course_id: The ID of the course to retrieve changes for.

    Returns:
        A list of changes matching the given course ID.
    """
    async with pool.acquire() as conn:
        changes = await conn.fetch('SELECT * FROM changes WHERE course_id = $1', course_id)
        return changes


async def get_course_id_by_code(pool, course_code):
    """
    Retrieve the course ID based on the course code.

    Args:
        pool: The connection pool to the database.
        course_code: The course code to search for.

    Returns:
        The ID of the course if found, otherwise None.
    """
    async with pool.acquire() as conn:
        course_id = await conn.fetchval('SELECT id FROM courses WHERE course_code = $1', course_code)
        return course_id


async def get_change_by_id(pool, change_id):
    """
    Retrieve a change by its ID.

    Args:
        pool: The connection pool to the database.
        change_id: The ID of the change to retrieve.

    Returns:
        The change record as a dictionary, or None if the change is not found.
    """
    async with pool.acquire() as conn:
        change = await conn.fetchrow('SELECT * FROM changes WHERE id = $1', change_id)
        return change


async def get_changes_by_item(pool, item_id, item_type):
    """
    Retrieve changes from the database based on the item ID and item type.

    Args:
        pool: The connection pool to the database.
        course_id: The ID of the course.
        item_id: The ID of the item.
        item_type: The type of the item.

    Returns:
        A list of changes matching the given item ID and item type.
    """
    async with pool.acquire() as conn:
        changes = await conn.fetch('SELECT * FROM changes WHERE item_id = $1 AND item_type = $2', item_id, item_type)
        return changes


# probably temporary solution with tempfile, will switch to server process
# instead of subprocess


async def get_patched(json_data, patch):
    json_diff_path = '.\\json\\json'
    str1 = json.dumps(json_data)
    str2 = json.dumps(patch)
    with tempfile.TemporaryFile() as f:
        f.write(b'patch')
        f.write(b'\n')
        f.write(str1.encode())
        f.write(b'\n')
        f.write(str2.encode())
        f.seek(0)

        file_content = f.read()

    process = await asyncio.create_subprocess_exec(
        json_diff_path,
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    output = (await process.communicate(input=file_content))[0].decode()
    return json.loads(output.rstrip('\n'))


async def get_most_recent(changes):
    """
    Retrieve the most recent change from a list of changes.

    Args:
        changes: A list of changes.

    Returns:
        The most recent change from the list.
    """
    most_recent = None
    for change in changes:
        if not most_recent or change['timestamp'] > most_recent['timestamp']:
            most_recent = change
    return most_recent


async def get_item_history(pool, item_id, item_type):
    """
    Retrieve the history of an item from the database.

    Args:
        pool: The connection pool to the database.
        item_id: The ID of the item.
        item_type: The type of the item.

    Returns:
        A list of changes associated with the item.
    """
    changes = await get_changes_by_item(pool, item_id, item_type)
    history = []
    most_recent = get_most_recent(changes)
    most_recent['diff'] = json.loads(most_recent['diff'])
    history.append(most_recent)

    prev_version = most_recent['older_diff'] if most_recent else None
    while prev_version:
        change = await get_change_by_id(pool, prev_version)
        change['diff'] = json.loads(change['diff'])
        change['diff'] = await get_patched(history[-1]['diff'], change['diff'])
        history.append(change)
        prev_version = change['older_diff']

    return json.dumps(history)


async def post_course(pool, course_id, course_name, course_code):
    """
    Inserts a new course into the database.

    Args:
        pool: The connection pool to the database.
        course_data: An object containing the course name and course code.

    Returns:
        A tuple containing the HTTP status code and the course ID.
        If an error occurs, the status code will be 500 and an error message will be returned.
        If the course is not created successfully, the status code will be 400 and an error message will be returned.
        Otherwise, the status code will be 200 and the course ID will be returned.
    """
    try:
        async with pool.acquire() as conn:
            course = await conn.fetchrow('SELECT * FROM courses WHERE $1 = ANY(course_ids)', int(course_id))

            if course:
                return 405, course[0]
            try:
                course_id = await conn.fetchval('''
                INSERT INTO courses (course_ids, name, course_code)
                VALUES (ARRAY[$1::integer], $2, $3)
                RETURNING id
                ''', int(course_id), course_name, course_code)
                return 200, course_id
            except Exception as e:
                return 500, "An error happened in the database" + str(e)

    except Exception as e:
        return 500, "An error occurred in the database" + str(e)


async def post_annotation(pool, change_id, request):
    """
    Inserts a new annotation into the database.

    Args:
        pool: The connection pool to the database.
        change_id: The ID of the change associated with the annotation.
        request: The request object containing user ID, text, and timestamp.

    Returns:
        A tuple containing a boolean indicating success or failure, and the ID of the created annotation.
    """
    try:
        async with pool.acquire() as conn:
            annotation_id = await conn.fetchval('''
            INSERT INTO annotations (change_id, user_id, text, timestamp)
            VALUES ($1, $2, $3, $4)
            RETURNING id
            ''', int(change_id), request.user_id, request.text, datetime.now())

            return True, annotation_id
    except Exception as e:
        print(
            "request to post_annotation failed, datadump:",
            "change_id:\n",
            change_id,
            "request:\n",
            request,
            "error:\n",
            e)
        return False, "Error: Annotation not created"


async def post_change(pool, course_id, request):
    """
    Inserts a change record into the database.

    Args:
        pool: The connection pool to the database.
        course_id: The ID of the course.
        request: The request object containing the change details.

    Returns:
        A tuple containing a boolean indicating the success of the operation and the ID of the inserted change record.
    """
    try:
        async with pool.acquire() as conn:
            if request.older_diff == 0:
                change_id = await conn.fetchval('''
                INSERT INTO changes (course_id, timestamp, item_id, change_type, item_type, diff)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
                ''', int(course_id), datetime.now(), request.item_id, request.change_type, request.item_type, request.diff)
            else:
                change_id = await conn.fetchval('''
                INSERT INTO changes (course_id, timestamp, item_id, change_type, item_type, older_diff, diff)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
                ''', int(course_id), datetime.now(), request.item_id, request.change_type, request.item_type, request.older_diff, request.diff)

            return True, change_id
    except Exception as e:
        print(
            "request to post_change failed, datadump:",
            "course_id:\n",
            course_id,
            "request:\n",
            request,
            "error:\n",
            e)
        return False, "Error: Change not created" + str(e)


async def post_user(pool, course_id, user_id, email, name, role):
    """
    Create a new user and associate them with a course.

    Args:
        pool: The connection pool to the database.
        course_id: The ID of the course to associate the user with.
        request: An object containing the user's email, name, and role.

    Returns:
        A tuple containing a boolean indicating the success of the operation and the ID of the created user.
        If the operation fails, the boolean value will be False and an error message will be returned instead.
    """
    async with pool.acquire() as conn:
        # check if the user already exists
        user = await conn.fetchrow('SELECT * FROM users WHERE email = $1', email)
        try:
            if not user:
                user_id = await conn.fetchval('''
                INSERT INTO users (id, email, name)
                VALUES ($1, $2, $3)
                RETURNING id
                ''', user_id, email, name)
                await conn.execute('''INSERT INTO teacher_courses (user_id, course_id, role) VALUES ($1, $2, $3)''', user_id, int(course_id), role)
            else:
                user_id = user[0]
                try:
                    await conn.execute('''INSERT INTO teacher_courses (user_id, course_id, role) VALUES ($1, $2, $3)''', user_id, int(course_id), role)
                except Exception as e:
                    return False, "Error: User already exists in course" + \
                        str(e)

            return True, user_id
        except Exception as e:
            return False, "Error: User not created" + str(e)


async def remove_course_by_id(pool, course_id):
    """
    Remove a course from the database by its ID.

    Args:
        pool: The connection pool to the database.
        course_id: The ID of the course to remove.

    Returns:
        A boolean indicating the success of the operation.
    """
    async with pool.acquire() as conn:
        try:
            await conn.execute('DELETE FROM courses WHERE id = $1', int(course_id))
            return True
        except Exception as e:
            print(f"Error: {e}")
            return False


async def remove_change_by_id(pool, change_id):
    """
    Remove a change from the database by its ID.

    Args:
        pool: The connection pool to the database.
        change_id: The ID of the change to remove.

    Returns:
        A boolean indicating the success of the operation.
    """
    async with pool.acquire() as conn:
        try:
            await conn.execute('DELETE FROM changes WHERE id = $1', int(change_id))
            return True
        except Exception as e:
            print(f"Error: {e}")
            return False
