import { addWeeks, setDay, startOfWeek } from 'date-fns';
import { Change, ChangeType, ItemTypes } from '../api/change';
import { faker } from '@faker-js/faker';
import { http, HttpHandler, HttpResponse } from 'msw';

export const changeHandlers: HttpHandler[] = [
    http.get(`${import.meta.env.VITE_BACKEND_URL}/changes/recent/*`, () => {
        // Return the last (most recent) 5 changes
        const recentChanges = exampleChanges
            .sort((a, b) => b.change_date.getTime() - a.change_date.getTime())
            .slice(0, 5);

        return HttpResponse.json<Change[]>(recentChanges);
    }),

    http.get(`${import.meta.env.VITE_BACKEND_URL}/changes/*`, () => {
        return HttpResponse.json<Change[]>(exampleChanges);
    }),
];

const generateChange = (): Change => {
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start of this week, Monday
    const randomWeeks = faker.number.int({ min: 0, max: 7 }); // Random number of weeks within 8 week period
    const randomDate = setDay(addWeeks(startDate, randomWeeks), 1); // Set the day to Monday

    return {
        id: faker.number.int(),
        change_type: faker.helpers.arrayElement(Object.values(ChangeType)),
        change_date: randomDate,
        item_type: faker.helpers.arrayElement(Object.values(ItemTypes)),
        old_value: { [faker.lorem.word()]: faker.lorem.sentence() },
        new_value: { [faker.lorem.word()]: faker.lorem.sentence() },
    };
};

const exampleChanges: Change[] = faker.helpers.multiple(generateChange, {
    count: 20,
});
