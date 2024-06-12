#!/usr/bin/python3
import canvas.canvas as canvasapi
import canvas.connection as connection
import asyncio


class Printer:
    class indent_extra:
        def __init__(self, printer: "Printer") -> None:
            self.printer = printer

        def __enter__(self):
            self.printer.increase_indent()

        def __exit__(self, *_):
            self.printer.decrease_indent()

    def __init__(self, indentation="|  ", final_indent="|--") -> None:
        self.indentation = indentation
        self.final_indent = final_indent
        self.indent_len = 0

    def indent(self):
        return self.indent_extra(self)

    def increase_indent(self):
        self.indent_len += 1

    def decrease_indent(self):
        self.indent_len -= 1

    def print(self, string: str):
        print(
            f"{self.indent_len * self.indentation}{self.final_indent}{string}"
        )


async def main():
    async with (
        connection.ManualCanvasConnection.make_from_environment()
    ) as conn:
        api = canvasapi.Canvas(conn)
        p = Printer()

        async def list_assignment_overrides(course, assignment):
            with p.indent():
                p.print("Overrides:")
                with p.indent():
                    async for c in api.get_assignment_overrides(
                        course, assignment
                    ):
                        cdata = c.get_data()
                        p.print(f"{c.get_id()}, {cdata['title']}")

        async def list_assignments(course):
            with p.indent():
                p.print("Assignments:")
                with p.indent():
                    async for c in api.get_assignments(course):
                        cdata = c.get_data()
                        p.print(f"{cdata['id']}, {cdata['name']}")
                        await list_assignment_overrides(course, c)

        async def list_files(folder):
            if folder is None:
                return
            async for c in api.get_files(folder=folder):
                cdata = c.get_data()
                p.print(f"{cdata['id']}, {cdata['display_name']}")

        async def rec_print_dir(directory: canvasapi.Directory):
            with p.indent():
                for name, subdir in directory.items():
                    p.print(f"{name}")
                    await rec_print_dir(subdir)
                await list_files(directory.get_folder())

        async def list_folders(course):
            directory = await api.get_folders(course=course)
            await rec_print_dir(directory)

        async def list_module_items(course, module):
            with p.indent():
                p.print("Module items:")
                with p.indent():
                    async for c in api.get_module_items(course, module):
                        cdata = c.get_data()
                        p.print(f"{cdata['id']}, {cdata['title']}")
                        ass = c.get_associated_content()
                        with p.indent():
                            p.print(f"{type(ass)}")

        async def list_modules(course):
            with p.indent():
                p.print("Modules:")
                with p.indent():
                    async for c in api.get_modules(course):
                        cdata = c.get_data()
                        p.print(f"{cdata['id']}, {cdata['name']}")
                        await list_module_items(course, c)

        async def list_pages(course):
            with p.indent():
                p.print("Pages:")
                with p.indent():
                    try:
                        front_page = await api.get_front_page(course)
                    except canvasapi.ResponseError:
                        p.print("No front page")
                        front_page = canvasapi.Page(api).set_id(-1)
                    async for c in api.get_pages(course):
                        is_front = front_page.get_id() == c.get_id()
                        p.print(
                            f"{'[FRONT PAGE] ' if is_front else ''}"
                            f"{c.get_id()}, {c.get_data()['title']}"
                        )

        async def list_sections(course):
            with p.indent():
                p.print("Sections:")
                with p.indent():
                    async for c in api.get_sections(course):
                        cdata = c.get_data()
                        p.print(f"{cdata['id']}, {cdata['name']}")

        async def list_rubrics(course):
            with p.indent():
                p.print("Rubrics:")
                with p.indent():
                    async for c in api.get_rubrics(course):
                        cdata = c.get_data()
                        p.print(f"{cdata['id']}, {cdata['title']}")

        async def list_quizzes(course):
            with p.indent():
                p.print("Quizzes:")
                with p.indent():
                    async for c in api.get_quizes(course):
                        cdata = c.get_data()
                        p.print(f"{cdata['id']}, {cdata['title']}")

        async def list_courses():
            async for c in api.get_courses():
                cdata = c.get_data()
                p.print(f"{cdata['id']} {cdata['name']}")
                await list_assignments(c)
                await list_folders(c)
                await list_modules(c)
                await list_pages(c)
                await list_sections(c)
                await list_rubrics(c)
                await list_quizzes(c)

        await list_courses()


if __name__ == "__main__":
    asyncio.run(main())
