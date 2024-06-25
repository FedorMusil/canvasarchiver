import type { MaterialInputProps } from './material.types';
import { memo, type FC, type ReactElement } from 'react';

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

const Section: FC<MaterialInputProps> = memo(({ change }): ReactElement => {
    const sections = change.data_object as Section[];

    return (
        <ul className='flex flex-wrap gap-4 justify-start'>
            {sections.map((section: Section) => (
                <li
                    key={section.id}
                    className='bg-secondary text-secondary-foreground rounded-md p-3 border-md border-gray-300 flex-shrink-0 flex flex-col'
                >
                    <span className='text-base font-semibold'>{section.name}</span>
                    <span className='text-sm'>id: {section.id}</span>
                </li>
            ))}
        </ul>
    );
});
Section.displayName = 'Section';
export default Section;
