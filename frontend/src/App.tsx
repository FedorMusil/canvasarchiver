import Layout from '@/src/pages/Layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './globals.css';
import { NextThemesProvider } from './providers/NextThemesProvider';

// --- Lazy Imports ---
const Home = lazy(() => import('@/src/pages/Home'));
const Material = lazy(() => import('@/src/pages/Material'));

const App: React.FC = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 30,
            },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            <NextThemesProvider
                attribute='class'
                defaultTheme='light'
                disableTransitionOnChange
                enableSystem
                themes={['light', 'dark']}
            >
                <RouterProvider router={router} />
            </NextThemesProvider>
            {import.meta.env.MODE === 'mock' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
};

export default App;

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            {
                path: ':materialId',
                element: <Material />,
            },
        ],
    },
]);
