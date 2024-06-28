import { render, waitFor, type RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import Header from '../components/header/Header';

describe('Header', () => {
    let renderResult: RenderResult;

    beforeEach(() => {
        renderResult = render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
    });

    test('renders Skip to Main Content link', async () => {
        await waitFor(() => {
            const skipLink = renderResult.getByText('Skip to main content');
            expect(skipLink).toBeInTheDocument();
            expect(skipLink).toHaveAttribute('href', '#main-content');
        });
    });

    test('renders SVG', async () => {
        await waitFor(() => {
            const svg = renderResult.container.querySelector('svg');
            expect(svg).toBeInTheDocument();
        });
    });

    test('renders Navigation', async () => {
        await waitFor(() => {
            const course_material = renderResult.getAllByText('Course Materials');
            const setting = renderResult.getAllByText('Settings');
            const home = renderResult.getAllByText('Home');

            course_material.forEach((element) => {
                expect(element).toBeInTheDocument();
            });

            setting.forEach((element) => {
                expect(element).toBeInTheDocument();
            });

            home.forEach((element) => {
                expect(element).toBeInTheDocument();
            });
        });
    });
});
