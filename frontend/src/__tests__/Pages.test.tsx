import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { format } from 'date-fns';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ItemTypes } from '../api/change';
import { Page } from '../components/Materials';
import { exampleChanges } from '../mock/change-mock';

describe('Page Component', () => {
    let renderResult: RenderResult;
    let change: any; // Adjust the type as per your Change interface/type

    beforeEach(() => {
        vi.mock('react-router-dom', () => ({
            ...vi.importActual('react-router-dom'),
            useNavigate: () => vi.fn(),
        }));

        change = exampleChanges.find((change) => change.item_type === ItemTypes.PAGES);
        if (change) renderResult = render(<Page change={change} />);
    });

    test('renders table with correct headers and data', async () => {
        if (change) {
            // Verify the table headers
            await waitFor(() => {
                expect(screen.getByText('Title')).toBeInTheDocument();
                expect(screen.getByText('Created')).toBeInTheDocument();
                expect(screen.getByText('Last Edited')).toBeInTheDocument();
                expect(screen.getByText('Edited By')).toBeInTheDocument();
                expect(screen.getByText('Front Page')).toBeInTheDocument();
            });

            // Verify cell content using queryAllByText to handle multiple matches
            const pages = change.content as Array<{
                title: string;
                creationDate: string;
                lastEditDate: string;
                lastEditedBy: string;
                isFrontPage?: boolean;
            }>;

            pages.forEach((page) => {
                if (page.title) {
                    const titleCells = screen.getAllByText(page.title);
                    expect(titleCells.length).toBeGreaterThanOrEqual(1);
                    titleCells.forEach((cell) => {
                        expect(cell).toBeInTheDocument();
                    });
                }
                if (page.lastEditedBy) {
                    const editedByCells = screen.getAllByText(page.lastEditedBy);
                    expect(editedByCells.length).toBeGreaterThanOrEqual(1);
                    editedByCells.forEach((cell) => {
                        expect(cell).toBeInTheDocument();
                    });
                }
                if (page.isFrontPage !== undefined) {
                    const frontPageCells = screen.getAllByText(page.isFrontPage.toString());
                    expect(frontPageCells.length).toBeGreaterThanOrEqual(1);
                    frontPageCells.forEach((cell) => {
                        expect(cell).toBeInTheDocument();
                    });
                }
                if (page.creationDate) {
                    const creationDateCells = screen.getAllByText(format(new Date(page.creationDate), 'dd/MM/yyyy'));
                    expect(creationDateCells.length).toBeGreaterThanOrEqual(1);
                    creationDateCells.forEach((cell) => {
                        expect(cell).toBeInTheDocument();
                    });
                }
                if (page.lastEditDate) {
                    const lastEditDateCells = screen.getAllByText(format(new Date(page.lastEditDate), 'dd/MM/yyyy'));
                    expect(lastEditDateCells.length).toBeGreaterThanOrEqual(1);
                    lastEditDateCells.forEach((cell) => {
                        expect(cell).toBeInTheDocument();
                    });
                }
            });
        }
    });
});
