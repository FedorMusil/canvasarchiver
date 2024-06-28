import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor, type RenderResult } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import AddAnnotation from '../components/Annotations/AddAnnotation';

// Mock the hooks used in AddAnnotation component
vi.mock('@/src/hooks/useHighlighter', () => ({
    useHighlight: () => ({
        getAllHighlights: vi.fn(),
        removeAllHighlights: vi.fn(),
    }),
}));

vi.mock('@/src/stores/AnnotationStore', () => ({
    useAnnotationStore: () => ({
        replyTo: null,
        setReplyTo: vi.fn(),
        selectionId: null,
        setSelectionId: vi.fn(),
        prevRef: { current: null },
        curRef: { current: null },
    }),
}));

vi.mock('@/src/stores/ChangeStore/useCompareIdStore', () => ({
    useChangeContext: () => ({
        selectedChangeId: 1,
        materialId: 1,
        curChangeId: 2,
        highlighter: { getHighlightForElement: vi.fn() },
        modifiedPanel: 'prev',
    }),
}));

vi.mock('@hookform/resolvers/valibot', () => ({
    valibotResolver: vi.fn(),
}));

vi.mock('@/src/api/annotation', () => ({
    postAnnotation: vi.fn(),
}));

vi.mock('@/src/api/change', () => ({
    setHighlight: vi.fn(),
}));

const queryClient = new QueryClient();

describe('AddAnnotation', () => {
    let renderResult: RenderResult;

    beforeEach(() => {
        renderResult = render(
            <QueryClientProvider client={queryClient}>
                <AddAnnotation />
            </QueryClientProvider>
        );
    });

    test('renders the input and button', () => {
        const input = renderResult.getByPlaceholderText('Add a new annotation ...');
        const button = renderResult.getByRole('button', { name: /Add annotation/i });

        expect(input).toBeInTheDocument();
        expect(button).toBeInTheDocument();
    });

    test('submits the form with valid data', async () => {
        const input = renderResult.getByPlaceholderText('Add a new annotation ...');
        const button = renderResult.getByRole('button', { name: /Add annotation/i });

        fireEvent.change(input, { target: { value: 'Test annotation' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(input).toHaveValue('');
        });
    });
});
