import Footer from '@/src/components/Footer';
import GlobalStoreProvider from '../stores/GlobalStore/globalStore';
import Header from '@/src/components/header/Header';
import type { FC, ReactElement } from 'react';
import { Outlet } from 'react-router-dom';

const Layout: FC = (): ReactElement => {
    // TODO: Get the course code and user data dynamically.
    const courseCode = '5062PRSE5Y';
    const userCode = '1234567890';

    return (
        <GlobalStoreProvider courseCode={courseCode} userCode={userCode}>
            <Header />
            <main className='min-h-dvh mt-14 md:mt-20 w-screen px-4' id='main-content'>
                <Outlet />
            </main>
            <Footer />
        </GlobalStoreProvider>
    );
};
Layout.displayName = 'Layout';
export default Layout;
