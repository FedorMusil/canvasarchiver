import Home from './components/pages/Home';
import { FC, ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const App: FC = (): ReactElement => {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <Home />
            {import.meta.env.MODE === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
};
export default App;
