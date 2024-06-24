import { Change } from '@/src/api/change';

type LynnProps = {
    change: Change;
};

export type Quiz = {
    title: string;
    questionCount: number;
    possiblePoints: number;
    dueAt: string;
};

export default function Lynn({ change }: LynnProps) {
    return (
        <div>
            <h1 className='text-4xl text-red-500'>Quiz</h1>
            <p>Amount of questions: {(change.diff as Quiz).questionCount}</p>
        </div>
    );
}
