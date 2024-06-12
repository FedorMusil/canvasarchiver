import GlobalStoreProvider from '../stores/GlobalStore/globalStore';
import { FC, ReactElement } from 'react';

const Home: FC = (): ReactElement => {
    // TODO: Get the course code and user data dynamically.
    const courseCode = '5062PRSE5Y';
    const userCode = '1234567890';

    return (
        <GlobalStoreProvider courseCode={courseCode} userCode={userCode}>
            <main>
                <h1 className='text-4xl font-bold'>Home</h1>
            </main>
        </GlobalStoreProvider>
    );
};
export default Home;
