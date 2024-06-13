import { Annotation } from '../api/annotation';
import { exampleUsers } from './self-mock';
import { faker } from '@faker-js/faker';
import { http, HttpHandler, HttpResponse } from 'msw';

export const annotationHandlers: HttpHandler[] = [
    http.get(`${import.meta.env.VITE_BACKEND_URL}/annotations/*`, () => {
        // Return 5 random annotations from the example annotations
        return HttpResponse.json<Annotation[]>(faker.helpers.shuffle(exampleAnnotations).slice(0, 5));
    }),
];

function createRandomAnnotation(): Annotation {
    return {
        id: faker.number.int(),
        user: faker.helpers.arrayElement(exampleUsers),
        text: faker.lorem.sentence(),
        timestamp: faker.date.recent(),
    };
}

const exampleAnnotations: Annotation[] = faker.helpers.multiple(createRandomAnnotation, {
    count: 20,
});
