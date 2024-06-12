import { http, HttpHandler, HttpResponse } from 'msw';
import { Self, UserRole } from '../api/self';

export const selfHandlers: HttpHandler[] = [
    http.get(`${import.meta.env.VITE_BACKEND_URL}/self/*`, () => {
        return HttpResponse.json<Self>(exampleUsers[Math.floor(Math.random() * exampleUsers.length)]);
    }),
];

export const exampleUsers: Self[] = [
    {
        id: 0,
        email: 'emily@uva.nl',
        name: 'Emily',
        role: UserRole.TEACHER,
        courseId: 0,
    },

    {
        id: 1,
        email: 'alexander.b@uva.nl',
        name: 'Alexander',
        role: UserRole.TA,
        courseId: 0,
    },

    {
        id: 2,
        email: 'j.e.johnsen@uva.nl',
        name: 'James',
        role: UserRole.TA,
        courseId: 0,
    },
];
