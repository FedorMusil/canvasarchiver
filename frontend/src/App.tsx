import { useState } from 'react';
import {
  LogOut,
  Settings,
  User,
  GraduationCap,
} from "lucide-react"
import { Button } from "./components/ui/Button.tsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/DropdownMenu.tsx"

type Profile = {
  account: string;
  course: string;
  role: string;
}

function ProfileDropdown(profile: Profile) {
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
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <GraduationCap className="mr-2 h-4 w-4" />
            <span>Role: {profile.role}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function App() {
  const [profile, setProfile] = useState<Profile>({
    account: 'John Doe',
    course: 'Computer Science',
    role: 'Student',
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    setProfile({
      account: '',
      course: '',
      role: '',
    });
  }

  return (
    <>
      <div className="flex justify-between items-center p-4">
        <div>bruh</div>
        <ProfileDropdown {...profile} />
      </div>
      <div>Hello World!</div>
    </>
  );
}

export default App;
