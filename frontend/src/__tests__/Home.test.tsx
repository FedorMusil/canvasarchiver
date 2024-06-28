import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor, type RenderResult } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import Home from '../pages/Home';

describe('Home', () => {
    let renderResult: RenderResult;

    beforeEach(() => {
        vi.mock('react-router-dom', () => ({
            ...vi.importActual('react-router-dom'),
            useNavigate: () => vi.fn(),
        }));

        const queryClient = new QueryClient();
        renderResult = render(
            <QueryClientProvider client={queryClient}>
                <Home />
            </QueryClientProvider>
        );
    });

    test('renders', async () => {
        await waitFor(() => {
            expect(renderResult.getByText('Home')).toBeInTheDocument();
            expect(renderResult.getByText(/Welcome back, [a-zA-Z0-9]+/)).toBeInTheDocument();
        });
    });
});
