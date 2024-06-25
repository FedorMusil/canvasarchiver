import { faker } from '@faker-js/faker/locale/en_US';
import { http, HttpHandler, HttpResponse } from 'msw';
import { Annotation, type PostAnnotation } from '../api/annotation';
import { exampleChanges } from './change-mock';
import { exampleUsers } from './self-mock';

export const annotationHandlers: HttpHandler[] = [
    http.get(`${import.meta.env.VITE_BACKEND_URL}/course/annotations/:changeId`, ({ params }) => {
        const changeId = params.changeId;
        const annotations = exampleAnnotations.filter((annotation) => annotation.changeId === +changeId);
        return HttpResponse.json<Annotation[]>(annotations);
    }),

    http.post(`${import.meta.env.VITE_BACKEND_URL}/annotations`, async ({ request }) => {
        const annotation = (await request.json()) as PostAnnotation;

        // In the real implementation, we would get the user from the JWT token.
        // Since this is a mock, we just pick a predefined user.
        const user = exampleUsers.filter((exampleUser) => exampleUser.id === '1234567890')[0];

        const id = faker.number.int();
        const newAnnotation: Annotation = {
            ...annotation,
            id,
            user: exampleUsers.find((exampleUser) => exampleUser.id === user.id)!,
            timestamp: new Date().toDateString(),
        };

        exampleAnnotations.push(newAnnotation);
        return HttpResponse.json<Annotation>(newAnnotation);
    }),

    http.delete(`${import.meta.env.VITE_BACKEND_URL}/annotations/:annotationId`, ({ params }) => {
        const annotationId = params.annotationId;

        // Delete both the annotation and its children
        const annotationsToBeDeleted = exampleAnnotations.filter(
            (annotation) => annotation.id !== +annotationId && annotation.parentId !== +annotationId
        );

        exampleAnnotations.splice(0, exampleAnnotations.length, ...annotationsToBeDeleted);
        return new HttpResponse();
    }),
];

const exampleAnnotations: Annotation[] = [];
exampleChanges.map((change) => {
    const annotationsForChange: Annotation[] = [];
    let parentId: number | null = null;

    const numAnnotations = faker.number.int({ min: 1, max: 10 });
    const numSubTreeAnnotations = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < numAnnotations; i++) {
        const id = faker.number.int();
        const annotation: Annotation = {
            id,
            user: faker.helpers.arrayElement(exampleUsers),
            annotation: faker.lorem.sentence(),
            parentId: null,
            changeId: change.id,
            timestamp: faker.date.recent().toDateString(),
            selectionId: null,
        };

        parentId = id;
        annotationsForChange.push(annotation);
    }

    for (let j = 0; j < numSubTreeAnnotations; j++) {
        const annotation: Annotation = {
            id: faker.number.int(),
            user: faker.helpers.arrayElement(exampleUsers),
            annotation: faker.lorem.sentence(),
            parentId,
            changeId: change.id,
            timestamp: faker.date.recent().toDateString(),
            selectionId: null,
        };

        annotationsForChange.push(annotation);
    }

    exampleAnnotations.push(...annotationsForChange);
});
