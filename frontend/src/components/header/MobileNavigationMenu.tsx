import { Button } from '@/src/components/ui/Button';
import { motion } from 'framer-motion';
import { ChevronsUpDown, Menu } from 'lucide-react';
import { memo, useState, type FC, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/src/components/ui/collapsible';
import ThemeSwitcher from '../ThemeSwitcher';

type LinkObject = {
    href?: string;
    label: string;
    children?: LinkObject[];
    singular?: boolean;
    extra?: ReactNode;
};
const linkObject: LinkObject[] = [
    { href: '/', label: 'Home', singular: true },
    {
        label: 'Course Materials',
        children: [
            { href: '/0', label: 'Materials' },
            { href: '/1', label: 'Modules' },
            { href: '/2', label: 'Pages' },
            { href: '/3', label: 'Files' },
            { href: '/4', label: 'Assignments' },
            { href: '/5', label: 'Quizzes' },
        ],
    },
    {
        label: 'Settings',
        children: [
            { label: 'Link Course' },
            { label: 'Get latest changes' },
            { label: 'Set Theme', extra: <ThemeSwitcher /> },
        ],
    },
];

const MobileNavigationMenu: FC = () => {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <div className='md:hidden'>
            <Button
                aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
                className='md:hidden min-w-11 min-h-11 p-0 m-0 grid place-content-center'
                onClick={() => setOpen((prev) => !prev)}
                variant='ghost'
            >
                <Menu size={24} />
            </Button>
            <motion.nav
                animate={{
                    opacity: open ? 1 : 0,
                    translateY: open ? 0 : '-5rem',
                }}
                className={`absolute inset-0 w-screen top-14 z-20 bg-background flex flex-col items-center gap-4 ${open ? 'h-[calc(100vh-56px)]' : 'pointer-events-none'}`}
            >
                <ul className='w-full mt-4 flex flex-col gap-1 max-w-72 text-base font-semibold'>
                    {linkObject.map((link) => (
                        <NavigationLink key={link.label} link={link} />
                    ))}
                </ul>
            </motion.nav>
        </div>
    );
};
MobileNavigationMenu.displayName = 'MobileNavigationMenu';
export default MobileNavigationMenu;

const NavigationLink: FC<{ link: LinkObject }> = memo(({ link }) => {
    return (
        <li className='border-b border-muted w-72 h-10'>
            {link.href ?
                <Link
                    className={`flex items-center w-full h-full py-2 ${link.singular ? 'text-normal' : 'text-sm px-4'}`}
                    to={link.href}
                >
                    <span>{link.label}</span>
                </Link>
            : link.children ?
                <Collapsible>
                    <CollapsibleTrigger asChild className='w-full h-full'>
                        <Button className='m-0 p-0 text-base w-full h-10 justify-between mb-2' variant='ghost'>
                            {link.label}
                            <ChevronsUpDown className='h-4 w-4' />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className='flex flex-col gap-2 bg-background fixed z-50'>
                        <ul>
                            {link.children.map((child) => (
                                <NavigationLink key={child.label} link={{ ...child }} />
                            ))}
                        </ul>
                    </CollapsibleContent>
                </Collapsible>
            :   <Button
                    className={`flex items-center w-full h-full ${link.extra ? 'justify-between' : 'justify-start'}`}
                    variant='ghost'
                >
                    <span>{link.label}</span>
                    {link.extra}
                </Button>
            }
        </li>
    );
});
NavigationLink.displayName = 'NavigationLink';
