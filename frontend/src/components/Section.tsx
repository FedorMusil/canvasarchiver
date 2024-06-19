import React, { FC } from 'react';
import { Section } from '../api/section';

interface SectionComponentProps {
    data: Section[];
}

const SectionComponent: FC<SectionComponentProps> = ({ data }) => {
    return (
        <div className="p-16">
            <ul className="flex flex-wrap gap-4 justify-start">
                {data.map((section: Section) => (
                    <li key={section.id} className="bg-card text-card-foreground w-40 h-40 rounded p-3 hover:bg-blue-50 border border-gray-300 flex-shrink-0">
                        <a className="hover:underline font-medium" href="#">{section.name}</a>
                        <p>id: {section.id}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SectionComponent;
