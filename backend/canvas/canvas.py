#!/usr/bin/python3
import httpx
import json
import typing


class CanvasConnection:
    """
    This class is an interface for connecting to canvas using this
    canvas wrapper. For a good implementation for this interface
    see canvas.connection.
    """

    async def request(self, method: str, url: str) -> httpx.Response:
        raise NotImplementedError()


class MissingRelatedObjects(RuntimeError):
    """
    Used in a canvas object if it is missing necassary related
    objects to do a given operation.
    """

    pass


class ResponseError(RuntimeError):
    """
    In case of an HTTP error.
    """

    def __init__(self, response: httpx.Response):
        self._response = response

    def get_response(self) -> httpx.Response:
        return self._response

    def raise_on_error(response: httpx.Response):
        if response.status_code != 200:
            raise ResponseError(response)


class UnresolvedObjectError(RuntimeError):
    """
    If an object has not resolved its data, and it is used
    this error gets raised.
    """

    pass


class CanvasObject:
    """
    Interface for a canvas object. Everything in here is implemented in
    all canvas objects.
    """

    def __init__(self, canvas: "Canvas"):
        self._data: dict | None = None
        self._id: int | None = None
        self._canvas: "Canvas" = canvas
        self._related = None

    def get_canvas(self) -> "Canvas":
        """
        gets the canvas root object.
        """
        return self._canvas

    def has_relate(self, obj: type["CanvasObject"]) -> bool:
        """
        checks if a type of related object is present.
        """
        return obj in self._related

    def get_relate(
        self, obj: type["CanvasObject"], raise_on_keyerror: bool = True
    ) -> typing.Union["CanvasObject", None]:
        """
        gets a related object, set 'raise_on_keyerror' to False, if you
        want it to return None if a related object is not present.
        """
        if not raise_on_keyerror and obj not in self._related:
            return None
        return self._related[obj]

    def json_init(self, json_data: dict) -> "CanvasObject":
        """
        Sets the data of the object based on the parsed json data.
        """
        self._data = json_data
        self._id = int(json_data["id"])
        return self

    def set_id(self, obj_id: int) -> "CanvasObject":
        """
        Sets an id for the canvas object.
        """
        self._id = obj_id
        return self

    async def apply_based_on_related(
        self, *cases: tuple[tuple["CanvasObject"], typing.Callable]
    ) -> typing.Any:
        """
        Used to perform different functions based on which
        related objects are present.
        """

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

    def set_related(
        self, *objs: typing.Union["CanvasObject", None]
    ) -> "CanvasObject":
        """
        Sets related canvas objects.
        """
        return self._set_related_dict_no_filter(
            {type(v): v for v in objs if v is not None}
        )

    def get_id(self) -> int:
        """
        gets a canvas objects id.
        """
        return self._id

    def has_data(self) -> bool:
        """
        Checks if the data of the canvas object is resolved.
        To resolve data if it is not resolved call .resolve().
        """
        return self._data is not None

    def get_data(self) -> dict:
        """
        gets a canvas objects parsed data in the same format as
        specified in canvas documentation.
        """
        if self._data is None:
            raise UnresolvedObjectError()
        return self._data

    async def _fast_resolve(
        self,
        *cases: tuple[tuple["CanvasObject"], typing.Callable],
    ) -> "CanvasObject":
        def url_caller(url_func):
            async def func(*objs):
                res = await self._canvas.get_connection().request(
                    "GET", url_func(*objs)
                )
                ResponseError.raise_on_error(res)
                self.json_init(json.load(res))
                return self

            return func

        return await self.apply_based_on_related(
            *((objs, url_caller(func)) for objs, func in cases)
        )

    async def resolve(self) -> "CanvasObject":
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
    async def resolve(self) -> CanvasObject:
        return self._fast_resolve(
            ((Course,), lambda c: f"/api/v1/course/{c.get_id()}")
        )


class AssignmentOverride(CanvasObject):
    async def resolve(self) -> CanvasObject:
        return await self._fast_resolve(
            (
                (Course, Assignment),
                lambda c, a: f"/api/v1/courses/{c.get_id()}"
                f"/assignments/{a.get_id()}"
                f"/overrides/{self.get_id()}",
            )
        )


class Assignment(CanvasObject):
    async def resolve(self) -> CanvasObject:
        return await self._fast_resolve(
            (
                (Course,),
                lambda c: f"/api/v1/courses/{c.get_id()}"
                f"/assignments/{self.get_id()}",
            )
        )


class Course(CanvasObject):
    async def resolve(self) -> CanvasObject:
        return await self._fast_resolve(
            (
                (Account,),
                lambda a: f"/api/v1/accounts/{a.get_id()}"
                f"courses/{self.get_id()}",
            ),
            ((), lambda: f"/api/v1/courses/{self.get_id()}"),
        )


class Group(CanvasObject):
    async def resolve(self) -> CanvasObject:
        return await self._fast_resolve(
            ((), lambda: f"/api/v1/groups/{self.get_id()}")
        )


class File(CanvasObject):
    async def resolve(self) -> CanvasObject:
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
    async def resolve(self) -> CanvasObject:
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
    async def resolve(self) -> CanvasObject:
        return await self._fast_resolve(
            (
                (Course,),
                lambda c: f"/api/v1/courses/{c.get_id()}"
                f"/modules/{self.get_id()}",
            )
        )


class Url:
    def __init__(self, url) -> None:
        self._url = url

    def get_url(self) -> str:
        return self._url


class ModuleItem(CanvasObject):
    async def resolve(self) -> CanvasObject:
        return await self._fast_resolve(
            (
                (Course, Module),
                lambda c, m: f"/api/v1/courses/{c.get_id()}"
                f"/modules/{m.get_id()}/items/{self.get_id()}",
            )
        )

    def get_associated_content(
        self,
    ) -> typing.Tuple[File, Assignment, "Quizz", Url, "Page", None]:
        """
        Gets the object associated with this content.
        Note this content is not yet resolved.
        """
        match (self.get_data()["type"]):
            case "File":
                return (
                    File(self.get_canvas())
                    .set_id(self.get_data()["content_id"])
                    .set_related(
                        self.get_relate(Course, raise_on_keyerror=False), self
                    )
                )
            case "Discussion":
                return None
            case "Assignment":
                return (
                    Assignment(self.get_canvas())
                    .set_id(self.get_data()["content_id"])
                    .set_related(
                        self.get_relate(Course, raise_on_keyerror=False), self
                    )
                )
            case "Quiz":
                return (
                    Quizz(self.get_canvas())
                    .set_id(self.get_data()["content_id"])
                    .set_related(
                        self.get_relate(Course, raise_on_keyerror=False), self
                    )
                )
            case "Subheader":
                return None
            case "ExternalUrl":
                return Url(self.get_data()["external_url"])
            case "ExternalTool":
                return None
            case "Page":
                return (
                    Page(self.get_canvas())
                    .set_url(self.get_data()["page_url"])
                    .set_related(
                        self.get_relate(Course, raise_on_keyerror=False), self
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

    def set_url(self, url: str | None) -> None:
        """
        Sets the page url.
        """
        self._url = url
        return self

    def get_url(self) -> str | None:
        """
        Gets the page url.
        """
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
    async def resolve(self) -> CanvasObject:
        return await self._fast_resolve(
            (
                (Course,),
                lambda c: f"/api/v1/courses/{c.get_id()}"
                f"/sections/{self.get_id()}",
            ),
            ((), lambda: f"/api/v1/sections/{self.get_id()}"),
        )


class Rubric(CanvasObject):
    async def resolve(self) -> CanvasObject:
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


class Quizz(CanvasObject):
    async def resolve(self) -> CanvasObject:
        return await self._fast_resolve(
            (Course,),
            lambda c: f"/api/v1/courses/{c.get_id()}"
            f"/quizzes/{self.get_id()}",
        )


class Directory:
    def __init__(self) -> None:
        self._dir: dict[str, "Directory"] = dict()
        self._folder = None

    def set_folder(self, folder: Folder | None) -> None:
        """
        Sets the folder object for this position in the directory.
        """
        self._folder = folder

    def get_folder(self) -> None | Folder:
        """
        Gets the folder.
        """
        return self._folder

    def items(self):
        """
        To iterate over folder names and associated directories.
        """
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
        """
        Adds a path to the directory.
        """
        return self._add_split(path.split("/"), folder)

    def resolve(self, path: str):
        """
        Gets a directory at a given path.
        """
        return self._resolve_split(path.split("/"))

    def at(self, name: str):
        """
        Gets a subfolder directory (like resolve but only one deep).
        """
        if name not in self._dir:
            return None
        return self._dir[name]


class Canvas:
    def __init__(self, conn: CanvasConnection) -> None:
        self._conn = conn

    def get_connection(self):
        """
        Gets the canvas connection object.
        """
        return self._conn

    async def get_assignment_overrides(
        self, course: Course, assignment: Assignment
    ) -> typing.AsyncGenerator[AssignmentOverride, None]:
        """
        Gets a list of assignment overrides from a given
        course and assignment object.
        """
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
        """
        Gets a list of assignment objects from course and
        optionally from a specific user or assigment group.
        """
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
        """
        Gets a list of courses, optionally from a specific user.
        """
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
        """
        Gets a list of files, from a course, user, group of folder.
        """
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
        """
        Gets a Directory from a course, user or group.
        """
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
        """
        Gets a list of modules from a course.
        """
        res = await self._conn.request(
            "GET", f"/api/v1/courses/{course.get_id()}/modules"
        )
        ResponseError.raise_on_error(res)
        for c in json.load(res):
            yield Module(self).json_init(c).set_related(course)

    async def get_module_items(
        self, course: Course, module: Module
    ) -> typing.AsyncGenerator[ModuleItem, None]:
        """
        Gets a list of module items from a course and module.
        """
        res = await self._conn.request(
            "GET",
            f"/api/v1/courses/{course.get_id()}/"
            f"modules/{module.get_id()}/items",
        )
        ResponseError.raise_on_error(res)
        for c in json.load(res):
            yield ModuleItem(self).json_init(c).set_related(course)

    async def get_pages(self, course: Course):
        """
        Gets a list of pages from a course.
        """
        res = await self._conn.request(
            "GET", f"/api/v1/courses/{course.get_id()}/pages"
        )
        ResponseError.raise_on_error(res)
        for c in json.load(res):
            yield Page(self).json_init(c).set_related(course)

    async def get_front_page(self, course: Course):
        """
        Gets the front page of a course.
        """
        res = await self._conn.request(
            "GET", f"/api/v1/courses/{course.get_id()}/front_page"
        )
        ResponseError.raise_on_error(res)
        return Page(self).json_init(json.load(res)).set_related(course)

    async def get_sections(self, course: Course):
        """
        Gets a list of sections from a course.
        """
        res = await self._conn.request(
            "GET", f"/api/v1/courses/{course.get_id()}/sections"
        )
        ResponseError.raise_on_error(res)
        for c in json.load(res):
            yield Section(self).json_init(c).set_related(course)

    async def get_rubrics(self, course: Course):
        """
        Gets a list of rubrics from a course.
        """
        res = await self._conn.request(
            "GET", f"/api/v1/courses/{course.get_id()}/rubrics"
        )
        ResponseError.raise_on_error(res)
        for c in json.load(res):
            yield Rubric(self).json_init(c).set_related(course)

    async def get_quizes(self, course: Course):
        """
        Gets a list of quizzes from a course.
        """
        res = await self._conn.request(
            "GET", f"/api/v1/courses/{course.get_id()}/quizzes"
        )
        ResponseError.raise_on_error(res)
        for c in json.load(res):
            yield Quizz(self).json_init(c).set_related(course)
