import { FC, ReactElement } from 'react';
import CompareFields from '../comparison/CompareFields';

const Home: FC = (): ReactElement => {
    return (
        <main>
            <h1 className='text-4xl font-bold'>Home</h1>
            <CompareFields />
        </main>
    );
};
export default Home;
