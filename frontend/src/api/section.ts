import { AxiosWrapper } from './wrapper';

export type Section = {
    id: number;
    course_id: number;
    name: string;
    start_at: string | null;
    end_at: string | null;
    created_at: string;
    restrict_enrollments_to_section_dates: boolean | null;
    nonxlist_course_id: number | null;
    sis_section_id: string | null;
    sis_course_id: string;
    integration_id: string | null;
};

export const getSection = async ({queryKey}: {queryKey: [string, number]}): Promise<Section> => {
    const [, sectionId] = queryKey;
    const response = await AxiosWrapper({
        method: 'GET',
        url: `/sections/${sectionId}`,
    });
    return response;
};

export const getAllSections = async (): Promise<Section[]> => {
    const response = await AxiosWrapper({
        method: 'GET',
        url: '/sections',
    });
    return response;
};