# Project Computational Science: Canvas Archiver

Our project is an innovative extension of the Canvas course management system, designed to enhance online learning and teaching. Primarily intended for course teachers, this tool leverages the Canvas API to construct a detailed timeline of different versions of the courses linked to the application.

## What the Project Does

Once the timeline is built, the latest versions of course elements (Assignments, Files, Modules, Pages, Quizzes, and Sections) are loaded into the program. Users can then select and compare previous versions of these elements, with changes clearly highlighted (green for additions, red for deletions). The latest changes are visible on the product homepage. Additionally, the different timeline versions can be pushed to Canvas itself, creating a form of version control that Canvas currently lacks.

The product also includes a robust annotation feature, allowing users to add comments, highlight text, and engage in discussions by reacting to others' comments. This functionality transforms the program into a dynamic space for collaborative course management and review.

## Why the Project is Useful

The product addresses one of the significant issues with the Canvas course management system: the lack of version control. Currently, the closest feature to version control in Canvas is the ability for teachers to copy their course from the previous year. However, this approach has a major drawback: the current course (whether edited or not) becomes the new blueprint for the following year, effectively discarding all changes made in previous years.
Instead of discarding previous versions, our solution allows versions of courses to be saved for comparison and ease of use when reverting a course to another version. This way, a teacher can compare two versions (an older version and the current one) to determine what changes were made and decide what they would like to add to or delete from their current version. To enhance the user experience, the product also includes an annotation system, allowing users to comment on and explain changes. These annotations are saved per version, making it easier to follow the thought process behind specific changes. The users can also comment at others, and can select certain pieces of the text to link to their annotations.

## Installation and usage

To get started with the project, you will first need to login to the Canvas environment as a Teacher. Once logged in, you can select the Canvas Archiver and install it as an add-on. After successfully installing, the user will need to build the frontend. If the frontend is not built, it will not have access to the necessary dependencies and results in a faulty application.


## Requirements

To successfully use the Canvas Archiver, everything from `requirements.txt` and `package.json` is necessary. A bundle of node modules is expected as well. By meeting these requirements, you'll be well-prepared to get started.




## Authors and acknowledgment

Alicio Santos Neves: frontend
Ayoub Oqla: frontend
Bas Zoeteman: backend and CRONjob
Dain Kooijman: backend, frontend
Daniël Verberne: frontend
Fedor Musil: backend, server, gitmaster
Lynn Xiao: frontend
Mohamed El Majouti: frontend
Rob Bieman: backend, Canvas API
Sam Baldinger: frontend
Tijn van den Kommer: frontend, backend, database, scrummaster
Tom Groot (deprecated): `sudo rm -rf /`


## Project status
As of the 25th of June, we are finalizing our project.
