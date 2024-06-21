import { http, HttpHandler, HttpResponse } from 'msw';
import { Section } from '../api/section'

export const sectionHandlers: HttpHandler[] = [
    // retrieve section by its id
    http.get(`${import.meta.env.VITE_BACKEND_URL}/sections/:id`, (req) => {
        const { id } = req.params;
        const section = exampleSections.find((section) => section.id === parseInt(id as string, 10));
        if (section) {
            return HttpResponse.json<Section>(section);
        }
    }),
    // retrieve all sections
    http.get(`${import.meta.env.VITE_BACKEND_URL}/sections`, () => {
        console.log(exampleSections)
        return HttpResponse.json<Section[]>(exampleSections);
    }),
];

export const exampleSections: Section[] = [
    {
        id: 242604,
        course_id: 5285,
        name: "aaaaa",
        start_at: null,
        end_at: null,
        created_at: "2024-06-17T11:31:25Z",
        restrict_enrollments_to_section_dates: null,
        nonxlist_course_id: null,
        sis_section_id: null,
        sis_course_id: "1800.1040",
        integration_id: null
    },
    {
        id: 9012,
        course_id: 5285,
        name: "Atoomfysica 1",
        start_at: null,
        end_at: null,
        created_at: "2019-03-19T18:57:10Z",
        restrict_enrollments_to_section_dates: null,
        nonxlist_course_id: null,
        sis_section_id: "1800.1040",
        sis_course_id: "1800.1040",
        integration_id: null
    },
    {
        id: 242603,
        course_id: 5285,
        name: "Atoomfysica 1 2024-06-17",
        start_at: null,
        end_at: null,
        created_at: "2024-06-17T11:29:01Z",
        restrict_enrollments_to_section_dates: null,
        nonxlist_course_id: null,
        sis_section_id: null,
        sis_course_id: "1800.1040",
        integration_id: null
    },
    {
        id: 1000,
        course_id: 5285,
        name: "Groep A",
        start_at: null,
        end_at: null,
        created_at: "2024-06-17T11:31:25Z",
        restrict_enrollments_to_section_dates: null,
        nonxlist_course_id: null,
        sis_section_id: null,
        sis_course_id: "1800.1040",
        integration_id: null
    },
    {
        id: 2000,
        course_id: 5285,
        name: "Groep B",
        start_at: null,
        end_at: null,
        created_at: "2019-03-19T18:57:10Z",
        restrict_enrollments_to_section_dates: null,
        nonxlist_course_id: null,
        sis_section_id: "1800.1040",
        sis_course_id: "1800.1040",
        integration_id: null
    },
    {
        id: 3000,
        course_id: 5285,
        name: "Groep C",
        start_at: null,
        end_at: null,
        created_at: "2024-06-17T11:29:01Z",
        restrict_enrollments_to_section_dates: null,
        nonxlist_course_id: null,
        sis_section_id: null,
        sis_course_id: "1800.1040",
        integration_id: null
    },
];
