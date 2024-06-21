import { Change } from "@/src/api/change";
import { useState, useEffect } from "react";

export type Quiz = {
    id: number,
    title: string,
    question_count: number,
    points_possible: number,
    due_at: Date,
    unlock_at: Date
}

type QuizContainerProps = {
    changeBefore: Change;
}

const QuizLeftContainer: React.FC<QuizContainerProps> = ({ changeBefore }: QuizContainerProps) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (typeof changeBefore.diff === 'string' && (changeBefore.diff.trim().startsWith('{') || changeBefore.diff.trim().startsWith('['))) {
            try {
                const parsedDiff = JSON.parse(changeBefore.diff);

                if (Array.isArray(parsedDiff)) {
                    setQuizzes(parsedDiff);
                }
            } catch (error) {
                console.error("Error parsing JSON from diff", error);
                setQuizzes([]);
            }
        }
    }, [changeBefore.diff]);

    const formatDate = (dateStr: Date) => {
        const date = new Date(dateStr);
        return `${date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} at ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    };

    return (
        <div style={{ padding: '25px', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#f3f3f3', width: '100%', maxWidth: '100%', border: '1px solid #ccc' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '19px', cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)} >
                    <span style={{ fontSize: '19px', fontWeight: 'bold', color: '#202020' }}>{isOpen ? '▾' : '▸'} Assignment quizzes</span>
                </div>
                {isOpen && quizzes.map((quiz, index) => (
                    <div key={index} style={{ borderTop: '1px solid #ccc', backgroundColor: 'white', paddingLeft: '20px', paddingBottom: '14px', color: '#202020' }}>
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
export default QuizLeftContainer;
