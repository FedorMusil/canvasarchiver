import canvas.canvas as canvasapi
import canvas.connection as connection
import asyncio


async def save_course(course):
    cdata = course.get_data()
    print(f"Course: {cdata['name']}")
    # something SQL related
    pass


async def save_pages(api, course):
    async for page in api.get_pages(course):
        pdata = page.get_data()
        print(f"Page: {pdata['title']}")


async def main():
    async with connection.ManualCanvasConnection.make_from_environment() as conn:
        api = canvasapi.Canvas(conn)

        async for course in api.get_courses():
            await save_course(course)
            await save_pages(api, course)


if __name__ == "__main__":
    asyncio.run(main())
