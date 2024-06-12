import canvas.canvas as canvasapi
import canvas.connection as connection
import asyncio


async def course_diff(course):
    cdata = course.get_data()
    print(f"Course: {cdata['id']}, {cdata['name']}")


async def page_diffs(api, course):
    async for page in api.get_pages(course):
        pdata = page.get_data()
        print(f"Page: {pdata['page_id']}, {pdata['title']}")


async def dir_diffs(api, dir):
    for name, subdir in dir.items():
        await dir_diffs(api, subdir)
    folder = dir.get_folder()
    if folder is not None:
        async for file in api.get_files(folder=folder):
            fdata = file.get_data()
            print(f"File: {fdata['id']}, {fdata['display_name']}")


async def filesystem_diffs(api, course):
    dir = await api.get_folders(course=course)
    await dir_diffs(api, dir)


async def main():
    async with connection.ManualCanvasConnection.make_from_environment() as conn:
        api = canvasapi.Canvas(conn)

        async for course in api.get_courses():
            await course_diff(course)
            await page_diffs(api, course)
            await filesystem_diffs(api, course)


if __name__ == "__main__":
    asyncio.run(main())
