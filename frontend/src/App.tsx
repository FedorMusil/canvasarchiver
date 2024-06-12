import Home from '@/src/pages/Home';
import Module from '@/src/pages/Module';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const App: React.FC = () => {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Home />}>
                        <Route path=':module-id' element={<Module />} />
                    </Route>
                </Routes>
            </BrowserRouter>
            {import.meta.env.MODE === 'mock' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
};

export default App;
