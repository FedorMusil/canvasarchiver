import { AxiosWrapper } from './wrapper';

export enum ModuleItemType {
    FILE = 'File',
    PAGE = 'Page',
    DISCUSSION = 'Discussion',
    ASSIGNMENT = 'Assignment',
    QUIZ = 'Quiz',
    SUBHEADER = 'SubHeader',
    EXTERNAL_URL = 'ExternalUrl',
    EXTERNAL_TOOL = 'ExternalTool',
}

export type ModuleItem = {
    id: number;
    module_id: number;
    position: number;
    title: string;
    indent: number;
    type: ModuleItemType;
    content_id: number;
    html_url: string;
    url: string;
    page_url?: string;
    external_url?: string;
    new_tab?: boolean;
    completion_requirement?: {
        type: string;
        min_score?: number;
        completed?: boolean;
    };
    content_details?: {
        points_possible: number;
        due_at: string;
        unlock_at: string;
        lock_at: string;
    };
    published?: boolean;
};

export const getModuleItem = async ({ queryKey }: { queryKey: [string, number] }): Promise<ModuleItem> => {
    const [, moduleId] = queryKey;

    const response = await AxiosWrapper({
        method: 'GET',
        url: `/modules/${moduleId}`,
    });

    return response;
};

export const getAllModulesItems= async (): Promise<ModuleItem[]> => {
    const response = await AxiosWrapper({
        method: 'GET',
        url: '/modules',
    });
    return response;
};

