import { http, HttpHandler, HttpResponse } from 'msw';
import { User, UserRole } from '../api/account';

export const accountHandlers: HttpHandler[] = [
    http.get('/self/*', () => {
        return HttpResponse.json<User>(exampleUsers[Math.floor(Math.random() * exampleUsers.length)]);
    }),
];

export const exampleUsers: User[] = [
    {
        id: 0,
        email: 'emily@uva.nl',
        name: 'Emily',
        role: UserRole.TA,
    },

    {
        id: 1,
        email: 'alexander.b@uva.nl',
        name: 'Alexander',
        role: UserRole.TA,
    },

    {
        id: 2,
        email: 'j.e.johnsen@uva.nl',
        name: 'James',
        role: UserRole.TEACHER,
    },
];