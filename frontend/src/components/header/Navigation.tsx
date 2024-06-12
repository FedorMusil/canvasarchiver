import ThemeSwitcher from '../ThemeSwitcher';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { Cog, SunMoon } from 'lucide-react';
import { Label } from '@/src/components/ui/label';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/src/components/ui/navigation-menu';
import {
    forwardRef,
    useCallback,
    type ComponentPropsWithoutRef,
    type ElementRef,
    type FC,
    type ReactElement,
} from 'react';

const materials: { title: string; href: string; description: string }[] = [
    {
        title: 'Assignments',
        href: '/1',
        description: 'Tasks or projects to be completed by students.',
    },
    {
        title: 'Modules',
        href: '/2',
        description: 'Organized collections of learning materials.',
    },
    {
        title: 'Quizzes',
        href: '/3',
        description: 'Online tests or assessments.',
    },
    {
        title: 'Folders',
        href: '/4',
        description: 'Digital containers for organizing files.',
    },
    {
        title: 'Sections',
        href: '/5',
        description: 'Subdivisions of a course, often used to separate different classes or study groups.',
    },
    {
        title: 'Pages',
        href: '/6',
        description: 'Web pages containing course content or information.',
    },
    {
        title: 'Rubrics',
        href: '/7',
        description: 'Guidelines for grading assignments or quizzes.',
    },
    {
        title: 'Under Development',
        href: '#',
        description: 'More material types are being added.',
    },
];

const NavListItem = forwardRef<ElementRef<'a'>, ComponentPropsWithoutRef<'a'>>(
    ({ className, title, children, ...props }, ref) => {
        return (
            <li>
                <NavigationMenuLink asChild>
                    <a
                        ref={ref}
                        className={cn(
                            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                            className
                        )}
                        {...props}
                    >
                        <div className='text-sm font-medium leading-none'>{title}</div>
                        <p className='line-clamp-2 text-sm leading-snug text-muted-foreground'>{children}</p>
                    </a>
                </NavigationMenuLink>
            </li>
        );
    }
);
NavListItem.displayName = 'NavListItem';

const Navigation: FC = (): ReactElement => {
    const refreshApp = useCallback((): void => {
        // TODO: Create a function to refresh the application.
        return;
    }, []);

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()} href='/'>
                        Home
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Course Materials</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className='grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] '>
                            {materials.map((material) => (
                                <NavListItem key={material.title} title={material.title} href={material.href}>
                                    {material.description}
                                </NavListItem>
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>User Settings</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className='w-56 p-4'>
                            <li className='h-10'>
                                <Button
                                    className='grid grid-cols-4 p-0 m-0 w-full h-full'
                                    onClick={refreshApp}
                                    variant='ghost'
                                >
                                    <div className='col-span-1 w-full h-10 grid place-content-center'>
                                        <Cog className='h-6 w-6 col-span-1' />
                                    </div>
                                    <div className='col-span-3 flex items-center justify-start'>
                                        <span>Refresh application</span>
                                    </div>
                                </Button>
                            </li>
                            <li className='h-10 grid grid-cols-4 place-content-center'>
                                <div className='col-span-1 w-full h-10 grid place-content-center'>
                                    <SunMoon className='h-6 w-6' />
                                </div>
                                <div className='col-span-2 flex items-center justify-start'>
                                    <Label htmlFor='set-theme'>Set theme</Label>
                                </div>
                                <div className='col-span-1 w-full h-full grid place-content-center'>
                                    <ThemeSwitcher id='set-theme' />
                                </div>
                            </li>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
};
Navigation.displayName = 'Navigation';
export default Navigation;
