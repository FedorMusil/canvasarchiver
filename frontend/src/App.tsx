import React from 'react';
import Home from './components/pages/Home';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Initiation from './components/pages/Initiation';

const App: React.FC = () => {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/initiation' element={<Initiation />} />
                </Routes>
            </BrowserRouter>
            {import.meta.env.MODE === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
};

export default App;
