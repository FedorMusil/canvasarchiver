import Home from '@/src/pages/Home';
import { render, waitFor, type RenderResult } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

describe('Home', () => {
    let renderResult: RenderResult;

    beforeEach(() => {
        renderResult = render(<Home />);
    });

    test('renders', async () => {
        await waitFor(() => {
            const element = renderResult.getByText('Home');
            expect(element).toBeInTheDocument();
        });
    });

    test('renders with data', () => {});
});
