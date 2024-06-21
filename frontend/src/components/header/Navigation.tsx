import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/src/components/ui/alert-dialog';
import { Button } from '@/src/components/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/src/components/ui/dialog';
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
import { cn } from '@/src/lib/utils';
import { Cog, Link, SunMoon } from 'lucide-react';
import {
    forwardRef,
    useCallback,
    type ComponentPropsWithoutRef,
    type ElementRef,
    type FC,
    type ReactElement,
} from 'react';
import ThemeSwitcher from '../ThemeSwitcher';
import { Input } from '../ui/input';

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
    const linkCourses = useCallback((): void => {
        // TODO: Create a function to link courses.
        return;
    }, []);

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
                    <NavigationMenuTrigger>Settings</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className='w-56 p-4'>
                            <li className='h-10'>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className='grid grid-cols-4 p-0 m-0 w-full h-full' variant='ghost'>
                                            <div className='col-span-1 w-full h-10 grid place-content-center'>
                                                <Link className='h-6 w-6 col-span-1' />
                                            </div>
                                            <div className='col-span-3 flex items-center justify-start'>
                                                <span>Link course</span>
                                            </div>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Link course</DialogTitle>
                                            <DialogDescription>
                                                <p>
                                                    If you want to link this course history to another course, enter the
                                                    course ID below.
                                                </p>
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className='grid gap-4 py-4'>
                                            <div className='grid grid-cols-4 items-center gap-4'>
                                                <Label htmlFor='courseID' className='text-right'>
                                                    Course ID
                                                </Label>
                                                <Input id='courseID' className='col-span-3' />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={linkCourses} type='submit'>
                                                Link courses
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </li>
                            <li className='h-10'>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
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
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Get the most recent course changes</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action will refresh the application and get the most recent course
                                                changes. It may take several minutes.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
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
