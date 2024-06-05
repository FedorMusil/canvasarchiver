import { Role, Profile, ProfileDropdown } from './components/profile/ProfileDropdown';

function App() {
  const initialProfile: Profile = {
    account: 'John Doe',
    course: 'Computer Science',
    role: Role.Teacher,
    simRole: Role.Teacher,
  }

  return (
    <>
      <div className="flex justify-between items-center p-4">
        <div>bruh</div>
        <ProfileDropdown {...initialProfile} />
      </div>
      <div>Hello World!</div>
    </>
  );
}

export default App;
