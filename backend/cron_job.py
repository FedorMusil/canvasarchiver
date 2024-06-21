import canvas.canvas as canvasapi
import canvas.connection as connection
import program as prog
import controllers.frontend_api as fapi
from db.get_db_conn import create_pool
import time
import json
import asyncio
import tempfile
import subprocess


async def handle_course(pool, course):
    cdata = course.get_data()

    obj = prog.CourseCreate(
        name=cdata['name'],
        course_code=cdata['course_code']
    )
    err, msg = await fapi.check_course_create(pool, obj)
    if err == 200:
        err, course_id = await fapi.post_course(pool, obj)
        if err != 200:
            raise Exception(f"Error: {err} - {course_id}")
        return course_id, True

    elif err == 400:
        course_id = await fapi.get_course_id_by_code(pool, cdata['course_code'])
        return course_id, False

    else:
        raise Exception(f"Error: {err} - {msg}")


async def add_change(pool, course_id, request):
    err, msg = await fapi.post_change(pool, course_id, request)
    if not err:
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


# handle pages separately because they for some reason have page_id
# instead of id
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


async def dir_diffs(pool, api, dir, course_id):
    for name, subdir in dir.items():
        await dir_diffs(pool, api, subdir, course_id)
    folder = dir.get_folder()
    if folder is not None:
        async for file in api.get_files(folder=folder):
            fdata = file.get_data()
            print(f"File: {fdata['id']}, {fdata['display_name']}")


async def filesystem_diffs(pool, api, course, course_id):
    dir = await api.get_directory(course=course)
    await dir_diffs(pool, api, dir, course_id)


def get_most_recent_change(changes, item_type, item_id):
    filtered_changes = [change for change in changes if change['item_id']
                        == item_id and change['item_type'] == item_type]
    sorted_changes = sorted(
        filtered_changes,
        key=lambda change: change['timestamp'],
        reverse=True
    )
    return sorted_changes[0] if sorted_changes else None


async def get_diff(json1, json2):
    json_diff_path = '.\\json\\json'
    str1 = json.dumps(json1)
    str2 = json.dumps(json2)
    with tempfile.TemporaryFile() as f:
        f.write(b'diff')
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


async def page_diffs(pool, api, course, changes, course_id):
    async for item in api.get_pages(course):
        data = item.get_data()
        most_recent_version = get_most_recent_change(
            changes, 'Page', data['page_id'])
        if most_recent_version is None:
            print(json.dumps(data))
            request = prog.ChangeCreate(
                item_id=data['page_id'],
                course_id=course_id,
                change_type='Addition',
                timestamp=time.time(),
                item_type='Page',
                older_diff=0,
                diff=json.dumps(data)
            )
            await add_change(pool, course_id, request)

        else:
            diff = await get_diff(data, json.loads(most_recent_version['diff']))
            if diff:
                older_diff = most_recent_version['older_diff'] if most_recent_version['older_diff'] else 0
                await fapi.remove_change_by_id(pool, most_recent_version['id'])
                request = prog.ChangeCreate(
                    item_id=data['id'],
                    course_id=course_id,
                    change_type='Modification',
                    timestamp=time.time(),
                    item_type='Page',
                    older_diff=older_diff,
                    diff=json.dumps(diff)
                )
                await add_change(pool, course_id, request)
                new_diff_id = await get_most_recent_change(changes, 'Page', data['id'])['id']
                request = prog.ChangeCreate(
                    item_id=data['id'],
                    course_id=course_id,
                    change_type='Modification',
                    timestamp=time.time(),
                    item_type='Page',
                    older_diff=new_diff_id,
                    diff=json.dumps(data)
                )
                await add_change(pool, course_id, request)


async def process_item_diff(pool, item, item_type, course_id, changes):
    data = item.get_data()
    most_recent_version = get_most_recent_change(
        changes, item_type, data['id'])
    if most_recent_version is None:
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
    else:
        diff = await get_diff(data, json.loads(most_recent_version['diff']))
        if diff:
            older_diff = most_recent_version['older_diff'] if most_recent_version['older_diff'] else 0
            await fapi.remove_change_by_id(pool, most_recent_version['id'])
            request = prog.ChangeCreate(
                item_id=data['id'],
                course_id=course_id,
                change_type='Modification',
                timestamp=time.time(),
                item_type=item_type,
                older_diff=older_diff,
                diff=json.dumps(diff)
            )
            await add_change(pool, course_id, request)
            changes = await fapi.get_changes_by_courseid(pool, course_id)
            new_diff_id = get_most_recent_change(
                changes, item_type, data['id'])['id']
            request = prog.ChangeCreate(
                item_id=data['id'],
                course_id=course_id,
                change_type='Modification',
                timestamp=time.time(),
                item_type=item_type,
                older_diff=new_diff_id,
                diff=json.dumps(data)
            )
            await add_change(pool, course_id, request)


async def calc_diffs(pool, api, course, changes, course_id):
    await process_item_diff(pool, course, 'Course', course_id, changes)

    async for item in api.get_assignments(course):
        await process_item_diff(pool, item, 'Assignment', course_id, changes)

    async for item in api.get_quizes(course):
        await process_item_diff(pool, item, 'Quiz', course_id, changes)

    async for item in api.get_modules(course):
        await process_item_diff(pool, item, 'Module', course_id, changes)

    async for item in api.get_sections(course):
        await process_item_diff(pool, item, 'Section', course_id, changes)


async def main():
    async with connection.ManualCanvasConnection.make_from_environment() as conn:
        api = canvasapi.Canvas(conn)

        pool = await create_pool()
        async for course in api.get_courses():
            course_id, is_new = await handle_course(pool, course)
            print(f"Course: {course_id}")
            print(f"New: {is_new}")
            if is_new:
                await save_new_course(pool, course, course_id)

                # handle pages separately because they for some reason have
                # page_id instead of id
                await save_course_pages(pool, api, course, course_id)
                await save_new_items(pool, course, course_id, 'Assignment', api.get_assignments)
                await save_new_items(pool, course, course_id, 'Quiz', api.get_quizes)
                await save_new_items(pool, course, course_id, 'Module', api.get_modules)
                await save_new_items(pool, course, course_id, 'Section', api.get_sections)
                print("New course added")
            else:
                changes = await fapi.get_changes_by_courseid(pool, course_id)

                # handle pages separately because they for some reason have
                # page_id instead of id
                await page_diffs(pool, api, course, changes, course_id)
                await calc_diffs(pool, api, course, changes, course_id)
                print("Course updated")
        await pool.close()


if __name__ == "__main__":
    asyncio.run(main())