import { Change } from '@/src/api/change';

type ChangeWrapper = {
    change: Change;
};

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

export default function SectionDiff({ change }: ChangeWrapper) {
    const sectionJSON = JSON.parse(change.diff);
    // normalizes incoming json object
    const sectionData = Array.isArray(sectionJSON) ? sectionJSON: [sectionJSON];
    
    return (
        <div className="overflow-y-auto pb-40">
            <div className="p-16">
                <ul className="flex flex-wrap gap-4 justify-start">
                    {sectionData.map((section: Section) => (
                        <li key={section.id} className="bg-card text-card-foreground w-40 h-40 rounded p-3 hover:bg-secondary border border-gray-300 flex-shrink-0">
                            <a className="hover:underline font-medium" href="#">{section.name}</a>
                            <p>id: {section.id}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>    
    );
};
