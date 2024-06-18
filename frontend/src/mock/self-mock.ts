import { faker } from '@faker-js/faker';
import { http, HttpHandler, HttpResponse } from 'msw';
import { Self, UserRole } from '../api/self';

export const selfHandlers: HttpHandler[] = [
    http.get(`${import.meta.env.VITE_BACKEND_URL}/self/*`, () => {
        return HttpResponse.json<Self>(exampleUsers[Math.floor(Math.random() * exampleUsers.length)]);
    }),
];

function createRandomUser(): Self {
    return {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.firstName(),
        role: faker.helpers.arrayElement(Object.values(UserRole)),
        courseId: 0,
    };
}

export const exampleUsers: Self[] = [
    ...faker.helpers.multiple(createRandomUser, {
        count: 5,
    }),
    {
        id: '1234567890',
        email: faker.internet.email(),
        name: faker.person.firstName(),
        role: UserRole.TEACHER,
        courseId: 0,
    },
];
