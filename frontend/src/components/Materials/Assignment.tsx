import { format } from 'date-fns';
import type { MaterialInputProps } from './material.types';
import { memo, type FC, type ReactElement } from 'react';

export type Assignment = {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    due_at: string;
    lock_at: string | null;
    unlock_at: string | null;
    points_possible: number;
    submission_types: string[];
    published: boolean;
};

const Assignment: FC<MaterialInputProps> = memo(({ change }): ReactElement => {
    const assignments = change.data_object as Assignment[];

    return (
        <div className='flex flex-col gap-4'>
            {assignments.map((assignment: Assignment, index: number) => (
                <div key={index} className='p-6 max-w-3xl mx-auto bg-card shadow-md rounded-lg'>
                    <h1 className='text-2xl font-bold mb-4'>{assignment.name}</h1>
                    <ul className='mb-4 space-y-2'>
                        <li>
                            <span className='font-semibold'>Due: </span>
                            <span>{format(new Date(assignment.due_at), 'dd/MM/yyyy')}</span>
                        </li>
                        <li>
                            <span className='font-semibold'>Points: </span>
                            <span>{assignment.points_possible}</span>
                        </li>
                        <li>
                            <span className='font-semibold'>Submitting: </span>
                            <span>{assignment.submission_types.join(', ')}</span>
                        </li>
                        {assignment.unlock_at && (
                            <li>
                                <span className='font-semibold'>Available: </span>
                                <span>{format(new Date(assignment.unlock_at), 'dd/MM/yyyy')}</span>
                            </li>
                        )}
                        {assignment.lock_at && (
                            <li>
                                <span className='font-semibold'>This assignment was locked: </span>
                                <span>{format(new Date(assignment.lock_at), 'dd/MM/yyyy')}</span>
                            </li>
                        )}
                    </ul>
                    <div className='mb-4'>
                        <p className='font-semibold'>Description: </p>
                        <p>{assignment.description}</p>
                    </div>
                    <div className='mb-4'>
                        <p className='font-semibold'>Created At: </p>
                        <p>{format(new Date(assignment.created_at), 'dd/MM/yyyy')}</p>
                    </div>
                    <div className='mb-4'>
                        <p className='font-semibold'>Last Updated: </p>
                        <p>{format(new Date(assignment.updated_at), 'dd/MM/yyyy')}</p>
                    </div>
                    <a className='text-blue-500 hover:underline' href='#' target='_blank' rel='noopener noreferrer'>
                        {assignment.name}.pdf
                    </a>
                </div>
            ))}
        </div>
    );
});
Assignment.displayName = 'Assignment';
export default Assignment;
