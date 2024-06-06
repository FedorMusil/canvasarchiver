import { Annotation } from '../api/annotation';
import { exampleUsers } from './account-mock';
import { http, HttpHandler, HttpResponse } from 'msw';

export const annotationHandlers: HttpHandler[] = [
    http.get(`${import.meta.env.VITE_BACKEND_URL}/annotations/*`, () => {
        return HttpResponse.json<Annotation[]>(exampleAnnotations);
    }),
];

function getRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const exampleAnnotations: Annotation[] = [
    {
        id: 0,
        user: exampleUsers[0],
        text: 'Increasing time limit for students',
        timestamp: getRandomDate(new Date(2012, 0, 1), new Date()),
    },
    {
        id: 1,
        user: exampleUsers[1],
        text: 'Adding description to the assignment',
        timestamp: getRandomDate(new Date(2012, 0, 1), new Date()),
    },
    {
        id: 2,
        user: exampleUsers[2],
        text: 'Revealing course information to the students',
        timestamp: getRandomDate(new Date(2012, 0, 1), new Date()),
    },
];
