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

    return {
        id: faker.number.int(),
        old_id: old_value,

        change_type: faker.helpers.arrayElement(Object.values(ChangeType)),
        item_type: faker.helpers.arrayElement(Object.values(ItemTypes)),

        change_date: randomDate.toString(),

        old_contents: `<div class='bg-card text-card-foreground w-full h-full flex justify-center items-center'><p class='text-2xl font-bold'>This is a placeholder for the before view.</p></div>`,
        new_contents: `<div class='bg-card text-card-foreground w-full h-full flex justify-center items-center'><p class='text-2xl font-bold'>This is a placeholder for the after view.</p></div>`,
    };
};

let old_id = faker.number.int();
export const exampleChanges: Change[] = Array.from({ length: 50 }, () => {
    const change = generateChange(old_id);
    old_id = change.id;
    return change;
});
