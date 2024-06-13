import { addWeeks, setDay, startOfWeek } from 'date-fns';
import { Change, ChangeType, ItemTypes } from '../api/change';
import { faker } from '@faker-js/faker';
import { http, HttpHandler, HttpResponse } from 'msw';

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
];

const generateChange = (old_value: number): Change => {
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start of this week, Monday
    const randomWeeks = faker.number.int({ min: 0, max: 7 }); // Random number of weeks within 8 week period
    const randomDate = setDay(addWeeks(startDate, randomWeeks), 1); // Set the day to Monday

    return {
        id: faker.number.int(),
        change_type: faker.helpers.arrayElement(Object.values(ChangeType)),
        change_date: randomDate,
        item_type: faker.helpers.arrayElement(Object.values(ItemTypes)),
        old_value: old_value,
        new_value: { [faker.lorem.word()]: faker.lorem.sentence() },
    };
};

let old_value = faker.number.int();
export const exampleChanges: Change[] = Array.from({ length: 100 }, () => {
    const change = generateChange(old_value);
    old_value = change.id;
    return change;
});
