import Footer from '@/src/components/Footer';
import Header from '@/src/components/header/Header';
import { Fragment, Suspense, type FC, type ReactElement } from 'react';
import { Outlet } from 'react-router-dom';

const Layout: FC = (): ReactElement => {
    return (
        <Fragment>
            <Header />
            <main
                className='min-h-[100dvh] pt-14 md:pt-20 w-screen px-4 overflow-x-hidden lg:overflow-auto'
                id='main-content'
            >
                <Suspense fallback={null}>
                    <Outlet />
                </Suspense>
            </main>
            <Footer />
        </Fragment>
    );
};
Layout.displayName = 'Layout';
export default Layout;
