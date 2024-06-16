import { exampleChanges } from './change-mock';
import { exampleUsers } from './self-mock';
import { faker } from '@faker-js/faker';
import { http, HttpHandler, HttpResponse } from 'msw';
import { Annotation, type PostAnnotation } from '../api/annotation';

export const annotationHandlers: HttpHandler[] = [
    http.get(`${import.meta.env.VITE_BACKEND_URL}/annotations/:courseId/:changeId`, ({ params }) => {
        const changeId = params.changeId;
        const annotations = exampleAnnotations.filter((annotation) => annotation.changeId === +changeId);
        return HttpResponse.json<Annotation[]>(annotations);
    }),

    http.post(`${import.meta.env.VITE_BACKEND_URL}/annotations`, async ({ request }) => {
        const annotation = (await request.json()) as PostAnnotation;

        const id = faker.number.int();
        const newAnnotation: Annotation = {
            ...annotation,
            id,
            user: exampleUsers.find((user) => user.id === annotation.userId)!,
            timestamp: new Date(),
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
            timestamp: faker.date.recent(),
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
            timestamp: faker.date.recent(),
            selectionId: null,
        };

        annotationsForChange.push(annotation);
    }

    exampleAnnotations.push(...annotationsForChange);
});
