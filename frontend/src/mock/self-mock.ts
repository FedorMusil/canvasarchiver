import { faker } from '@faker-js/faker/locale/en_US';
import { http, HttpHandler, HttpResponse } from 'msw';
import { Self, UserRole } from '../api/self';

export const selfHandlers: HttpHandler[] = [
    http.get(`${import.meta.env.VITE_BACKEND_URL}/self`, () => {
        return HttpResponse.json<Self>(exampleUsers.find((user) => user.id === '1234567890'));
    }),
];

function createRandomUser(): Self {
    return {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        role: faker.helpers.arrayElement(Object.values(UserRole)),
    };
}

export const exampleUsers: Self[] = [
    ...faker.helpers.multiple(createRandomUser, {
        count: 5,
    }),
    {
        id: '1234567890',
        name: faker.person.fullName(),
        role: UserRole.TEACHER,
    },
];
