import { FC, ReactElement, useState } from 'react';
import { Settings, User as LucidUser, GraduationCap, RefreshCcw } from 'lucide-react';
import { User, UserRole } from '../../api/account.ts';
import { Button } from '../ui/Button.tsx';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuPortal,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '../ui/DropdownMenu.tsx';

const capitalizeRole = (role: UserRole): string => {
    if (role == UserRole.TA) {
        return 'TA';
    }

    return role.charAt(0).toUpperCase() + role.slice(1);
};

export interface FrontendUser extends User {
    simRole: UserRole;
}

export const ProfileDropdown: FC<User> = (initUser): ReactElement => {
    const hasRights = (role: UserRole, simRole: UserRole): boolean => {
        return role >= simRole;
    };

    const setSimRole = (role: UserRole): void => {
        setUser({
            ...user,
            simRole: role,
        });
    };

    const [user, setUser] = useState<FrontendUser>({
        ...initUser,
        simRole: initUser.role,
    });

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='profile'>{user.name}</Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className='w-56'>
                <DropdownMenuLabel>{user.id}</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <LucidUser className='mr-2 h-4 w-4' />
                        <span>Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <GraduationCap className='mr-2 h-4 w-4' />
                            <span>View as: {capitalizeRole(user.simRole)}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                {user.simRole !== UserRole.STUDENT && hasRights(user.role, UserRole.STUDENT) && (
                                    <DropdownMenuItem onClick={() => setSimRole(UserRole.STUDENT)}>
                                        <GraduationCap className='mr-2 h-4 w-4' />
                                        <span>Student</span>
                                    </DropdownMenuItem>
                                )}
                                {user.simRole !== UserRole.TA && hasRights(user.role, UserRole.TA) && (
                                    <DropdownMenuItem onClick={() => setSimRole(UserRole.TA)}>
                                        <GraduationCap className='mr-2 h-4 w-4' />
                                        <span>TA</span>
                                    </DropdownMenuItem>
                                )}
                                {user.simRole !== UserRole.TEACHER && hasRights(user.role, UserRole.TEACHER) && (
                                    <DropdownMenuItem onClick={() => setSimRole(UserRole.TEACHER)}>
                                        <GraduationCap className='mr-2 h-4 w-4' />
                                        <span>Teacher</span>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>

                    <DropdownMenuItem>
                        <RefreshCcw className='mr-2 h-4 w-4' />
                        <span>Resync</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        <Settings className='mr-2 h-4 w-4' />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
