import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getRecentChanges } from '../api/change';
import RecentChanges from '../components/RecentChanges/RecentChanges';

// Mock the getRecentChanges API function
vi.mock('../api/change', () => ({
    getRecentChanges: vi.fn(),
}));

const queryClient = new QueryClient();

describe('RecentChanges', () => {
    beforeEach(() => {
        queryClient.clear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () =>
        render(
            <QueryClientProvider client={queryClient}>
                <RecentChanges />
            </QueryClientProvider>
        );

    test('renders loading state initially', () => {
        vi.mocked(getRecentChanges).mockReturnValue(new Promise(() => {}));
        renderComponent();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});
