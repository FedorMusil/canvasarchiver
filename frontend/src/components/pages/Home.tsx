import { FC, ReactElement } from 'react';
import { Section, getAllSections } from '../../api/section'; // Adjust the path as necessary
import { useQuery } from '@tanstack/react-query';

const Home: FC = (): ReactElement => {
    // const { data, isError, isLoading } = useQuery({
    //     queryKey: ['sections', 9012],
    //     queryFn: getSection,
    // });

    const { data, isError, isLoading } = useQuery({
        queryKey: ['sections'],
        queryFn: getAllSections,
    });

    return (
        <main>
            <h1 className='text-4xl font-bold'>All sections</h1>
            {isLoading && <div>Loading...</div>}
            {isError && <div>Error</div>}
            {/* {data && <div data-testid='home-account-data'>{JSON.stringify(data)}</div>} */}
            {data && (
                <div className="p-16 w-1/2">
                    <ul className="flex flex-wrap gap-4 justify-start">
                        {data.map((section: Section) => (
                            <li key={section.id} className="bg-gray-100 w-40 h-40 rounded-md p-3 hover:bg-red-200 border border-gray-300 flex-shrink-0">
                                <h3>Name: {section.name}</h3>
                                <p>Id: {section.id}</p>
                                {/* Render other properties as needed */}
                            </li>
                        ))}
                    </ul>
                </div>
            )}        
            </main>
    );
};
export default Home;
