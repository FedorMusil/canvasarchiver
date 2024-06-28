import { Module } from '../components/Materials';
import { Change } from '../api/change';
import { exampleChanges } from '../mock/change-mock';
import { render, waitFor, type RenderResult } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

describe('Module', () => {
    let renderResult: RenderResult;
    let change: Change;

    beforeEach(() => {
        change = exampleChanges.find(change => change.item_type === 'Modules') as Change;
        if (change) {
            renderResult = render(<Module change={change} />);
        }
    });

    test('renders', async () => {
        if (change.data_object && Array.isArray(change.data_object)) {
            for (const item of change.data_object) {
                await waitFor(() => {
                    if (item.name) {
                        const mod_name = renderResult.getByText(item.name);
                        expect(mod_name).toBeInTheDocument();
                    }

                    if (item.items && item.items.title) {
                        const mod_title = renderResult.getAllByText(item.items.title);
                        mod_title.forEach(element => {
                            expect(element).toBeInTheDocument();
                        });
                    }
                });
            }
        }
    });
});
