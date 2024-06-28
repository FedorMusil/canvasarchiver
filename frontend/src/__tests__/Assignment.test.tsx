import { Assignment } from '../components/Materials';
import { render, waitFor, RenderResult } from '@testing-library/react';
import { describe, expect, test, beforeEach } from 'vitest';
import { format } from 'date-fns';
import { exampleChanges } from '../mock/change-mock';

describe('Assignment Component', () => {
    let renderResult: RenderResult;
    let change: any; // Adjust the type as per your Change interface/type

    beforeEach(() => {
        change = exampleChanges.find((change) => change.item_type === 'Assignments');
        if (change) {
            renderResult = render(<Assignment change={change} />);
        }
    });

    test('renders assignment details correctly', async () => {
        if (change.data_object && Array.isArray(change.data_object)) {
            await waitFor(() => {
                change.data_object.forEach((assignment: any, index: number) => {
                    const assignmentElement = renderResult.getAllByText(assignment.name);
                    assignmentElement.forEach((element) => {
                        expect(element).toBeInTheDocument();
                    });

                    const dueDateElement = renderResult.getAllByText(
                        format(new Date(assignment.due_at), 'dd/MM/yyyy')
                    );
                    dueDateElement.forEach((element) => {
                        expect(element).toBeInTheDocument();
                    });

                    const pointsElement = renderResult.getAllByText(assignment.points_possible.toString());
                    pointsElement.forEach((element) => {
                        expect(element).toBeInTheDocument();
                    });

                    const submissionTypesElement = renderResult.getAllByText(
                        assignment.submission_types.join(', ')
                    );
                    submissionTypesElement.forEach((element) => {
                        expect(element).toBeInTheDocument();
                    });

                    if (assignment.unlock_at) {
                        const unlockDateElement = renderResult.getAllByText(
                            format(new Date(assignment.unlock_at), 'dd/MM/yyyy')
                        );
                        unlockDateElement.forEach((element) => {
                            expect(element).toBeInTheDocument();
                        });
                    }

                    if (assignment.lock_at) {
                        const lockDateElement = renderResult.getAllByText(
                            format(new Date(assignment.lock_at), 'dd/MM/yyyy')
                        );
                        lockDateElement.forEach((element) => {
                            expect(element).toBeInTheDocument();
                        });
                    }

                    const descriptionElement = renderResult.getAllByText(assignment.description);
                    descriptionElement.forEach((element) => {
                        expect(element).toBeInTheDocument();
                    });

                    const createdAtElement = renderResult.getAllByText(format(new Date(assignment.created_at), 'dd/MM/yyyy'));
                    createdAtElement.forEach((element) => {
                        expect(element).toBeInTheDocument();
                    });

                    const updatedAtElement = renderResult.getAllByText(format(new Date(assignment.updated_at), 'dd/MM/yyyy'));
                    updatedAtElement.forEach((element) => {
                        expect(element).toBeInTheDocument();
                    });

                    // Example of checking a link if needed (adjust as per your actual component)
                    // const linkElement = renderResult.getByRole('link', { name: `${assignment.name}.pdf` });
                    // expect(linkElement).toBeInTheDocument();
                });
            });
        }
    });
});
