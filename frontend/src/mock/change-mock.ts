import { faker } from '@faker-js/faker/locale/en_US';
import { addWeeks, setDay, startOfWeek } from 'date-fns';
import { http, HttpHandler, HttpResponse } from 'msw';
import { Change, ChangeType, ItemTypes } from '../api/change';
import type { Assignment } from '../components/Materials/Assignment';
import type { Module, ModuleItem } from '../components/Materials/Module';
import type { Page } from '../components/Materials/Page';
import type { Quiz } from '../components/Materials/Quiz';
import type { Section } from '../components/Materials/Section';

export const changeHandlers: HttpHandler[] = [
    http.get(`${import.meta.env.VITE_BACKEND_URL}/change/recent`, () => {
        // Get the last change based on the last change date
        const lastChange = exampleChanges.reduce((prev, current) =>
            new Date(prev.timestamp) > new Date(current.timestamp) ? prev : current
        );

        // Get the last change date
        const lastChangeDate = new Date(lastChange.timestamp);
        // Get the start of the week for the last change date
        const startOfLastChangeWeek = startOfWeek(lastChangeDate, { weekStartsOn: 1 });

        // Get all changes from the last week
        const thisWeekChanges = exampleChanges.filter((change) => {
            const changeDate = new Date(change.timestamp);
            return changeDate >= startOfLastChangeWeek;
        });

        return HttpResponse.json<Change[]>(thisWeekChanges);
    }),

    http.get(`${import.meta.env.VITE_BACKEND_URL}/change/:materialId`, ({ params }) => {
        // Get all changes for the material (item_type)
        const materialId = params.materialId;
        const materialChanges = exampleChanges.filter(
            (change) => change.item_type === Object.values(ItemTypes)[+materialId!]
        );

        return HttpResponse.json<Change[]>(materialChanges);
    }),

    http.put(`${import.meta.env.VITE_BACKEND_URL}/change/:changeId/highlight`, async ({ params, request }) => {
        const changeId = parseInt(params.changeId as string);
        const highlights = (await request.json()) as { highlights: string };
        const index = exampleChanges.findIndex((c) => c.id === changeId);

        exampleChanges[index].highlights = highlights.highlights;

        return HttpResponse.json<Change>(exampleChanges[index]);
    }),
];

const generateQuizObject = (): Quiz => {
    return {
        id: faker.number.int(),
        title: faker.lorem.sentence(),
        question_count: faker.number.int({ min: 1, max: 10 }),
        points_possible: faker.number.int({ min: 1, max: 100 }),
        due_at: faker.date.future().toString(),
        unlock_at: faker.date.future().toString(),
    };
};

const generateAssignmentObject = (): Assignment => {
    return {
        id: faker.number.int(),
        name: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        created_at: faker.date.past().toString(),
        updated_at: faker.date.recent().toString(),
        due_at: faker.date.future().toString(),
        lock_at: faker.date.future().toString(),
        unlock_at: faker.date.future().toString(),
        points_possible: faker.number.int({ min: 1, max: 100 }),
        submission_types: ['online_upload', 'online_text_entry'],
        published: faker.datatype.boolean(),
    };
};

const generateSectionObject = (): Section => {
    return {
        id: faker.number.int(),
        course_id: faker.number.int(),
        name: faker.lorem.words(),
        start_at: faker.date.past().toString(),
        end_at: faker.date.future().toString(),
        created_at: faker.date.recent().toString(),
        restrict_enrollments_to_section_dates: faker.datatype.boolean(),
        nonxlist_course_id: faker.number.int(),
        sis_section_id: faker.lorem.word(),
        sis_course_id: faker.lorem.word(),
        integration_id: faker.lorem.word(),
    };
};

enum ModuleItemType {
    FILE = 'File',
    PAGE = 'Page',
    DISCUSSION = 'Discussion',
    ASSIGNMENT = 'Assignment',
    QUIZ = 'Quiz',
    SUBHEADER = 'SubHeader',
    EXTERNAL_URL = 'ExternalUrl',
    EXTERNAL_TOOL = 'ExternalTool',
}

const generateModuleItemObject = (): ModuleItem => {
    return {
        id: faker.number.int(),
        module_id: faker.number.int(),
        position: faker.number.int(),
        title: faker.lorem.words(),
        indent: faker.number.int(),
        type: faker.helpers.arrayElement(Object.values(ModuleItemType)),
        content_id: faker.number.int(),
        html_url: faker.internet.url(),
        url: faker.internet.url(),
        page_url: faker.internet.url(),
        external_url: faker.internet.url(),
        new_tab: faker.datatype.boolean(),
        completion_requirement: {
            type: faker.lorem.word(),
            min_score: faker.number.int(),
            completed: faker.datatype.boolean(),
        },
        content_details: {
            points_possible: faker.number.int(),
            due_at: faker.date.future().toString(),
            unlock_at: faker.date.future().toString(),
            lock_at: faker.date.future().toString(),
        },
        published: faker.datatype.boolean(),
    };
};

const generateModuleObject = (): Module => {
    return {
        id: faker.number.int(),
        workflow_state: faker.helpers.arrayElement(['active', 'deleted']),
        position: faker.number.int(),
        name: faker.lorem.words(),
        unlock_at: faker.date.future().toString(),
        require_sequential_progress: faker.datatype.boolean(),
        prerequisite_module_ids: Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => faker.number.int()),
        items_count: faker.number.int(),
        items_url: faker.internet.url(),
        items: Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () => generateModuleItemObject()),
        state: faker.helpers.arrayElement(['locked', 'unlocked', 'started', 'completed']),
        completed_at: faker.date.recent().toString(),
        publish_final_grade: faker.datatype.boolean(),
        published: faker.datatype.boolean(),
    };
};

const generatePageObject = (): Page => {
    return {
        title: faker.lorem.words(),
        creationDate: faker.date.future().toString(),
        lastEditDate: faker.date.future().toString(),
        lastEditedBy: faker.person.fullName(),
        isFrontPage: faker.datatype.boolean(),
    };
};

const generateObject = (item_type: ItemTypes) => {
    switch (item_type) {
        case ItemTypes.QUIZZES:
            return Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () => generateQuizObject());
        case ItemTypes.ASSIGNMENTS:
            return Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () => generateAssignmentObject());
        case ItemTypes.SECTIONS:
            return Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () => generateSectionObject());
        case ItemTypes.MODULES:
            return Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () => generateModuleObject());
        case ItemTypes.PAGES:
            return Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () => generatePageObject());
        default:
            return [];
    }
};

const generateChange = (old_value: number): Change => {
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start of this week, Monday
    const randomWeeks = faker.number.int({ min: 0, max: 7 }); // Random number of weeks within 8 week period
    const randomDate = setDay(addWeeks(startDate, randomWeeks), 1); // Set the day to Monday

    const item_type = faker.helpers.arrayElement(Object.values(ItemTypes));
    return {
        id: faker.number.int(),
        old_id: old_value,
        change_type: faker.helpers.arrayElement(Object.values(ChangeType)),
        item_type,
        timestamp: randomDate.toString(),
        data_object: generateObject(item_type),
    };
};

let old_id = faker.number.int();
export const exampleChanges: Change[] = Array.from({ length: 50 }, () => {
    const change = generateChange(old_id);
    old_id = change.id;
    return change;
});
