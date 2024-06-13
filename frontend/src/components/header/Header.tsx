import Logo from './Logo';
import Navigation from './Navigation';
import { Link } from 'react-router-dom';
import { type FC, type ReactElement } from 'react';

const SkipToMainContent: FC = (): ReactElement => {
    return (
        <a
            href='#main-content'
            className='absolute w-44 rounded-full text-center ml-auto mr-auto left-0 right-0 p-1 mt-2 bg-background transition-transform -translate-y-[200%] focus:translate-y-0'
        >
            Skip to main content
        </a>
    );
};
SkipToMainContent.displayName = 'SkipToMainContent';

const Header: FC = (): ReactElement => {
    return (
        <header className='fixed z-50 inset-0 h-14 px-4 py-2 md:h-20 flex justify-between w-screen items-center md:p-4 bg-background'>
            <SkipToMainContent />
            <Link to='/'>
                <Logo />
            </Link>
            <Navigation />
        </header>
    );
};
Header.displayName = 'Header';
export default Header;
