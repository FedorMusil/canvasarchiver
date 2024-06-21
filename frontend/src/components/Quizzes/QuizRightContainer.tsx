import { Change } from "@/src/api/change";
import { useState, useEffect } from "react";

export type Quiz = {
    id: number,
    title: string,
    question_count: number,
    points_possible: number,
    due_at: Date,
    unlock_at: Date
    status?: 'added' | 'removed' | 'modified' | 'unchanged' | null;
}

type QuizContainerProps = {
    changeBefore: Change;
    changeAfter: Change;
}

const QuizRightContainer: React.FC<QuizContainerProps> = ({ changeBefore, changeAfter }: QuizContainerProps) => {
    const [oldQuizzes, setOldQuizzes] = useState<Quiz[]>([]);
    const [newQuizzes, setNewQuizzes] = useState<Quiz[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const parseDiff = (diff: unknown, setQuizzes: React.Dispatch<React.SetStateAction<Quiz[]>>) => {
            if (typeof diff === 'string' && (diff.trim().startsWith('{') || diff.trim().startsWith('['))) {
                try {
                    const parsedDiff = JSON.parse(diff);
                    if (Array.isArray(parsedDiff)) {
                        setQuizzes(parsedDiff);
                    } else {
                        setQuizzes([]);
                    }
                } catch (error) {
                    console.error("Error parsing JSON from diff", error);
                    setQuizzes([]);
                }
            }
        };

        parseDiff(changeBefore.diff, setOldQuizzes);
        parseDiff(changeAfter.diff, setNewQuizzes);
    }, [changeBefore.diff, changeAfter.diff]);

    useEffect(() => {
        if (oldQuizzes && newQuizzes) {
            const changes = compareQuizzes(oldQuizzes, newQuizzes);
            const sortedQuizzes = sortQuizzes(changes);
            setQuizzes(sortedQuizzes);
        }
    }, [oldQuizzes, newQuizzes]);

    const formatDate = (dateStr: Date) => {
        const date = new Date(dateStr);
        return `${date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} at ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    };

    function compareQuizzes(oldData: Quiz[], newData: Quiz[]): Quiz[] {
        const added = newData.filter(nq => !oldData.some(oq => oq.id === nq.id))
            .map(quiz => ({ ...quiz, status: 'added' }));
        const removed = oldData.filter(oq => !newData.some(nq => nq.id === oq.id))
            .map(quiz => ({ ...quiz, status: 'removed' }));
        const existing = newData.filter(nq => oldData.some(oq => oq.id === nq.id));

        const modified = existing.map(nq => {
            const oq = oldData.find(oq => oq.id === nq.id) || {} as Quiz;
            if (!oq) return null;
            let isModified = false;

            if (nq.title !== oq.title || nq.question_count !== oq.question_count ||
                nq.points_possible !== oq.points_possible || new Date(nq.due_at).getTime() !== new Date(oq.due_at).getTime() ||
                new Date(nq.unlock_at).getTime() !== new Date(oq.unlock_at).getTime()) {
                isModified = true;
            }

            return isModified ? { ...nq, status: 'modified' } : null;
        }).filter(nq => nq !== null);

        const unchanged = existing.filter(eq => !modified.some(mq => mq && mq.id === eq.id))
            .map(quiz => ({ ...quiz, status: 'unchanged' }));

        return [...added, ...unchanged, ...modified, ...removed].filter(quiz => quiz !== null) as Quiz[];
    }

    function sortQuizzes(quizzes: Quiz[]): Quiz[] {
        return quizzes.sort((a, b) => {
            if (a.status === 'removed') return 1;
            if (b.status === 'removed') return -1;
            return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
        });
    }

    function getBackgroundColor(quiz: Quiz) {
        switch (quiz.status) {
            case 'added':
                return 'green';
            case 'removed':
                return 'red';
            case 'modified':
                return 'yellow';
            default:
                return 'white';
        }
    }

    return (
        <div style={{ backgroundColor: 'white', padding: '25px', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#f3f3f3', width: '100%', maxWidth: '100%', border: '1px solid #ccc' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '19px', cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)} >
                    <span style={{ fontSize: '19px', fontWeight: 'bold', color: '#202020' }}>{isOpen ? '▾' : '▸'} Assignment quizzes</span>
                </div>
                {isOpen && quizzes.map((quiz, index) => (
                    <div key={index} style={{ borderTop: '1px solid #ccc', backgroundColor: getBackgroundColor(quiz), paddingLeft: '20px', paddingBottom: '14px', color: '#202020' }}>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, marginBottom: '7px', marginTop: '14px' }}>{quiz.title}</p>

                        <div style={{ display: 'flex', gap: '15px', fontSize: '15px' }}>
                            {new Date() >= new Date(quiz.unlock_at) && new Date() <= new Date(quiz.due_at) ? (
                                <span style={{ color: '#454545' }}><span style={{ fontWeight: 'bold' }}>Available until</span> {formatDate(quiz.due_at)}</span>
                            ) : new Date() > new Date(quiz.due_at) ? (
                                <span style={{ color: '#454545', fontWeight: 'bold' }}>Closed</span>
                            ) : (
                                <span style={{ color: '#454545' }}><span style={{ fontWeight: 'bold' }}>Not available until</span> {formatDate(quiz.unlock_at)}</span>
                            )}
                            <span style={{ color: '#454545' }}><span style={{ fontWeight: 'bold' }}>Due</span> {formatDate(quiz.due_at)}</span>
                            <span style={{ color: '#454545' }}>{quiz.points_possible} pt</span>
                            <span style={{ color: '#454545' }}>{quiz.question_count} Questions</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default QuizRightContainer;