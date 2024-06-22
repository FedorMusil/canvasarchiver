import Footer from '@/src/components/Footer';
import Header from '@/src/components/header/Header';
import { Outlet } from 'react-router-dom';
import { Fragment, type FC, type ReactElement } from 'react';

const Layout: FC = (): ReactElement => {
    return (
        <Fragment>
            <Header />
            <main className='h-[100dvh] pt-14 md:pt-20 w-screen px-4' id='main-content'>
                <Outlet />
            </main>
            <Footer />
        </Fragment>
    );
};
Layout.displayName = 'Layout';
export default Layout;
