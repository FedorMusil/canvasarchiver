import { Section } from '../components/Materials';
import { Change } from '../api/change';
import { exampleChanges } from '../mock/change-mock';
import { render, waitFor, type RenderResult } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

describe('Section', () => {
    let renderResult: RenderResult;
    let change: Change;

    beforeEach(() => {
        change = exampleChanges.find(change => change.item_type === 'Sections') as Change;
        if (change) {
            renderResult = render(<Section change={change} />);
        }
    });

    test('renders', async () => {
        if (change.data_object && Array.isArray(change.data_object)) {
            for (const item of change.data_object) {
                await waitFor(() => {
                    const title = renderResult.getByText(item.name);
                    expect(title).toBeInTheDocument();

                    const sec_id = renderResult.getByText(`id: ${item.id}`);
                    expect(sec_id).toBeInTheDocument();
                });
            }
        }
    });
});
