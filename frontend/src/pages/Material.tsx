import { ItemTypes } from '../api/change';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, type FC } from 'react';

export type RouteParams = {
    'material-id': string;
    'change-id'?: string;
};

const Material: FC = () => {
    const { 'material-id': materialId, 'change-id': changeId } = useParams<RouteParams>();

    const navigate = useNavigate();
    useEffect(() => {
        if (!materialId || +materialId < 0 || +materialId >= Object.values(ItemTypes).length) {
            navigate('/');
        }
    }, [materialId, navigate]);

    return (
        <>
            <p>You are on the {Object.values(ItemTypes)[+materialId!]} material.</p>
            <p>{changeId ? `You are viewing change ${changeId}` : 'You are not viewing a specific change'}</p>
        </>
    );
};
Material.displayName = 'Material';
export default Material;
