import { format } from 'date-fns';
import type { MaterialInputProps } from './material.types';
import { memo, type FC, type ReactElement } from 'react';

export type Quiz = {
    id: number;
    title: string;
    question_count: number;
    points_possible: number;
    due_at: string; // Date string
    unlock_at: string; // Date string
};

const Quiz: FC<MaterialInputProps> = memo(({ change }): ReactElement => {
    const quizzes = change.content as Quiz[];

    return (
        <div className='px-5 divide-y-2 divide-muted-foreground'>
            {quizzes.map((quiz, index) => (
                <div className='py-4 flex flex-col gap-2' key={index}>
                    <h4 className='font-semibold'>{quiz.title}</h4>

                    <div className='w-full flex gap-4 text-sm'>
                        {new Date() >= new Date(quiz.unlock_at) && new Date() <= new Date(quiz.due_at) ?
                            <span>Available until {format(new Date(quiz.due_at), 'dd/MM/yyyy')}</span>
                        : new Date() > new Date(quiz.due_at) ?
                            <>
                                <span>Closed</span>
                                <span>Not available until {format(new Date(quiz.unlock_at), 'dd/MM/yyyy')}</span>
                            </>
                        :   <span>Due {format(quiz.due_at, 'dd/MM/yyyy')}</span>}

                        <span>{quiz.points_possible} pt</span>
                        <span>{quiz.question_count} Questions</span>
                    </div>
                </div>
            ))}
        </div>
    );
});
Quiz.displayName = 'Quiz';
export default Quiz;
