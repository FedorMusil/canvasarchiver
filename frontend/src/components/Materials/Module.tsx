import type { MaterialInputProps } from './material.types';
import { memo, type FC, type ReactElement } from 'react';

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

const Module: FC<MaterialInputProps> = memo(({ change }): ReactElement => {
    const modules = change.content as Module[];

    return (
        <div className='max-h-screen overflow-y-auto'>
            <div className='pb-40'>
                {modules.map((module: Module) => (
                    <div key={module.id} className='bg-card p-6 flex justify-center items-center'>
                        <div className='bg-secondary w-full max-w-full border border-gray-300'>
                            <div className='flex items-center justify-between m-5 cursor-pointer'>
                                <span className='text-xl font-bold text-card-foreground'>{module.name}</span>
                            </div>
                            {Array.isArray(module.items) && module.items.length > 0 && (
                                <ul className='bg-card divide-y divide-gray-200 mt-2'>
                                    {module.items.map((item) => (
                                        <li key={item.id} className='p-4 hover:bg-secondary flex items-center'>
                                            <div className='pl-5 pb-3.5'>
                                                <p>{item.title}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
Module.displayName = 'Module';
export default Module;
