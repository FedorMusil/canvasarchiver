import { ExternalLink } from 'lucide-react';
import type { FC, ReactElement } from 'react';

const Footer: FC = (): ReactElement => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className='w-screen text-center flex flex-col items-center text-sm gap-2 mt-4 p-4'>
            <p>Copyright &copy; {currentYear} Canvas Archiver</p>
            <a
                className='w-fit flex justify-center gap-1'
                href='https://github.com/FedorMusil/canvasarchiver'
                target='_blank'
            >
                <p>View source code on Github</p>
                <ExternalLink className='w-4 h-4' />
            </a>
        </footer>
    );
};
Footer.displayName = 'Footer';
export default Footer;
