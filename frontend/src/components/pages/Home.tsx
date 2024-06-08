import { FC, ReactElement } from 'react';
import { getUser } from '../../api/account';
import { useQuery } from '@tanstack/react-query';
import { ProfileDropdown } from '../profile/ProfileDropdown';

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

            {data && <ProfileDropdown {...data} />}
        </main>
    );
};
export default Home;