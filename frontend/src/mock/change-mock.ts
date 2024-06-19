import { faker } from '@faker-js/faker';
import { addWeeks, setDay, startOfWeek } from 'date-fns';
import { http, HttpHandler, HttpResponse } from 'msw';
import { Change, ChangeType, ItemTypes, type ChangeChangeContents } from '../api/change';

export const changeHandlers: HttpHandler[] = [
    http.get(`${import.meta.env.VITE_BACKEND_URL}/changes/recent/*`, () => {
        // Get the last change based on the last change date
        const lastChange = exampleChanges.reduce((prev, current) =>
            new Date(prev.change_date) > new Date(current.change_date) ? prev : current
        );

        // Get the last change date
        const lastChangeDate = new Date(lastChange.change_date);
        // Get the start of the week for the last change date
        const startOfLastChangeWeek = startOfWeek(lastChangeDate, { weekStartsOn: 1 });

        // Get all changes from the last week
        const thisWeekChanges = exampleChanges.filter((change) => {
            const changeDate = new Date(change.change_date);
            return changeDate >= startOfLastChangeWeek;
        });

        return HttpResponse.json<Change[]>(thisWeekChanges);
    }),

    http.get(`${import.meta.env.VITE_BACKEND_URL}/changes/material/:materialId`, ({ params }) => {
        // Get all changes for the material (item_type)
        const materialId = params.materialId;
        const materialChanges = exampleChanges.filter(
            (change) => change.item_type === Object.values(ItemTypes)[+materialId!]
        );

        return HttpResponse.json<Change[]>(materialChanges);
    }),

    http.put(`${import.meta.env.VITE_BACKEND_URL}/changes`, async ({ request }) => {
        const change = (await request.json()) as ChangeChangeContents;
        const index = exampleChanges.findIndex((c) => c.id === change.id);
        exampleChanges[index].old_contents = change.oldContent;
        exampleChanges[index].new_contents = change.newContent;

        return HttpResponse.json<Change>(exampleChanges[index]);
    }),
];

const generateChange = (old_value: number): Change => {
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start of this week, Monday
    const randomWeeks = faker.number.int({ min: 0, max: 7 }); // Random number of weeks within 8 week period
    const randomDate = setDay(addWeeks(startDate, randomWeeks), 1); // Set the day to Monday

    const old_json = [
    {
        "id": 242604,
        "course_id": 5285,
        "name": "aaaaa",
        "start_at": null,
        "end_at": null,
        "created_at": "2024-06-17T11:31:25Z",
        "restrict_enrollments_to_section_dates": null,
        "nonxlist_course_id": null,
        "sis_section_id": null,
        "sis_course_id": "1800.1040",
        "integration_id": null
    },
    {
        "id": 242605,
        "course_id": 5285,
        "name": "aaaaa",
        "start_at": null,
        "end_at": null,
        "created_at": "2024-06-18T12:19:32Z",
        "restrict_enrollments_to_section_dates": null,
        "nonxlist_course_id": null,
        "sis_section_id": null,
        "sis_course_id": "1800.1040",
        "integration_id": null
    },
    {
        "id": 242608,
        "course_id": 5285,
        "name": "aaaaa",
        "start_at": null,
        "end_at": null,
        "created_at": "2024-06-18T12:20:20Z",
        "restrict_enrollments_to_section_dates": null,
        "nonxlist_course_id": null,
        "sis_section_id": null,
        "sis_course_id": "1800.1040",
        "integration_id": null
    },
    {
        "id": 242609,
        "course_id": 5285,
        "name": "aaaaa",
        "start_at": null,
        "end_at": null,
        "created_at": "2024-06-18T12:20:20Z",
        "restrict_enrollments_to_section_dates": null,
        "nonxlist_course_id": null,
        "sis_section_id": null,
        "sis_course_id": "1800.1040",
        "integration_id": null
    },
    {
        "id": 9012,
        "course_id": 5285,
        "name": "Atoomfysica 1",
        "start_at": null,
        "end_at": null,
        "created_at": "2019-03-19T18:57:10Z",
        "restrict_enrollments_to_section_dates": null,
        "nonxlist_course_id": null,
        "sis_section_id": "1800.1040",
        "sis_course_id": "1800.1040",
        "integration_id": null
    },
    {
        "id": 242606,
        "course_id": 5285,
        "name": "Atoomfysica 1",
        "start_at": null,
        "end_at": null,
        "created_at": "2024-06-18T12:19:32Z",
        "restrict_enrollments_to_section_dates": null,
        "nonxlist_course_id": null,
        "sis_section_id": null,
        "sis_course_id": "1800.1040",
        "integration_id": null
    },
    {
        "id": 242610,
        "course_id": 5285,
        "name": "Atoomfysica 1",
        "start_at": null,
        "end_at": null,
        "created_at": "2024-06-18T12:20:20Z",
        "restrict_enrollments_to_section_dates": null,
        "nonxlist_course_id": null,
        "sis_section_id": null,
        "sis_course_id": "1800.1040",
        "integration_id": null
    },
    {
        "id": 242611,
        "course_id": 5285,
        "name": "Atoomfysica 1",
        "start_at": null,
        "end_at": null,
        "created_at": "2024-06-18T12:20:20Z",
        "restrict_enrollments_to_section_dates": null,
        "nonxlist_course_id": null,
        "sis_section_id": null,
        "sis_course_id": "1800.1040",
        "integration_id": null
    },
    {
        "id": 242603,
        "course_id": 5285,
        "name": "Atoomfysica 1 2024-06-17",
        "start_at": null,
        "end_at": null,
        "created_at": "2024-06-17T11:29:01Z",
        "restrict_enrollments_to_section_dates": null,
        "nonxlist_course_id": null,
        "sis_section_id": null,
        "sis_course_id": "1800.1040",
        "integration_id": null
    },
    {
        "id": 242607,
        "course_id": 5285,
        "name": "Atoomfysica 1 2024-06-17",
        "start_at": null,
        "end_at": null,
        "created_at": "2024-06-18T12:19:32Z",
        "restrict_enrollments_to_section_dates": null,
        "nonxlist_course_id": null,
        "sis_section_id": null,
        "sis_course_id": "1800.1040",
        "integration_id": null
    }
]

    return {
        id: faker.number.int(),
        old_id: old_value,

        change_type: faker.helpers.arrayElement(Object.values(ChangeType)),
        item_type: faker.helpers.arrayElement(Object.values(ItemTypes)),

        change_date: randomDate.toString(),

        // old_contents: `<div class='bg-card text-card-foreground w-full h-full flex justify-center items-center'><p class='text-2xl font-bold'>This is a placeholder for the before view.</p></div>`,
        old_contents: JSON.stringify(old_json),
        new_contents: `<div class='bg-card text-card-foreground w-full h-full flex justify-center items-center'><p class='text-2xl font-bold'>This is a placeholder for the after view.</p></div>`,
    };
};

let old_id = faker.number.int();
export const exampleChanges: Change[] = Array.from({ length: 50 }, () => {
    const change = generateChange(old_id);
    old_id = change.id;
    return change;
});
