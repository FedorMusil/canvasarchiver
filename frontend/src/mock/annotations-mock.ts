import { exampleChanges } from './change-mock';
import { exampleUsers } from './self-mock';
import { faker } from '@faker-js/faker';
import { http, HttpHandler, HttpResponse } from 'msw';
import { Annotation, type PostAnnotation } from '../api/annotation';

export const annotationHandlers: HttpHandler[] = [
    http.get(`${import.meta.env.VITE_BACKEND_URL}/course/annotations/:changeId`, ({ params }) => {
        const changeId = params.changeId;
        const annotations = exampleAnnotations.filter((annotation) => annotation.changeId === +changeId);
        return HttpResponse.json<Annotation[]>(annotations);
    }),

    http.post(`${import.meta.env.VITE_BACKEND_URL}/course/create/annotation`, async ({ request }) => {
        const annotation = (await request.json()) as PostAnnotation;

        // In the real implementation, we would get the user from the JWT token.
        // Since this is a mock, we just pick a predefined user.
        const user = exampleUsers.filter((exampleUser) => exampleUser.id === '1234567890')[0];

        const id = faker.number.int();
        // In the real implementation, we would get the user from the JWT token
        const user = exampleUsers[Math.floor(Math.random() * exampleUsers.length)];
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
        const user = faker.helpers.arrayElement(exampleUsers);
        const annotation: Annotation = {
            id,
            annotation: faker.lorem.sentence(),
            parentId: null,
            changeId: change.id,
            timestamp: faker.date.recent().toDateString(),
            selectionId: null,
            user_id: user.id,
            user_name: user.name,
            user_role: user.role,
        };

        parentId = id;
        annotationsForChange.push(annotation);
    }

    for (let j = 0; j < numSubTreeAnnotations; j++) {
        const user = faker.helpers.arrayElement(exampleUsers);
        const annotation: Annotation = {
            id: faker.number.int(),
            annotation: faker.lorem.sentence(),
            parentId,
            changeId: change.id,
            timestamp: faker.date.recent().toDateString(),
            selectionId: null,
            user_id: user.id,
            user_name: user.name,
            user_role: user.role,
        };

        annotationsForChange.push(annotation);
    }

    exampleAnnotations.push(...annotationsForChange);
});
