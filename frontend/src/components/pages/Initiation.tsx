import { FC, ReactElement, useEffect } from 'react';
import { redirect } from 'react-router-dom';

const Initiation: FC = (): ReactElement => {
    useEffect(() => {
        redirect('/');
    }, []);

    return <p>Please wait, we are initializing the application...</p>;
};

export default Initiation;
