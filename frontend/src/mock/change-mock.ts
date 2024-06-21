import { faker } from '@faker-js/faker';
import { addWeeks, setDay, startOfWeek } from 'date-fns';
import { http, HttpHandler, HttpResponse } from 'msw';
import { Change, ChangeType, ItemTypes } from '../api/change';

export const changeHandlers: HttpHandler[] = [
    http.get(`${import.meta.env.VITE_BACKEND_URL}/changes/recent`, () => {
        // Get the last change based on the last change date
        const lastChange = exampleChanges.reduce((prev, current) =>
            new Date(prev.timestamp) > new Date(current.timestamp) ? prev : current
        );

        // Get the last change date
        const lastChangeDate = new Date(lastChange.timestamp);
        // Get the start of the week for the last change date
        const startOfLastChangeWeek = startOfWeek(lastChangeDate, { weekStartsOn: 1 });

        // Get all changes from the last week
        const thisWeekChanges = exampleChanges.filter((change) => {
            const changeDate = new Date(change.timestamp);
            return changeDate >= startOfLastChangeWeek;
        });

        return HttpResponse.json<Change[]>(thisWeekChanges);
    }),

    http.get(`${import.meta.env.VITE_BACKEND_URL}/course/changes/:materialId`, ({ params }) => {
        // Get all changes for the material (item_type)
        const materialId = params.materialId;
        const materialChanges = exampleChanges.filter(
            (change) => change.item_type === Object.values(ItemTypes)[+materialId!]
        );

        return HttpResponse.json<Change[]>(materialChanges);
    }),

    http.put(`${import.meta.env.VITE_BACKEND_URL}/changes`, async ({ request }) => {
        const change = (await request.json()) as Change;
        const index = exampleChanges.findIndex((c) => c.id === change.id);
        exampleChanges[index].diff = change.diff;

        return HttpResponse.json<Change>(exampleChanges[index]);
    }),
];

const generateChange = (old_value: number): Change => {
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start of this week, Monday
    const randomWeeks = faker.number.int({ min: 0, max: 7 }); // Random number of weeks within 8 week period
    const randomDate = setDay(addWeeks(startDate, randomWeeks), 1); // Set the day to Monday

    return {
        id: old_value + 1,
        old_id: old_value,
        change_type: faker.helpers.arrayElement(Object.values(ChangeType)),
        item_type: ItemTypes.ASSIGNMENTS,
        timestamp: randomDate.toString(),
        diff: `<div class='bg-card text-card-foreground w-full h-full flex justify-center items-center'><p class='text-2xl font-bold'>This is a placeholder for the change view.</p></div>`,
    };
};

const generateQuizChange = (old_value: number): Change => {
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start of this week, Monday
    const randomWeeks = faker.number.int({ min: 0, max: 7 }); // Random number of weeks within 8 week period
    const randomDate = setDay(addWeeks(startDate, randomWeeks), 1); // Set the day to Monday

    const quizzes = [
        {
            id: 1,
            title: 'Project preferences',
            question_count: 4,
            points_possible: 1,
            due_at: '2024-06-18T12:30:00Z',
            unlock_at: '2024-06-18T11:30:00Z',
        },
        {
            id: 2,
            title: 'Lesson1',
            question_count: 20,
            points_possible: 10,
            due_at: '2024-06-30T12:30:00Z',
            unlock_at: '2024-06-18T12:30:00Z',
        },
        {
            id: 3,
            title: 'Lesson2',
            question_count: 20,
            points_possible: 10,
            due_at: '2024-06-30T12:30:00Z',
            unlock_at: '2024-06-30T10:30:00Z',
        },
    ];

    return {
        id: old_value + 1,
        old_id: old_value,
        change_type: faker.helpers.arrayElement(Object.values(ChangeType)),
        item_type: ItemTypes.QUIZZES,
        timestamp: randomDate.toString(),
        // diff is of type Quiz
        diff: JSON.stringify(quizzes),
    };
};

const generateQuizzes = (old_value: number): Change => {
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start of this week, Monday
    const randomWeeks = faker.number.int({ min: 0, max: 7 }); // Random number of weeks within 8 week period
    const randomDate = setDay(addWeeks(startDate, randomWeeks), 1); // Set the day to Monday

    const quizzes = [
        {
            id: 1,
            title: 'Lesson',
            question_count: 4,
            points_possible: 1,
            due_at: '2024-06-18T12:30:00Z',
            unlock_at: '2024-06-18T11:30:00Z',
        },
        {
            id: 2,
            title: 'Lesson1',
            question_count: 10,
            points_possible: 10,
            due_at: '2024-06-30T12:30:00Z',
            unlock_at: '2024-06-18T12:30:00Z',
        },
        {
            id: 3,
            title: 'Lesson2',
            question_count: 20,
            points_possible: 10,
            due_at: '2024-06-30T12:30:00Z',
            unlock_at: '2024-06-30T10:30:00Z',
        },
    ];

    return {
        id: old_value + 1,
        old_id: old_value,
        change_type: faker.helpers.arrayElement(Object.values(ChangeType)),
        item_type: ItemTypes.QUIZZES,
        timestamp: randomDate.toString(),
        // diff is of type Quiz
        diff: JSON.stringify(quizzes),
    };
};

let old_id = 1;
export const exampleChanges: Change[] = Array.from({ length: 50 }, () => {
    const change = generateChange(old_id);
    old_id = change.id;
    return change;
});

exampleChanges.push(generateQuizChange(50));
exampleChanges.push(generateQuizChange(51));
exampleChanges.push(generateQuizzes(52));
