import { AxiosWrapper } from './wrapper';
import { ModuleItem } from './moduleItem.ts';

export type Module = {
    id: number;
    workflow_state: 'active' | 'deleted';
    position: number;
    name: string;
    unlock_at?: string;
    require_sequential_progress: boolean;
    prerequisite_module_ids: number[];
    items_count: number;
    items_url: string;
    items: ModuleItem[] | null;
    state: 'locked' | 'unlocked' | 'started' | 'completed';
    completed_at?: string | null;
    publish_final_grade?: boolean | null;
    published: boolean;
};

export const getAllModules = async (): Promise<Module[]> => {
    const response = await AxiosWrapper({
        method: 'GET',
        url: '/modules',
    });
    return response;
};
