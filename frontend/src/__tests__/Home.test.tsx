import Home from '../components/pages/Home';
import { describe, expect, test } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor, type RenderResult } from '@testing-library/react';

const queryClient = new QueryClient();
describe('Home', () => {
    let renderResult: RenderResult;

    beforeEach(() => {
        renderResult = render(
            <QueryClientProvider client={queryClient}>
                <Home />
            </QueryClientProvider>
        );
    });

    test('renders', async () => {
        await waitFor(() => {
            const element = renderResult.getByTestId('home-account-data');
            expect(element).toBeInTheDocument();
        });
    });

    test('renders with data', () => {});
});
