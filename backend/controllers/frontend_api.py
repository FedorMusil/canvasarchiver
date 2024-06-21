import json
from os import getenv
from datetime import datetime
import json

production = getenv('PRODUCTION', False)


def check_required_keys(json_obj, required_keys):
    for key, value in required_keys.items():
        if key not in json_obj:
            return False, f"Missing required key: {key}"
        if not isinstance(json_obj[key], value['type']):
            return False, f"Invalid type for key: {key}. Expected {
                value['type'].__name__}, got {type(json_obj[key]).__name__}"
        if 'length' in value and len(str(json_obj[key])) > value['length']:
            return False, f"Value for key: {
                key} exceeds maximum length of {value['length']}"
        if 'enum' in value and json_obj[key] not in value['enum']:
            return False, f"Invalid value for key: {
                key}. Expected one of {value['enum']}, got {json_obj[key]}"
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
        changes = await conn.fetch('SELECT * FROM changes WHERE course_id = $1 ORDER BY timestamp DESC LIMIT 10', course_id)
        return changes


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


class UserRequest:
    def __init__(self, email, name, role):
        self.email = email
        self.name = name
        self.role = role


class CourseCreate():
    def __init__(self, name, course_code):
        self.name = name
        self.course_code = course_code


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
        course = await conn.fetch('SELECT * FROM teacher_courses WHERE user_id = $1', course_id)
        if not user:
            # Create user
            request = UserRequest(email="", name="", role="")

            await post_user(pool, course_id, request)

            user = await conn.fetch('SELECT * FROM users WHERE id = $1', user_id)

        if not course:
            request = CourseCreate(name="", course_code="")

            await post_course(pool, request)

        return user


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


async def post_course(pool, course_data):
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
            try:
                course_id = await conn.fetchval('''
                INSERT INTO courses (name, course_code)
                VALUES ($1, $2)
                RETURNING id
                ''', course_data.name, course_data.course_code)
            except Exception as e:
                return 500, "An error happened in the database"

            if not course_id:
                return 400, "Error: Course not created"

            return 200, course_id
    except Exception as e:
        return 500, "An error occurred in the database"


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
                ''', int(course_id), datetime.now(), request.item_id, request.change_type, request.item_type, json.dumps(request.diff))
            else:
                change_id = await conn.fetchval('''
                INSERT INTO changes (course_id, timestamp, item_id, change_type, item_type, older_diff, diff)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
                ''', int(course_id), datetime.now(), request.item_id, request.change_type, request.item_type, request.older_diff, json.dumps(request.diff))

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


async def post_user(pool, course_id, request):
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
            print(
                "request to post_user failed, datadump:",
                "course_id:\n",
                course_id,
                "request:\n",
                request,
                "error:\n",
                e)
            return False, "Error: User not created"
