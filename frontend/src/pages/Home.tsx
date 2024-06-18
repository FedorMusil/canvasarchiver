import RecentChanges from '../components/RecentChanges/RecentChanges';
import { FC, ReactElement } from 'react';
import { getSelf } from '@/src/api/self';
import { useGlobalContext } from '@/src/stores/GlobalStore/useGlobalStore';
import { useQuery } from '@tanstack/react-query';

const Home: FC = (): ReactElement => {
    const { userCode } = useGlobalContext((state) => ({
        userCode: state.userCode,
    }));

    const {
        data: self,
        isLoading: selfLoading,
        isError: selfError,
    } = useQuery({
        queryKey: ['self', userCode],
        queryFn: getSelf,
    });

    if (selfLoading) {
        return <div>Loading...</div>;
    }

    if (selfError || !self) {
        return <div>Error...</div>;
    }

    return (
        <div className='w-full h-[calc(100dvh-56px)] md:h-[calc(100dvh-80px)] flex justify-center items-center'>
            <div className='flex gap-12 flex-nowrap lg:flex-row flex-col'>
                <div className='text-justify max-w-[500px]'>
                    <h1 className='text-4xl tracking-tight mb-4'>Home</h1>
                    <h2 className='text-2xl mb-2'>Welcome back, {self.name}!</h2>
                    <p className='text-base'>
                        You have just opened the Canvas Archive utility. This utility allows you to compare changes made
                        to a Canvas course.
                        <br />
                        <br />
                        To get started, select a course material from the navigation bar. You can also view recent
                        changes made to the course in the table.
                    </p>
                </div>
                <div className='w-[500px] shrink lg:shrink-0'>
                    <RecentChanges />
                </div>
            </div>
        </div>
    );
};
export default Home;