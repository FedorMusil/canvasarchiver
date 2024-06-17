import canvas.canvas as canvasapi
import canvas.connection as connection
import program as prog
import controllers.frontend_api as fapi
from db.get_db_conn import create_pool
import time
import json
import asyncio


async def handle_course(pool, course):
    cdata = course.get_data()

    obj = prog.CourseCreate(name=cdata['name'], course_code=cdata['course_code'])
    err, msg = await fapi.check_course_create(pool, obj)
    if err == 200:
        err, course_id = await fapi.post_course(pool, obj)
        if err != 200:
            raise Exception(f"Error: {err} - {course_id}")
        return course_id, True

    elif err == 400:
        course_id = await fapi.get_course_id(pool, cdata['course_code'])
        return course_id, False

    else:
        raise Exception(f"Error: {err} - {msg}")


async def add_change(pool, course_id, request):
    err, msg = await fapi.post_change(pool, course_id, request)
    if err != 200:
        raise Exception(f"Error: {err} - {msg}")


async def save_new_course(pool, course, course_id):
    cdata = course.get_data()
    request = prog.ChangeCreate(
        item_id=cdata['id'],
        course_id=course_id,
        change_type='Addition',
        timestamp=time.time(),
        item_type='Course',
        older_diff=0,
        diff=json.dumps(cdata)
    )

    await add_change(pool, course_id, request)


async def save_course_pages(pool, api, course, course_id):
    async for page in api.get_pages(course):
        pdata = page.get_data()
        request = prog.ChangeCreate(
            item_id=pdata['page_id'],
            course_id=course_id,
            change_type='Addition',
            timestamp=time.time(),
            item_type='Page',
            older_diff=0,
            diff=json.dumps(pdata)
        )

        await add_change(pool, course_id, request)


async def save_new_items(pool, course, course_id, item_type, api_method):
    async for item in api_method(course):
        data = item.get_data()
        request = prog.ChangeCreate(
            item_id=data['id'],
            course_id=course_id,
            change_type='Addition',
            timestamp=time.time(),
            item_type=item_type,
            older_diff=0,
            diff=json.dumps(data)
        )

        await add_change(pool, course_id, request)


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

        async with create_pool() as pool:
            async for course in api.get_courses():
                course_id, is_new = await handle_course(pool, course)
                print(f"Course: {course_id}")
                if is_new:
                    await save_new_course(pool, course, course_id)
                    await save_course_pages(pool, api, course, course_id)
                    await save_new_items(pool, course, course_id, 'Assignment', api.get_assignments)
                    await save_new_items(pool, course, course_id, 'File', api.get_files)
                    await save_new_items(pool, course, course_id, 'Quiz', api.get_quizes)
                    await save_new_items(pool, course, course_id, 'Module', api.get_modules)
                    await save_new_items(pool, course, course_id, 'Section', api.get_sections)
                    print("New course added")
                else:
                    await page_diffs(pool, api, course, course_id)
                    await filesystem_diffs(pool, api, course, course_id)
                    print("Course updated")


if __name__ == "__main__":
    asyncio.run(main())
