#!/usr/bin/python3
import httpx
import json
import typing


class CanvasConnection:
    async def request(self, method: str, url: str) -> httpx.Response:
        raise NotImplementedError()


class MissingRelatedObjects(RuntimeError):
    pass


class ResponseError(RuntimeError):
    def __init__(self, response: httpx.Response):
        self._response = response

    def get_response(self) -> httpx.Response:
        return self._response

    def raise_on_error(response: httpx.Response):
        if response.status_code != 200:
            raise ResponseError(response)


class CanvasObject:
    def __init__(self, canvas: "Canvas"):
        self._data: dict | None = None
        self._id: int | None = None
        self._canvas: "Canvas" = canvas
        self._related = None

    def get_connection(self) -> CanvasConnection:
        return self._conn

    def has_relate(self, obj: type["CanvasObject"]):
        return obj in self._related

    def get_relate(
        self, obj: type["CanvasObject"], raise_on_keyerror: bool = True
    ) -> typing.Union["CanvasObject", None]:
        if not raise_on_keyerror and obj not in self._related:
            return None
        return self._related[obj]

    def json_init(self, json_data: dict) -> "CanvasObject":
        self._data = json_data
        self._id = int(json_data["id"])
        return self

    def set_id(self, obj_id: int):
        self._id = obj_id
        return self

    async def apply_based_on_related(
        self, *cases: tuple[tuple["CanvasObject"], typing.Callable]
    ):
        def try_case(objtypes, url):
            for t in objtypes:
                if not self.has_relate(t):
                    return False
            return True

        for objtypes, func in cases:
            if try_case(objtypes, callable):
                return await func(*(self.get_relate(o) for o in objtypes))
        raise MissingRelatedObjects()

    def _set_related_dict_no_filter(
        self, objs: dict[type["CanvasObject"], "CanvasObject"]
    ) -> "CanvasObject":
        self._related = objs
        return self

    def set_related_dict(
        self,
        objs: dict[
            type[typing.Union["CanvasObject", None]],
            typing.Union["CanvasObject", None],
        ],
    ):
        return self._set_related_dict_no_filter(
            {k: v for k, v in objs.items() if v is not None}
        )

    def set_related(self, *objs: typing.Union["CanvasObject", None]):
        """
        Sets related canvas objects
        """
        return self._set_related_dict_no_filter(
            {type(v): v for v in objs if v is not None}
        )

    def get_id(self) -> int:
        return self._id

    def get_data(self):
        return self._data

    async def _fast_resolve(
        self,
        *cases: tuple[tuple["CanvasObject"], typing.Callable],
    ):
        def url_caller(url_func):
            async def func(*objs):
                res = await self._canvas.get_connection().request(
                    "GET", url_func(*objs)
                )
                ResponseError.raise_on_error(res)
                self.json_init(json.load(res))

            return func

        return await self.apply_based_on_related(
            *((objs, url_caller(func)) for objs, func in cases)
        )

    async def resolve(self):
        """
        If basic data is set (like id, or "url" in the case of Page), this
        function retrieves the object from canvas.
        """
        return self


class User(CanvasObject):
    pass


class Account(CanvasObject):
    pass


class AssignmentGroup(CanvasObject):
    async def resolve(self):
        return self._fast_resolve(
            ((Course,), lambda c: f"/api/v1/course/{c.get_id()}")
        )


class AssignmentOverride(CanvasObject):
    async def resolve(self):
        return await self._fast_resolve(
            (
                (Course, Assignment),
                lambda c, a: f"/api/v1/courses/{c.get_id()}"
                f"/assignments/{a.get_id()}"
                f"/overrides/{self.get_id()}",
            )
        )


class Assignment(CanvasObject):
    async def resolve(self):
        return await self._fast_resolve(
            (
                (Course,),
                lambda c: f"/api/v1/courses/{c.get_id()}"
                f"/assignments/{self.get_id()}",
            )
        )


class Course(CanvasObject):
    async def resolve(self):
        return await self._fast_resolve(
            (
                (Account,),
                lambda a: f"/api/v1/accounts/{a.get_id()}"
                f"courses/{self.get_id()}",
            ),
            ((), lambda: f"/api/v1/courses/{self.get_id()}"),
        )


class Group(CanvasObject):
    async def resolve(self):
        return await self._fast_resolve(
            ((), lambda: f"/api/v1/groups/{self.get_id()}")
        )


class File(CanvasObject):
    async def resolve(self):
        return await self._fast_resolve(
            (
                (Course,),
                lambda c: f"/api/v1/courses/{c.get_id()}"
                f"/files/{self.get_id()}",
            ),
            (
                (Group,),
                lambda g: f"/api/v1/courses/{g.get_id()}"
                f"/files/{self.get_id()}",
            ),
            (
                (User,),
                lambda u: f"/api/v1/users/{u.get_id()}"
                f"/files/{self.get_id()}",
            ),
            ((), lambda: f"/api/v1/files/{self.get_id()}"),
        )


class Folder(CanvasObject):
    async def resolve(self):
        return await self._fast_resolve(
            (
                (Course,),
                lambda c: f"/api/v1/courses/{c.get_id()}"
                f"/folders/{self.get_id()}",
            ),
            (
                (Group,),
                lambda g: f"/api/v1/courses/{g.get_id()}"
                f"/folders/{self.get_id()}",
            ),
            (
                (User,),
                lambda u: f"/api/v1/users/{u.get_id()}"
                f"/folders/{self.get_id()}",
            ),
            ((), lambda: f"/api/v1/folders/{self.get_id()}"),
        )


class Module(CanvasObject):
    async def resolve(self):
        return await self._fast_resolve(
            (
                (Course,),
                lambda c: f"/api/v1/courses/{c.get_id()}"
                f"/modules/{self.get_id()}",
            )
        )


class ModuleItem(CanvasObject):
    async def resolve(self):
        return await self._fast_resolve(
            (
                (Course, Module),
                lambda c, m: f"/api/v1/courses/{c.get_id()}"
                f"/modules/{m.get_id()}/items/{self.get_id()}",
            )
        )


class Page(CanvasObject):
    def __init__(self, canvas: "Canvas"):
        super().__init__(canvas)
        self._url = None

    def json_init(self, json_data: dict) -> "Course":
        self._data = json_data
        self._id = int(json_data["page_id"])
        self._url = json_data["url"]
        return self

    def set_url(self, url: str | None):
        self._url = url

    def get_url(self) -> str | None:
        return self._url

    async def resolve(self):
        identifier = self.get_id() or self.get_url()
        return await self._fast_resolve(
            (
                (Course,),
                lambda c: f"/api/v1/courses/{c.get_id()}/pages/{identifier}",
            ),
            (
                (Group,),
                lambda g: f"/api/v1/groups/{g.get_id()}/pages/{identifier}",
            ),
        )


class Section(CanvasObject):
    async def resolve(self):
        return await self._fast_resolve(
            (
                (Course,),
                lambda c: f"/api/v1/courses/{c.get_id()}"
                f"/sections/{self.get_id()}",
            ),
            ((), lambda: f"/api/v1/sections/{self.get_id()}"),
        )


class Rubric(CanvasObject):
    async def resolve(self):
        return await self._fast_resolve(
            (
                (Account,),
                lambda a: f"/api/v1/accounts/{a.get_id()}"
                f"/rubrics/{self.get_id()}",
            ),
            (
                (Course,),
                lambda c: f"/api/v1/courses/{c.get_id()}"
                f"/rubrics/{self.get_id()}",
            ),
        )


class Directory:
    def __init__(self) -> None:
        self._dir: dict[str, "Directory"] = dict()
        self._folder = None

    def set_folder(self, folder: Folder | None) -> None:
        self._folder = folder

    def get_folder(self) -> None | Folder:
        return self._folder

    def items(self):
        for name, dire in self._dir.items():
            yield name, dire

    def _add_split(
        self, path: list[str], folder: None | Folder = None
    ) -> None:
        if not len(path):
            self.set_folder(folder)
            return
        name, *path = path
        if name not in self._dir:
            self._dir[name] = Directory()
        self._dir[name]._add_split(path, folder)

    def _resolve_split(self, path: list[str]):
        if not len(path):
            return self
        name, *path = path
        if name not in self._dir:
            return None
        return self._dir[name]._resolve_split(path)

    def add(self, path: str, folder: None | Folder = None):
        return self._add_split(path.split("/"), folder)

    def resolve(self, path: str):
        return self._resolve_split(path.split("/"))

    def at(self, name: str):
        if name not in self._dir:
            return None
        return self._dir[name]


class Canvas:
    def __init__(self, conn: CanvasConnection) -> None:
        self._conn = conn

    def get_connection(self):
        return self._conn

    async def get_assignment_overrides(
        self, course: Course, assignment: Assignment
    ) -> typing.AsyncGenerator[AssignmentOverride, None]:
        res = await self._conn.request(
            "GET",
            f"/api/v1/courses/{course.get_id()}/"
            f"assignments/{assignment.get_id()}/overrides",
        )
        ResponseError.raise_on_error(res)
        for r in json.load(res):
            yield AssignmentOverride(self).json_init(r).set_related(
                course, assignment
            )

    async def get_assignments(
        self,
        course: Course,
        *,
        group: AssignmentGroup | None = None,
        user: User | None = None,
    ) -> typing.AsyncGenerator[Assignment, None]:
        if user is not None:
            res = await self._conn.request(
                "GET",
                f"/api/v1/users/{user.get_id()}/"
                f"courses/{course.get_id()}/assignments",
            )
        elif group is not None:
            res = await self._conn.request(
                "GET",
                f"/api/v1/courses/{course.get_id()}/"
                f"assignment_groups/{group.get_id()}/assignments",
            )
        else:
            res = await self._conn.request(
                "GET", f"/api/v1/courses/{course.get_id()}/assignments"
            )
        ResponseError.raise_on_error(res)
        for r in json.load(res):
            yield Assignment(self).json_init(r).set_related(
                course, group, user
            )

    async def get_courses(
        self, *, user: User | None = None
    ) -> typing.AsyncGenerator[Course, None]:
        if user is None:
            res = await self._conn.request("GET", "/api/v1/courses")
        else:
            res = await self._conn.request(
                "GET", f"/api/v1/users/{user.get_id()}/courses"
            )
        ResponseError.raise_on_error(res)
        for c in json.load(res):
            yield Course(self).json_init(c).set_related(user)

    async def get_files(
        self,
        *,
        course: Course | None = None,
        user: User | None = None,
        group: Group | None = None,
        folder: Folder | None = None,
    ):
        if course is not None:
            res = await self._conn.request(
                "GET", f"/api/v1/courses/{course.get_id()}/files"
            )
        elif user is not None:
            res = await self._conn.request(
                "GET", f"/api/v1/users/{user.get_id()}/files"
            )
        elif group is not None:
            res = await self._conn.request(
                "GET", f"/api/v1/groups/{group.get_id()}/files"
            )
        elif folder is not None:
            res = await self._conn.request(
                "GET", f"/api/v1/folders/{folder.get_id()}/files"
            )
        else:
            raise ValueError("select a course, user, group or folder")
        ResponseError.raise_on_error(res)
        for c in json.load(res):
            yield File(self).json_init(c).set_related(
                course, user, group, folder
            )

    async def get_folders(
        self,
        *,
        course: Course | None = None,
        user: User | None = None,
        group: Group | None = None,
    ):
        if course is not None:
            res = await self._conn.request(
                "GET", f"/api/v1/courses/{course.get_id()}/folders"
            )
        elif user is not None:
            res = await self._conn.request(
                "GET", f"/api/v1/users/{user.get_id()}/folders"
            )
        elif group is not None:
            res = await self._conn.request(
                "GET", f"/api/v1/groups/{group.get_id()}/folders"
            )
        else:
            raise ValueError("select a course, user, group or folder")

        ResponseError.raise_on_error(res)
        d = Directory()
        for c in json.load(res):
            f = Folder(self).json_init(c).set_related(course, user, group)
            path = c["full_name"]
            d.add(path, f)
        return d

    async def get_modules(self, course: Course):
        res = await self._conn.request(
            "GET", f"/api/v1/courses/{course.get_id()}/modules"
        )
        ResponseError.raise_on_error(res)
        for c in json.load(res):
            yield Module(self).json_init(c).set_related(course)

    async def get_module_items(self, course: Course, module: Module):
        res = await self._conn.request(
            "GET",
            f"/api/v1/courses/{course.get_id()}/"
            f"modules/{module.get_id()}/items",
        )
        ResponseError.raise_on_error(res)
        for c in json.load(res):
            yield ModuleItem(self).json_init(c).set_related(course)

    async def get_pages(self, course: Course):
        res = await self._conn.request(
            "GET", f"/api/v1/courses/{course.get_id()}/pages"
        )
        ResponseError.raise_on_error(res)
        for c in json.load(res):
            yield Page(self).json_init(c).set_related(course)

    async def get_front_page(self, course: Course):
        res = await self._conn.request(
            "GET", f"/api/v1/courses/{course.get_id()}/front_page"
        )
        ResponseError.raise_on_error(res)
        return Page(self).json_init(json.load(res)).set_related(course)

    async def get_sections(self, course: Course):
        res = await self._conn.request(
            "GET", f"/api/v1/courses/{course.get_id()}/sections"
        )
        ResponseError.raise_on_error(res)
        for c in json.load(res):
            yield Section(self).json_init(c).set_related(course)

    async def get_rubrics(self, course: Course):
        res = await self._conn.request(
            "GET", f"/api/v1/courses/{course.get_id()}/rubrics"
        )
        ResponseError.raise_on_error(res)
        for c in json.load(res):
            yield Rubric(self).json_init(c).set_related(course)
