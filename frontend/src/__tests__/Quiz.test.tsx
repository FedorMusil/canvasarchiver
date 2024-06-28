import { render, waitFor, type RenderResult } from '@testing-library/react';
import { format } from 'date-fns';
import { describe, expect, test } from 'vitest';
import { Change } from '../api/change';
import { Quiz } from '../components/Materials';
import { exampleChanges } from '../mock/change-mock';

describe('Quiz', () => {
    let renderResult: RenderResult;
    let change: Change;

    beforeEach(() => {
        change = exampleChanges.find((change) => change.item_type === 'Quizzes') as Change;
        if (change) {
            renderResult = render(<Quiz change={change} />);
        }
    });

    test('renders', async () => {
        if (change.content && Array.isArray(change.content)) {
            for (const item of change.content) {
                await waitFor(() => {
                    const title = renderResult.getByText(item.title);
                    expect(title).toBeInTheDocument();

                    const new_date = format(new Date(item.due_at), 'dd/MM/yyyy');
                    const due = renderResult.getByText(`Due ${new_date}`);
                    expect(due).toBeInTheDocument();

                    const points = renderResult.getAllByText(`${item.points_possible} pt`);
                    points.forEach((element) => {
                        expect(element).toBeInTheDocument();
                    });
                    const question = renderResult.getAllByText(`${item.question_count} Questions`);
                    question.forEach((element) => {
                        expect(element).toBeInTheDocument();
                    });
                });
            }
        }
    });
});
