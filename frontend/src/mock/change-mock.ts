import { addWeeks, setDay, startOfWeek } from 'date-fns';
import { Change, ChangeType, ItemTypes } from '../api/change';
import { faker } from '@faker-js/faker';
import { http, HttpHandler, HttpResponse } from 'msw';

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

    http.get(`${import.meta.env.VITE_BACKEND_URL}/change/:materialId`, ({ params }) => {
        // Get all changes for the material (item_type)
        const materialId = params.materialId;
        const materialChanges = exampleChanges.filter(
            (change) => change.item_type === Object.values(ItemTypes)[+materialId!]
        );

        return HttpResponse.json<Change[]>(materialChanges);
    }),

    http.put(`${import.meta.env.VITE_BACKEND_URL}/changes/:id`, async ({ params, request }) => {
        const id = parseInt(params.id as string);
        const htmlString = (await request.json()) as { htmlString: string };
        const index = exampleChanges.findIndex((c) => c.id === id);
        exampleChanges[index].html_string = htmlString.htmlString;

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
        timestamp: randomDate.toString(),
        data_object: faker.lorem.sentence(),
        html_string: null,
    };
};

let old_id = faker.number.int();
export const exampleChanges: Change[] = Array.from({ length: 50 }, () => {
    const change = generateChange(old_id);
    old_id = change.id;
    return change;
});
