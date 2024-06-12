import Home from '@/src/pages/Home';
import Layout from '@/src/pages/Layout';
import Material from '@/src/pages/Material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NextThemesProvider } from './providers/NextThemesProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const App: React.FC = () => {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <NextThemesProvider
                attribute='class'
                defaultTheme='light'
                disableTransitionOnChange
                enableSystem
                themes={['light', 'dark']}
            >
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<Layout />}>
                            <Route path='' element={<Home />} />
                            <Route path=':material-id' element={<Material />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </NextThemesProvider>
            {import.meta.env.MODE === 'mock' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
};

export default App;
