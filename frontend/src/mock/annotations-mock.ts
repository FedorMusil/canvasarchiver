import { Annotation } from '../api/annotation';
import type { Change } from '../api/change';
import { exampleChanges } from './change-mock';
import { exampleUsers } from './self-mock';
import { faker } from '@faker-js/faker';
import { http, HttpHandler, HttpResponse } from 'msw';

export const annotationHandlers: HttpHandler[] = [
    http.get(`${import.meta.env.VITE_BACKEND_URL}/annotations/:courseId/:changeId`, ({ params }) => {
        const changeId = params.changeId;
        const annotations = exampleAnnotations.filter((annotation) => annotation.changeId === +changeId);
        return HttpResponse.json<Annotation[]>(annotations);
    }),
];

let annotationId = 1;
const changeAnnotationCounts: { [key: number]: number } = {};
let depth = 0;
let exampleAnnotations: Annotation[] = [];

function getRandomChange() {
    let change: Change;
    do {
        change = faker.helpers.arrayElement(exampleChanges);
    } while (changeAnnotationCounts[change.id] >= 10);
    if (!changeAnnotationCounts[change.id]) {
        changeAnnotationCounts[change.id] = 0;
    }
    changeAnnotationCounts[change.id]++;
    return change;
}

function getRandomParentId() {
    return depth < 3 && faker.datatype.boolean() && exampleAnnotations.length > 0 ?
            faker.helpers.arrayElement(exampleAnnotations).id
        :   null;
}

function createRandomAnnotation(): Annotation {
    const change = getRandomChange();

    const parentId = getRandomParentId();
    if (parentId !== null) depth++;

    const annotation: Annotation = {
        id: annotationId++,
        user: faker.helpers.arrayElement(exampleUsers),
        annotation: faker.lorem.sentence(),
        parentId,
        changeId: change.id,
        selectedText: null,
        selectionStart: null,
        selectionEnd: null,
        timestamp: faker.date.recent(),
    };

    if (parentId !== null) depth--;
    return annotation;
}

exampleAnnotations = Array.from({ length: 1000 }, createRandomAnnotation);
