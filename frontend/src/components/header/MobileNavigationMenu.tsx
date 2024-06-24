import { Button } from '@/src/components/ui/Button';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

type LinkObject = { href?: string; label: string; children?: LinkObject[] };
const linkObject: LinkObject[] = [
    { href: '/', label: 'Home' },
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
        children: [{ label: 'Link Course' }, { label: 'Get latest changes' }, { label: 'Set Theme' }],
    },
];

export default function MobileNavigationMenu() {
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
                    {linkObject.map((link) =>
                        link.href ?
                            <li className='border-b border-muted w-72 h-10' key={link.href}>
                                <Link className='flex items-center w-full h-full' to={link.href}>
                                    <span>{link.label}</span>
                                </Link>
                            </li>
                        :   <li className='border-b border-muted w-72 h-10' key={link.label}>
                                <Button className='m-0 p-0 text-base w-full h-full justify-start' variant='ghost'>
                                    {link.label}
                                </Button>
                            </li>
                    )}
                </ul>
            </motion.nav>
        </div>
    );
}
