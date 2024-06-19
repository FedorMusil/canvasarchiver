#!/usr/bin/python3
import canvas._impl as _impl
import httpx
import json
import typing


class CanvasConnection:
    """
    This class is an interface for connecting to canvas using this
    canvas wrapper. For a good implementation for this interface
    see canvas.connection.
    """

    async def request(
        self,
        method: str,
        url: httpx.URL | str,
        *,
        data=None,
        params=None,
    ) -> httpx.Response:
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
        if response.status_code < 200 or response.status_code >= 300:
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

    def get_canvas_post_arg_name(self) -> str:
        """
        The string used for post arguments in the data.
        Largely an implementation detail.
        """
        raise NotImplementedError()

    def get_canvas_url_part(self) -> str:
        """
        The string used in the url to select the object.
        Largely an implementation detail.
        """
        raise NotImplementedError()

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

    def apply_based_on_related(
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
                return func(*(self.get_relate(o) for o in objtypes))
        raise MissingRelatedObjects()

    def set_related(
        self, *objs: typing.Union["CanvasObject", None]
    ) -> "CanvasObject":
        """
        Sets related canvas objects.
        """
        self._related = {type(v): v for v in objs if v is not None}
        return self

    def has_id(self):
        return self._id is not None

    def get_id(self, raise_on_unresolved=True) -> int:
        """
        gets a canvas objects id.
        """
        if raise_on_unresolved and not self.has_id():
            raise UnresolvedObjectError()
        return self._id

    def has_data(self) -> bool:
        """
        Checks if the data of the canvas object is resolved.
        To resolve data if it is not resolved call .resolve().
        """
        return self._data is not None

    def get_data(self, raise_on_unresolved=True) -> dict:
        """
        gets a canvas objects parsed data in the same format as
        specified in canvas documentation.
        """
        if raise_on_unresolved and not self.has_data():
            raise UnresolvedObjectError()
        return self._data

    def get_possible_object_relations_for_get(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        """
        The object relations needed to get this object.
        Largely an implementation detail.
        """
        raise NotImplementedError()

    def get_possible_object_relations_for_list(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        """
        The object relations needed to list this object.
        Largely an implementation detail.
        """
        return self.get_possible_object_relations_for_get()

    def get_possible_object_relations_for_create(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        """
        The object relations needed to create this object.
        Largely an implementation detail.
        """
        return self.get_possible_object_relations_for_list()

    def get_possible_object_relations_for_edit(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        """
        The object relations needed to edit this object.
        Largely an implementation detail.
        """
        return self.get_possible_object_relations_for_get()

    def get_possible_object_relations_for_delete(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        """
        The object relations needed to delete this object.
        Largely an implementation detail.
        """
        return self.get_possible_object_relations_for_edit()

    async def resolve(self) -> "CanvasObject":
        """
        If basic data is set (like id, or "url" in the case of Page), this
        function retrieves the object from canvas.
        """

        async def make_url(*objs):
            url = (
                "/api/v1"
                + "".join(
                    (f"/{o.get_canvas_url_part()}/{o.get_id()}" for o in objs)
                )
                + f"/{self.get_canvas_url_part()}/{self.get_id()}"
            )
            res = await self._canvas.get_connection().request("GET", url)
            ResponseError.raise_on_error(res)
            self.json_init(json.load(res))
            return self

        return await self.apply_based_on_related(
            *(
                (objtypes, make_url)
                for objtypes in self.get_possible_object_relations_for_get()
            )
        )

    def get_list(self) -> typing.AsyncGenerator["CanvasObject", None]:
        async def make_url(*objs):
            url = (
                "/api/v1"
                + "".join(
                    (f"/{o.get_canvas_url_part()}/{o.get_id()}" for o in objs)
                )
                + f"/{self.get_canvas_url_part()}"
            )
            while url is not None:
                res = await self._canvas.get_connection().request("GET", url)
                ResponseError.raise_on_error(res)
                for r in json.load(res):
                    yield type(self)(self.get_canvas()).json_init(
                        r
                    ).set_related(*self._related.values())
                url = _impl.get_link_rel(res, "next")
                if url is not None:
                    url = httpx.URL(url)

        return self.apply_based_on_related(
            *(
                (objtypes, make_url)
                for objtypes in self.get_possible_object_relations_for_list()
            )
        )

    def create(self, **kwargs):
        if self.has_data():
            kwargs.update(self.get_data())
        flattened = _impl.flatten_dict(kwargs)
        print(flattened)

        async def make_url(*objs):
            url = (
                "/api/v1"
                + "".join(
                    (f"/{o.get_canvas_url_part()}/{o.get_id()}" for o in objs)
                )
                + f"/{self.get_canvas_url_part()}"
            )
            res = await self._canvas.get_connection().request(
                "POST", url, data=flattened
            )
            ResponseError.raise_on_error(res)
            self.json_init(json.load(res))
            return self

        return self.apply_based_on_related(
            *(
                (objtypes, make_url)
                for objtypes in self.get_possible_object_relations_for_create()
            )
        )


class User(CanvasObject):
    def get_canvas_post_arg_name(self) -> str:
        return "user"

    def get_canvas_url_part(self) -> str:
        return "users"


class Account(CanvasObject):
    def get_canvas_post_arg_name(self) -> str:
        return "account"

    def get_canvas_url_part(self) -> str:
        return "accounts"


class AssignmentGroup(CanvasObject):
    """
    https://canvas.instructure.com/doc/api/assignment_groups.html
    """

    def get_canvas_post_arg_name(self) -> str:
        return None

    def get_canvas_url_part(self) -> str:
        return "assignment_groups"

    def get_possible_object_relations_for_get(
        self,
    ) -> tuple[tuple[CanvasObject]]:
        return ((Course,),)


class AssignmentOverride(CanvasObject):
    """
    https://canvas.instructure.com/doc/api/assignments.html
    """

    def get_canvas_post_arg_name(self) -> str:
        return "assignment_override"

    def get_canvas_url_part(self) -> str:
        return "overrides"

    def get_possible_object_relations_for_get(
        self,
    ) -> tuple[tuple[CanvasObject]]:
        return ((Course, Assignment),)


class Assignment(CanvasObject):
    """
    https://canvas.instructure.com/doc/api/assignments.html
    """

    def get_canvas_post_arg_name(self) -> str:
        return "assignment"

    def get_canvas_url_part(self) -> str:
        return "assignments"

    def get_possible_object_relations_for_get(
        self,
    ) -> tuple[tuple[CanvasObject]]:
        return ((Course,),)

    def get_possible_object_relations_for_list(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        return ((Course,), (AssignmentGroup,), (User,))

    def get_possible_object_relations_for_create(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        return ((Course,),)


class Course(CanvasObject):
    """
    https://canvas.instructure.com/doc/api/courses.html
    """

    def get_canvas_post_arg_name(self) -> str:
        return "course"

    def get_canvas_url_part(self) -> str:
        return "courses"

    def get_possible_object_relations_for_get(
        self,
    ) -> tuple[tuple[CanvasObject]]:
        return ((Account,), ())

    def get_possible_object_relations_for_list(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        return ((User,), ())

    def get_possible_object_relations_for_create(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        return ((Account,),)

    def get_possible_object_relations_for_edit(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        """
        The object relations needed to edit this object.
        Largely an implementation detail.
        """
        return ((),)


class File(CanvasObject):
    """
    https://canvas.instructure.com/doc/api/files.html
    """

    def get_canvas_post_arg_name(self) -> str:
        return None

    def get_canvas_url_part(self) -> str:
        return "files"

    def get_possible_object_relations_for_get(
        self,
    ) -> tuple[tuple[CanvasObject]]:
        return ((Course,), (Group,), (User,), ())

    def get_possible_object_relations_for_list(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        return ((Course,), (Group,), (User,), (Folder,))

    def get_possible_object_relations_for_create(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        return ((Folder,),)

    def get_possible_object_relations_for_edit(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        return ((),)


class Folder(CanvasObject):
    """
    https://canvas.instructure.com/doc/api/files.html
    """

    def get_canvas_post_arg_name(self) -> str:
        return None

    def get_canvas_url_part(self) -> str:
        return "folders"

    def get_possible_object_relations_for_get(
        self,
    ) -> tuple[tuple[CanvasObject]]:
        return ((Course,), (Group,), (User,), ())

    def get_possible_object_relations_for_list(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        return ((Course,), (Group,), (User,), (Folder,))

    def get_possible_object_relations_for_edit(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        return ((),)

    def get_possible_object_relations_for_delete(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        return ((),)


class Group(CanvasObject):
    """
    https://canvas.instructure.com/doc/api/groups.html
    """

    def get_canvas_post_arg_name(self) -> str:
        return None

    def get_canvas_url_part(self) -> str:
        return "groups"

    def get_possible_object_relations_for_get(
        self,
    ) -> tuple[tuple[CanvasObject]]:
        return ((),)

    def get_possible_object_relations_for_list(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        raise NotImplementedError()

    def get_list(self) -> typing.AsyncGenerator[CanvasObject, None]:
        raise NotImplementedError()

    def get_possible_object_relations_for_create(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        return ((),)


class Module(CanvasObject):
    """
    https://canvas.instructure.com/doc/api/modules.html
    """

    def get_canvas_post_arg_name(self) -> str:
        return "module"

    def get_canvas_url_part(self) -> str:
        return "modules"

    def get_possible_object_relations_for_get(
        self,
    ) -> tuple[tuple[CanvasObject]]:
        return ((Course,),)


class Url:
    def __init__(self, url) -> None:
        self._url = url

    def get_url(self) -> str:
        return self._url


class ModuleItem(CanvasObject):
    """
    https://canvas.instructure.com/doc/api/modules.html
    """

    def get_canvas_post_arg_name(self) -> str:
        return "module_item"

    def get_canvas_url_part(self) -> str:
        return "items"

    def get_possible_object_relations_for_get(
        self,
    ) -> tuple[tuple[CanvasObject]]:
        return ((Course, Module),)

    def get_associated_content(
        self,
    ) -> typing.Tuple[File, Assignment, "Quiz", Url, "Page", None]:
        """
        Gets the object associated with this content.
        Note this content is not yet resolved.
        """
        simple_mapping = {"File": File, "Assignment": Assignment, "Quiz": Quiz}
        if self.get_data()["type"] in simple_mapping:
            return (
                simple_mapping[self.get_data()["type"]](self.get_canvas())
                .set_id(self.get_data()["content_id"])
                .set_related(
                    self.get_relate(Course, raise_on_keyerror=False), self
                )
            )
        elif self.get_data()["type"] == "Page":
            return (
                Page(self.get_canvas())
                .set_url(self.get_data()["page_url"])
                .set_related(
                    self.get_relate(Course, raise_on_keyerror=False), self
                )
            )
        elif self.get_data()["type"] == "ExternalUrl":
            return Url(self.get_data()["external_url"])


class Page(CanvasObject):
    """
    https://canvas.instructure.com/doc/api/pages.html
    """

    def get_canvas_post_arg_name(self) -> str:
        return "wiki_page"

    def get_canvas_url_part(self) -> str:
        return "pages"

    def __init__(self, canvas: "Canvas") -> None:
        super().__init__(canvas)
        self._url = None

    def json_init(self, json_data: dict) -> Course:
        self._data = json_data
        self._id = int(json_data["page_id"])
        self._url = json_data["url"]
        return self

    def get_id(self) -> int | str:
        return self._id or self._url

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

    def get_possible_object_relations_for_get(
        self,
    ) -> tuple[tuple[CanvasObject]]:
        return ((Course,), (Group,))


class Rubric(CanvasObject):
    """
    https://canvas.instructure.com/doc/api/rubrics.html
    """

    def get_canvas_post_arg_name(self) -> str:
        return "rubric"

    def get_canvas_url_part(self) -> str:
        return "rubrics"

    def get_possible_object_relations_for_get(
        self,
    ) -> tuple[tuple[CanvasObject]]:
        return ((Course,), (Account,))

    def get_possible_object_relations_for_create(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        return ((Course,),)

    def get_possible_object_relations_for_edit(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        return ((Course,),)


class Section(CanvasObject):
    """
    https://canvas.instructure.com/doc/api/sections.html
    """

    def get_canvas_post_arg_name(self) -> str:
        return "course_section"

    def get_canvas_url_part(self) -> str:
        return "sections"

    def get_possible_object_relations_for_get(
        self,
    ) -> tuple[tuple[CanvasObject]]:
        return ((Course,), ())

    def get_possible_object_relations_for_list(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        return ((Course,),)

    def get_possible_object_relations_for_edit(
        self,
    ) -> tuple[tuple["CanvasObject"]]:
        return ((),)


class QuizQuestion(CanvasObject):
    """
    https://canvas.instructure.com/doc/api/quiz_questions.html
    """

    def get_canvas_post_arg_name(self) -> str:
        return "question"

    def get_canvas_url_part(self) -> str:
        return "questions"

    def get_possible_object_relations_for_get(
        self,
    ) -> tuple[tuple[CanvasObject]]:
        return ((Course, Quiz),)


class Quiz(CanvasObject):
    """
    https://canvas.instructure.com/doc/api/quizzes.html
    """

    def get_canvas_post_arg_name(self) -> str:
        return "quiz"

    def get_canvas_url_part(self) -> str:
        return "quizzes"

    def resolve(self) -> CanvasObject:
        return self._fast_resolve(
            (Course,),
            lambda c: f"/api/v1/courses/{c.get_id()}"
            f"/quizzes/{self.get_id()}",
        )

    def get_possible_object_relations_for_get(
        self,
    ) -> tuple[tuple[CanvasObject]]:
        return ((Course,),)


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

    def items(self) -> typing.Generator[tuple[str, "Directory"], None, None]:
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

    def _resolve_split(self, path: list[str]) -> "Directory":
        if not len(path):
            return self
        name, *path = path
        if name not in self._dir:
            return None
        return self._dir[name]._resolve_split(path)

    def add(self, path: str, folder: None | Folder = None) -> None:
        """
        Adds a path to the directory.
        """
        return self._add_split(path.split("/"), folder)

    def resolve(self, path: str) -> "Directory":
        """
        Gets a directory at a given path.
        """
        return self._resolve_split(path.split("/"))

    def at(self, name: str) -> "Directory":
        """
        Gets a subfolder directory (like resolve but only one deep).
        """
        if name not in self._dir:
            return None
        return self._dir[name]


class Canvas:
    def __init__(self, conn: CanvasConnection) -> None:
        self._conn = conn

    def get_connection(self) -> CanvasConnection:
        """
        Gets the canvas connection object.
        """
        return self._conn

    def get_assignment_overrides(
        self, course: Course, assignment: Assignment
    ) -> typing.AsyncGenerator[AssignmentOverride, None]:
        """
        Gets a list of assignment overrides from a given
        course and assignment object.
        """
        return (
            AssignmentOverride(self).set_related(course, assignment).get_list()
        )

    def get_assignments(
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
        return Assignment(self).set_related(course, group, user).get_list()

    async def create_assignment(
        self,
        course: Course,
        *,
        assignment_object: Assignment | None = None,
        **kwargs,
    ) -> Assignment:
        if assignment_object is None:
            assignment_object = Assignment(self)
        return await assignment_object.set_related(course).create(**kwargs)

    def get_courses(
        self, *, user: User | None = None
    ) -> typing.AsyncGenerator[Course, None]:
        """
        Gets a list of courses, optionally from a specific user.
        """
        return Course(self).set_related(user).get_list()

    def get_files(
        self,
        *,
        course: Course | None = None,
        user: User | None = None,
        group: Group | None = None,
        folder: Folder | None = None,
    ) -> typing.AsyncGenerator[File, None]:
        """
        Gets a list of files, from a course, user, group of folder.
        """
        return File(self).set_related(course, user, group, folder).get_list()

    def get_folders(
        self,
        *,
        course: Course | None = None,
        user: User | None = None,
        group: Group | None = None,
        folder: Folder | None = None,
    ) -> typing.AsyncGenerator[File, None]:
        return Folder(self).set_related(course, user, group, folder).get_list()

    async def get_directory(
        self,
        *,
        course: Course | None = None,
        user: User | None = None,
        group: Group | None = None,
        folder: Folder | None = None,
    ) -> Directory:
        d = Directory()
        async for f in (
            Folder(self).set_related(course, user, group).get_list()
        ):
            d.add(f.get_data()["full_name"], f)
        return d

    def get_modules(
        self, course: Course
    ) -> typing.AsyncGenerator[ModuleItem, None]:
        """
        Gets a list of modules from a course.
        """
        return Module(self).set_related(course).get_list()

    def get_module_items(
        self, course: Course, module: Module
    ) -> typing.AsyncGenerator[ModuleItem, None]:
        """
        Gets a list of module items from a course and module.
        """
        return ModuleItem(self).set_related(course, module).get_list()

    def get_pages(self, course: Course) -> typing.AsyncGenerator[Page, None]:
        """
        Gets a list of pages from a course.
        """
        return Page(self).set_related(course).get_list()

    async def get_front_page(self, course: Course) -> Page:
        """
        Gets the front page of a course.
        """
        res = await self._conn.request(
            "GET", f"/api/v1/courses/{course.get_id()}/front_page"
        )
        ResponseError.raise_on_error(res)
        return Page(self).json_init(json.load(res)).set_related(course)

    def get_sections(
        self, course: Course
    ) -> typing.AsyncGenerator[Section, None]:
        """
        Gets a list of sections from a course.
        """
        return Section(self).set_related(course).get_list()

    def get_rubrics(
        self, course: Course
    ) -> typing.AsyncGenerator[Rubric, None]:
        """
        Gets a list of rubrics from a course.
        """
        return Rubric(self).set_related(course).get_list()

    def get_quizes(self, course: Course) -> typing.AsyncGenerator[Quiz, None]:
        """
        Gets a list of quizzes from a course.
        """
        return Quiz(self).set_related(course).get_list()

    def get_quiz_questions(
        self, course: Course, quiz: Quiz
    ) -> typing.AsyncGenerator[QuizQuestion, None]:
        """
        Gets a list of quiz question from a course and quiz.
        """
        return QuizQuestion(self).set_related(course, quiz).get_list()
