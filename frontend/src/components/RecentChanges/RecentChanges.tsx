import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { columns } from './Columns';
import { DataTable } from './DataTable';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, type FC, type ReactElement } from 'react';
import { getRecentChanges, type Change } from '../../api/change';

const RecentChanges: FC = (): ReactElement => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['changes'],
        queryFn: getRecentChanges,
    });

    const [changes, setChanges] = useState<Change[]>([]);
    useEffect(() => {
        if (data) {
            // Sort changes by date
            const sortedChanges = data.sort((a, b) => {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });

            setChanges(sortedChanges);
        }
    }, [data]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading changes</div>;

    return (
        <Card className='w-full'>
            <CardHeader>
                <CardTitle>Recent changes</CardTitle>
                <CardDescription>
                    This week there has been {changes.length} change{changes.length > 1 && 's'} to the course.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={changes} />
            </CardContent>
        </Card>
    );
};
RecentChanges.displayName = 'RecentChanges';
export default RecentChanges;
