import { faker } from '@faker-js/faker/locale/en_US';
import { addWeeks, setDay, startOfWeek } from 'date-fns';
import { http, HttpHandler, HttpResponse } from 'msw';
import { Change, ChangeType, ItemTypes } from '../api/change';
import type { Assignment } from '../components/Materials/Assignment';
import type { File, FileFolder, Folder } from '../components/Materials/File';
import type { Module, ModuleItem } from '../components/Materials/Module';
import type { Page } from '../components/Materials/Page';
import type { Quiz } from '../components/Materials/Quiz';
import type { Section } from '../components/Materials/Section';

export const changeHandlers: HttpHandler[] = [
    http.get(`${import.meta.env.VITE_BACKEND_URL}/changes/recent`, () => {
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

    http.post(`${import.meta.env.VITE_BACKEND_URL}/revert`, async ({ request }) => {
        const change = (await request.json()) as Change;

        // Change the content of the latest change to the content of the reverted change
        exampleChanges[exampleChanges.length - 1].content = change.content;

        return HttpResponse.json<Change>(exampleChanges[exampleChanges.length - 1]);
    }),

    http.post(`${import.meta.env.VITE_BACKEND_URL}/cron`, () => {
        // Mock the cron job by delaying a successful response
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(HttpResponse.json('Cron job completed'));
            }, 1000);
        });
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
        created_at: faker.date.future().toString(),
        updated_at: faker.date.future().toString(),
        last_edited_by: {
            display_name: faker.person.fullName(),
        },
        front_page: faker.datatype.boolean(),
    };
};

enum visibility_level {
    NONE = 'none',
    INHERIT = 'inherit',
    COURSE = 'course',
    INSTITUTION = 'institution',
    PUBLIC = 'public',
}

const generateFileObject = (folderId: number): File => {
    return {
        id: faker.number.int(),
        uuid: faker.string.uuid(),
        folder_id: folderId,
        display_name: faker.lorem.words(),
        filename: faker.system.fileName(),
        content_type: faker.system.mimeType(),
        url: faker.internet.url(),
        size: faker.number.int(),
        created_at: faker.date.past().toString(),
        updated_at: faker.date.recent().toString(),
        unlock_at: faker.date.future().toString(),
        locked: faker.datatype.boolean(),
        hidden: faker.datatype.boolean(),
        lock_at: faker.date.future().toString(),
        hidden_for_user: faker.datatype.boolean(),
        visibility_level: faker.helpers.arrayElement(Object.values(visibility_level)),
        thumbnail_url: 'http://loremflickr.com/50/50/abstract',
        modified_at: faker.date.recent().toString(),
        mime_class: faker.lorem.word(),
        media_entry_id: faker.string.uuid(),
        locked_for_user: faker.datatype.boolean(),
        lock_info: faker.lorem.words(),
        lock_explanation: faker.lorem.words(),
        preview_url: faker.internet.url(),
    };
};

const generateFolderObject = (isChild: boolean = false, parentId?: number): Folder => {
    if (isChild && !parentId) throw new Error('Parent ID is required for child folder');

    return {
        context_type: faker.lorem.word(),
        context_id: faker.number.int(),
        files_count: faker.number.int(),
        position: faker.number.int(),
        updated_at: faker.date.recent().toString(),
        folders_url: faker.internet.url(),
        files_url: faker.internet.url(),
        full_name: faker.lorem.words(),
        lock_at: faker.date.future().toString(),
        id: faker.number.int(),
        folders_count: faker.number.int(),
        name: faker.lorem.words(),
        parent_folder_id: isChild ? parentId! : undefined,
        created_at: faker.date.past().toString(),
        unlock_at: faker.date.future().toString(),
        hidden: faker.datatype.boolean(),
        hidden_for_user: faker.datatype.boolean(),
        locked: faker.datatype.boolean(),
        locked_for_user: faker.datatype.boolean(),
        for_submissions: faker.datatype.boolean(),
    };
};

const generateFileFolderObject = (): FileFolder => {
    const folders = Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () => generateFolderObject());
    const files: File[] = [];

    // Ensure each folder has 2 to 6 files
    folders.forEach((folder) => {
        const numberOfFiles = faker.number.int({ min: 2, max: 6 });
        for (let i = 0; i < numberOfFiles; i++) {
            files.push(generateFileObject(folder.id));
        }
    });

    // Make at least one folder a child of another
    const childFolderIndex = faker.number.int({ min: 1, max: folders.length - 1 });
    const parentFolderIndex = faker.number.int({ min: 0, max: childFolderIndex - 1 });
    folders[childFolderIndex].parent_folder_id = folders[parentFolderIndex].id;

    return {
        file: files,
        folder: folders,
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
        case ItemTypes.FILES:
            return generateFileFolderObject();
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
        older_diff: old_value,
        item_id: faker.number.int(),
        course_id: faker.number.int(),
        change_type: faker.helpers.arrayElement(Object.values(ChangeType)),
        item_type,
        timestamp: randomDate.toString(),
        content: generateObject(item_type),
        highlights: null,
    };
};

let old_id = faker.number.int();
export const exampleChanges: Change[] = Array.from({ length: 100 }, () => {
    const change = generateChange(old_id);
    old_id = change.id;
    return change;
});
