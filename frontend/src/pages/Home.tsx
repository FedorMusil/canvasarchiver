import { exampleUsers } from '@/src/mock/self-mock';
import { FC, ReactElement } from 'react';

const Home: FC = (): ReactElement => {
    // TODO: Get the course code and user data dynamically.
    const courseCode = '5062PRSE5Y';
    const user = exampleUsers[Math.floor(Math.random() * exampleUsers.length)];

    return (
        <main>
            <h1 className='text-4xl font-bold'>Home</h1>
        </main>
    );
};
export default Home;
