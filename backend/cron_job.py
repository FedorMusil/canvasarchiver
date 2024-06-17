import canvas.canvas as canvasapi
import canvas.connection as connection
from db.get_db_conn import get_db_conn
import json
import asyncio


async def handle_course(course):
    cdata = course.get_data()

    db_conn = await get_db_conn()
    async with db_conn.transaction():
        result = await db_conn.fetchrow('''
            SELECT * FROM courses
            WHERE course_code = $1
        ''', cdata['course_code'])

        if result:
            return result['id'], False
        else:
            result = await db_conn.fetchrow('''
                INSERT INTO courses (name, course_code)
                VALUES ($1, $2)
                RETURNING id
            ''', cdata['name'], cdata['course_code'])
            return result['id'], True


async def change_query(data, item_type, change_type, course_id):
    db_conn = await get_db_conn()
    async with db_conn.transaction():
        await db_conn.execute('''
            INSERT INTO changes (course_id, change_type, timestamp, item_type, diff)
            VALUES ($1, $2, NOW(), $3, $4)
        ''', course_id, change_type, item_type, json.dumps(data))


async def save_new_course(course, course_id):
    cdata = course.get_data()

    await change_query(cdata, 'Course', 'Addition', course_id)


async def save_course_pages(api, course, course_id):
    async for page in api.get_pages(course):
        pdata = page.get_data()

        await change_query(pdata, 'Page', 'Addition', course_id)


async def save_modules(api, course, course_id):
    async for module in api.get_modules(course):
        mdata = module.get_data()

        await change_query(mdata, 'Module', 'Addition', course_id)


async def save_assignments(api, course, course_id):
    async for assignment in api.get_assignments(course):
        adata = assignment.get_data()

        await change_query(adata, 'Assignment', 'Addition', course_id)


async def save_quizzes(api, course, course_id):
    async for quiz in api.get_quizzes(course):
        qdata = quiz.get_data()

        await change_query(qdata, 'Quiz', 'Addition', course_id)


async def save_sections(api, course, course_id):
    async for section in api.get_sections(course):
        sdata = section.get_data()

        await change_query(sdata, 'Section', 'Addition', course_id)


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
    dir = await api.get_directories(course=course)
    await dir_diffs(api, dir, course_id)


async def main():
    async with connection.ManualCanvasConnection.make_from_environment() as conn:
        api = canvasapi.Canvas(conn)

        async for course in api.get_courses():
            course_id, is_new = await handle_course(course)
            print(f"Course: {course_id}")
            if is_new:
                await save_new_course(course, course_id)
                await save_course_pages(api, course, course_id)
                print("New course added")
            else:
                await page_diffs(api, course, course_id)
                await filesystem_diffs(api, course, course_id)
                print("Course updated")


if __name__ == "__main__":
    asyncio.run(main())
