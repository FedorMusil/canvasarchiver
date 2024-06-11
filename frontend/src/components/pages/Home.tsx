import { FC, ReactElement } from 'react';
import { getUser } from '../../api/account';
import { useQuery } from '@tanstack/react-query';

const Home: FC = (): ReactElement => {
    const { data, isError, isLoading } = useQuery({
        queryKey: ['test', 1],
        queryFn: getUser,
    });

    return (
        <main>
            <h1 className='text-4xl font-bold'>Home</h1>
            {isLoading && <div>Loading...</div>}
            {isError && <div>Error</div>}
            {data && <div data-testid='home-account-data'>{JSON.stringify(data)}</div>}
        </main>
    );
};
export default Home;
