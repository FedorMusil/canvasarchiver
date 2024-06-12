import CommentContainer from './components/pages/Comment_Container';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { FC, ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './globals.css';


const App: FC = (): ReactElement => {
  const queryClient = new QueryClient();

  return (
      <QueryClientProvider client={queryClient}>
          <BrowserRouter>
              <Routes>
                  <Route path='/' element={<CommentContainer />} />
              </Routes>
          </BrowserRouter>

          {import.meta.env.MODE === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
  );
};
export default App;
