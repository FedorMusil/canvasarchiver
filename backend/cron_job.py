import canvas.canvas as canvasapi
import canvas.connection as connection
from db.get_db_conn import get_db_conn
import psycopg2.extras
import json
import asyncio


async def handle_course(course):
    cdata = course.get_data()

    with get_db_conn() as db_conn:
        cur = db_conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        cur.execute('''
            SELECT * FROM courses
            WHERE course_code = %s
        ''', (cdata['course_code'],))

        result = cur.fetchone()
        if result:
            return result['id'], True
        else:
            cur.execute('''
                INSERT INTO courses (name, course_code)
                VALUES (%s, %s)
                RETURNING id
            ''', (cdata['name'], cdata['course_code']))
            db_conn.commit()
            return cur.fetchone()['id'], False


async def save_new_course(course, course_id):
    cdata = course.get_data()

    with get_db_conn() as db_conn:
        cur = db_conn.cursor()

        cur.execute('''
            INSERT INTO changes (course_id, change_type, timestamp, item_type, diff)
            VALUES (%s, 'Addition', NOW(), 'Course', %s)
        ''', (course_id, json.dumps(cdata)))


async def save_course_pages(api, course, course_id):
    async for page in api.get_pages(course):
        pdata = page.get_data()
        with get_db_conn() as db_conn:
            cur = db_conn.cursor()

            cur.execute('''
                INSERT INTO changes (course_id, change_type, timestamp, item_type, diff)
                VALUES (%s, 'Addition', NOW(), 'Pages', %s)
            ''', (course_id, json.dumps(pdata)))


async def page_diffs(api, course, course_id):
    async for page in api.get_pages(course):
        pdata = page.get_data()
        print(f"Page: {pdata['page_id']}, {pdata['title']}")


async def dir_diffs(api, dir, course_id):
    for name, subdir in dir.items():
        await dir_diffs(api, subdir, course_id)
    folder = dir.get_folder()
    if folder is not None:
        async for file in api.get_files(folder=folder):
            fdata = file.get_data()
            print(f"File: {fdata['id']}, {fdata['display_name']}")


async def filesystem_diffs(api, course, course_id):
    dir = await api.get_folders(course=course)
    await dir_diffs(api, dir, course_id)


async def main():
    async with connection.ManualCanvasConnection.make_from_environment() as conn:
        api = canvasapi.Canvas(conn)

        async for course in api.get_courses():
            course_id, is_new = await handle_course(course)
            print(f"Course: {course_id}")
            if is_new:
                # store new course data
                await save_new_course(course, course_id)
                await save_course_pages(api, course, course_id)
            else:
                # calculate and store diffs
                await page_diffs(api, course, course_id)
                await filesystem_diffs(api, course, course_id)


if __name__ == "__main__":
    asyncio.run(main())
