import { FC, ReactElement, useState } from 'react';
import {
    LogOut,
    Settings,
    User,
    GraduationCap,
    RefreshCcw,
} from "lucide-react"
import { Button } from "../ui/Button.tsx"
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
} from "../ui/DropdownMenu.tsx"

export enum Role {
    None,
    Student,
    TA,
    Teacher,
}

const roleToString = (role: Role): string => {
    return ['None', 'Student', 'TA', 'Teacher'][role];
}

export type Profile = {
    account: string;
    course: string;
    role: Role;
    simRole: Role;
}

export const ProfileDropdown: FC<Profile> = (initProfile): ReactElement => {
    const [profile, setProfile] = useState<Profile>(initProfile);

    const setSimRole = (role: Role): void => {
        setProfile({
            ...profile,
            simRole: role,
        });
    }

    const hasRights = (role: Role, simRole: Role): boolean => {
        return role >= simRole;
    }

    const handleLogout = (): void => {
        setProfile({
            account: '',
            course: '',
            role: Role.None,
            simRole: Role.None,
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="profile">{profile.account}</Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>{profile.account}</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <GraduationCap className="mr-2 h-4 w-4" />
                            <span>View as: {roleToString(profile.simRole)}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                {profile.simRole !== Role.Student && hasRights(profile.role, Role.Student) && (
                                    <DropdownMenuItem onClick={() => setSimRole(Role.Student)}>
                                    <GraduationCap className="mr-2 h-4 w-4" />
                                    <span>Student</span>
                                    </DropdownMenuItem>
                                )}
                                {profile.simRole !== Role.TA && hasRights(profile.role, Role.TA) && (
                                    <DropdownMenuItem onClick={() => setSimRole(Role.TA)}>
                                    <GraduationCap className="mr-2 h-4 w-4" />
                                    <span>TA</span>
                                    </DropdownMenuItem>
                                )}
                                {profile.simRole !== Role.Teacher && hasRights(profile.role, Role.Teacher) && (
                                    <DropdownMenuItem onClick={() => setSimRole(Role.Teacher)}>
                                    <GraduationCap className="mr-2 h-4 w-4" />
                                    <span>Teacher</span>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>

                    <DropdownMenuItem>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        <span>Resync</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
