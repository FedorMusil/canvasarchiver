import { http, HttpHandler, HttpResponse } from 'msw';
import { ModuleItem, ModuleItemType } from '../api/moduleItem';

export const exampleModulesItems: ModuleItem[] = [
    {
        id: 768,
        module_id: 123,
        position: 1,
        title: "Square Roots: Irrational numbers or boxy vegetables?",
        indent: 0,
        type: ModuleItemType.ASSIGNMENT,
        content_id: 1337,
        html_url: "https://canvas.example.edu/courses/222/modules/items/768",
        url: "https://canvas.example.edu/api/v1/courses/222/assignments/987",
        page_url: "my-page-title",
        external_url: "https://www.example.com/externalurl",
        new_tab: false,
        completion_requirement: { type: "min_score", min_score: 10, completed: true },
        content_details: { points_possible: 20, due_at: "2012-12-31T06:00:00-06:00", unlock_at: "2012-12-31T06:00:00-06:00", lock_at: "2012-12-31T06:00:00-06:00" },
        published: true
    },
    {
        id: 769,
        module_id: 124,
        position: 2,
        title: "Introduction to Algebra",
        indent: 0,
        type: ModuleItemType.ASSIGNMENT,
        content_id: 1338,
        html_url: "https://canvas.example.edu/courses/222/modules/items/769",
        url: "https://canvas.example.edu/api/v1/courses/222/assignments/988",
        page_url: "intro-algebra",
        external_url: "https://www.example.com/intro-algebra",
        new_tab: false,
        completion_requirement: { type: "min_score", min_score: 10, completed: true },
        content_details: { points_possible: 20, due_at: "2012-12-31T06:00:00-06:00", unlock_at: "2012-12-31T06:00:00-06:00", lock_at: "2012-12-31T06:00:00-06:00" },
        published: true
    },
    {
        id: 770,
        module_id: 125,
        position: 3,
        title: "Advanced Calculus",
        indent: 1,
        type: ModuleItemType.QUIZ,
        content_id: 1339,
        html_url: "https://canvas.example.edu/courses/222/modules/items/770",
        url: "https://canvas.example.edu/api/v1/courses/222/quizzes/989",
        page_url: "advanced-calculus",
        external_url: "https://www.example.com/advanced-calculus",
        new_tab: true,
        completion_requirement: { type: "min_score", min_score: 15, completed: false },
        content_details: { points_possible: 30, due_at: "2012-12-31T06:00:00-06:00", unlock_at: "2012-12-31T06:00:00-06:00", lock_at: "2012-12-31T06:00:00-06:00" },
        published: false
    },
    {
        id: 771,
        module_id: 126,
        position: 4,
        title: "Physics: Mechanics",
        indent: 1,
        type: ModuleItemType.DISCUSSION,
        content_id: 1340,
        html_url: "https://canvas.example.edu/courses/222/modules/items/771",
        url: "https://canvas.example.edu/api/v1/courses/222/discussions/990",
        page_url: "physics-mechanics",
        external_url: "https://www.example.com/physics-mechanics",
        new_tab: false,
        completion_requirement: { type: "min_score", min_score: 5, completed: true },
        content_details: { points_possible: 25, due_at: "2012-12-31T06:00:00-06:00", unlock_at: "2012-12-31T06:00:00-06:00", lock_at: "2012-12-31T06:00:00-06:00" },
        published: true
    },
    {
        id: 772,
        module_id: 127,
        position: 5,
        title: "Chemistry: Organic Reactions",
        indent: 0,
        type: ModuleItemType.PAGE,
        content_id: 1341,
        html_url: "https://canvas.example.edu/courses/222/modules/items/772",
        url: "https://canvas.example.edu/api/v1/courses/222/pages/991",
        page_url: "organic-reactions",
        external_url: "https://www.example.com/organic-reactions",
        new_tab: false,
        completion_requirement: { type: "view", completed: true },
        content_details: { points_possible: 0, due_at: "2012-12-31T06:00:00-06:00", unlock_at: "2012-12-31T06:00:00-06:00", lock_at: "2012-12-31T06:00:00-06:00" },
        published: true
    },
    {
        id: 773,
        module_id: 128,
        position: 6,
        title: "Biology: Cell Structure",
        indent: 2,
        type: ModuleItemType.FILE,
        content_id: 1342,
        html_url: "https://canvas.example.edu/courses/222/modules/items/773",
        url: "https://canvas.example.edu/api/v1/courses/222/files/992",
        page_url: "cell-structure",
        external_url: "https://www.example.com/cell-structure",
        new_tab: false,
        completion_requirement: { type: "min_score", min_score: 8, completed: false },
        content_details: { points_possible: 10, due_at: "2012-12-31T06:00:00-06:00", unlock_at: "2012-12-31T06:00:00-06:00", lock_at: "2012-12-31T06:00:00-06:00" },
        published: true
    },
    {
        id: 774,
        module_id: 129,
        position: 7,
        title: "Computer Science: Algorithms",
        indent: 0,
        type: ModuleItemType.EXTERNAL_URL,
        content_id: 1343,
        html_url: "https://canvas.example.edu/courses/222/modules/items/774",
        url: "https://canvas.example.edu/api/v1/courses/222/external_urls/993",
        page_url: "algorithms",
        external_url: "https://www.example.com/algorithms",
        new_tab: true,
        completion_requirement: { type: "view", completed: true },
        content_details: { points_possible: 0, due_at: "2012-12-31T06:00:00-06:00", unlock_at: "2012-12-31T06:00:00-06:00", lock_at: "2012-12-31T06:00:00-06:00" },
        published: true
    },
    {
        id: 775,
        module_id: 130,
        position: 8,
        title: "Literature: Shakespeare's Works",
        indent: 1,
        type: ModuleItemType.EXTERNAL_TOOL,
        content_id: 1344,
        html_url: "https://canvas.example.edu/courses/222/modules/items/775",
        url: "https://canvas.example.edu/api/v1/courses/222/external_tools/994",
        page_url: "shakespeare",
        external_url: "https://www.example.com/shakespeare",
        new_tab: false,
        completion_requirement: { type: "min_score", min_score: 12, completed: true },
        content_details: { points_possible: 15, due_at: "2012-12-31T06:00:00-06:00", unlock_at: "2012-12-31T06:00:00-06:00", lock_at: "2012-12-31T06:00:00-06:00" },
        published: true
    },
    {
        id: 776,
        module_id: 131,
        position: 9,
        title: "History: World War II",
        indent: 0,
        type: ModuleItemType.ASSIGNMENT,
        content_id: 1345,
        html_url: "https://canvas.example.edu/courses/222/modules/items/776",
        url: "https://canvas.example.edu/api/v1/courses/222/assignments/995",
        page_url: "world-war-ii",
        external_url: "https://www.example.com/world-war-ii",
        new_tab: false,
        completion_requirement: { type: "min_score", min_score: 10, completed: false },
        content_details: { points_possible: 20, due_at: "2012-12-31T06:00:00-06:00", unlock_at: "2012-12-31T06:00:00-06:00", lock_at: "2012-12-31T06:00:00-06:00" },
        published: true
    },
];


// export const moduleHandlers: HttpHandler[] = [
//     http.get(`${import.meta.env.VITE_BACKEND_URL}/modules/*`, () => {
//         return HttpResponse.json<ModuleItem>(exampleModules[0]);
//     }),
// ];

export const moduleItemHandlers: HttpHandler[] = [
    // retrieve module by its id
    http.get(`${import.meta.env.VITE_BACKEND_URL}/modules/:id`, (req) => {
        const { id } = req.params;
        const module = exampleModulesItems.find((module: { id: number; }) => module.id === parseInt(id, 10));
        if (module) {
            return HttpResponse.json<ModuleItem>(module);
        }
    }),
    // retrieve all modules
    http.get(`${import.meta.env.VITE_BACKEND_URL}/modules`, () => {
        return HttpResponse.json<ModuleItem[]>(exampleModulesItems);
    }),
];
