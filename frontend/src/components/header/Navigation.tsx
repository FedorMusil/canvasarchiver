
import { cn } from '@/src/lib/utils';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/src/components/ui/navigation-menu';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type FC, type ReactElement } from 'react';
import SettingsMenu from './SettingsMenu';

const materials: { title: string; href: string; description: string }[] = [
    {
        title: 'Sections',
        href: '/0',
        description: 'Subdivisions of a course, often used to separate different classes or study groups.',
    },
    {
        title: 'Modules',
        href: '/1',
        description: 'Organized collections of learning materials.',
    },
    {
        title: 'Pages',
        href: '/2',
        description: 'Web pages containing course content or information.',
    },
    {
        title: 'Files',
        href: '/3',
        description: 'Documents, images, or other files uploaded to the course.',
    },
    {
        title: 'Assignments',
        href: '/4',
        description: 'Tasks or projects to be completed by students.',
    },
    {
        title: 'Quizzes',
        href: '/5',
        description: 'Online tests or assessments.',
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
                    <NavigationMenuTrigger>Settings</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <SettingsMenu />
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
};
Navigation.displayName = 'Navigation';
export default Navigation;
