import { useCallback, type FC, type ReactElement } from 'react';
import { Button } from '../ui/Button';
import { Cog, Link, SunMoon } from 'lucide-react';
import { Label } from '@/src/components/ui/label';
import ThemeSwitcher from '@/src/components/ThemeSwitcher';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';

const SettingsMenu: FC = (): ReactElement => {
    const linkCourse = useCallback((): void => {
        // TODO: Create a function to link the course.
        return;
    }, []);

    const refreshApp = useCallback((): void => {
        // TODO: Create a function to refresh the application.
        return;
    }, []);

    return (
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
                    <DialogContent className='sm:max-w-[425px]'>
                        <DialogHeader>
                            <DialogTitle>Link course</DialogTitle>
                            <DialogDescription>
                                You can link the change history from another course to this one, allowing you to import
                                changes. To do this, you'll need the course code from the other course.
                            </DialogDescription>
                        </DialogHeader>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <Label htmlFor='courseCode' className='text-right'>
                                Course code
                            </Label>
                            <Input id='courseCode' className='col-span-3' />
                        </div>
                        <DialogFooter>
                            <Button onClick={linkCourse} type='submit'>
                                Link courses
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </li>
            <li className='h-10'>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className='grid grid-cols-4 p-0 m-0 w-full h-full' onClick={refreshApp} variant='ghost'>
                            <div className='col-span-1 w-full h-10 grid place-content-center'>
                                <Cog className='h-6 w-6 col-span-1' />
                            </div>
                            <div className='col-span-3 flex items-center justify-start'>
                                <span>Get latest changes</span>
                            </div>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Get latest changes</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will get the latest changes from Canvas. It might take a few minutes. Do you
                                want to proceed?
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
    );
};
SettingsMenu.displayName = 'SettingsMenu';
export default SettingsMenu;
