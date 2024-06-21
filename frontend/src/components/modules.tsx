import React, { FC } from 'react';
import { Module } from '../api/module';

interface ModuleComponentProps {
    data: Module[];
}

const ModuleComponent: FC<ModuleComponentProps> = ({ data }) => {
    return (
        <main className="p-6">
            <div className="max-h-screen overflow-y-auto">
                <div className="pb-40">
            {data.map((module) => (
                    <div key={module.id}
                        className="bg-card p-6 flex justify-center items-center">
                        <div className="bg-secondary w-full max-w-full border border-gray-300">
                            <div className="flex items-center justify-between m-5 cursor-pointer">
                                <span className="text-xl font-bold text-card-foreground">
                                    {module.name}
                                </span>
                            </div>
                            {Array.isArray(module.items) && module.items.length > 0 && (
                                    <ul className="bg-card divide-y divide-gray-200 mt-2">
                                        {module.items.map((item) => (
                                            <li
                                                key={item.id}
                                                className="p-4 hover:bg-secondary flex items-center"
                                            >
                                                <div className="pl-5 pb-3.5">
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
        </main>
    );
};

export default ModuleComponent;
