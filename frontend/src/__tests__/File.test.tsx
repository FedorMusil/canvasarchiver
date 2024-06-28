import { render, RenderResult, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ItemTypes } from '../api/change';
import { File } from '../components/Materials';
import { exampleChanges } from '../mock/change-mock';

describe('File Component', () => {
    let renderResult: RenderResult;
    let change: any;

    beforeEach(() => {
        vi.mock('react-router-dom', () => ({
            ...vi.importActual('react-router-dom'),
            useNavigate: () => vi.fn(),
        }));

        change = exampleChanges.find((change) => change.item_type === ItemTypes.FILES);
        if (change) renderResult = render(<File change={change} />);
    });

    test('renders file details correctly', async () => {
        if (change.data_object && Array.isArray(change.data_object)) {
            await waitFor(() => {
                change.data_object.forEach((item: any) => {
                    const itemNameElement = renderResult.getByText(item.name);
                    expect(itemNameElement).toBeInTheDocument();

                    if (item.items && item.items.title) {
                        const itemTitleElements = renderResult.getAllByText(item.items.title);
                        itemTitleElements.forEach((element) => {
                            expect(element).toBeInTheDocument();
                        });
                    }
                });
            });
        }
    });
});
