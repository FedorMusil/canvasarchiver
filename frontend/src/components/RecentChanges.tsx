import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/src/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/src/components/ui/table';
import { useGlobalContext } from '@/src/stores/GlobalStore/useGlobalStore';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { memo, useCallback, useEffect, useState, type FC, type ReactElement } from 'react';
import { getRecentChanges, ItemTypes, type Change } from '../api/change';

const ChangeEntry: FC<Change> = memo((change): ReactElement => {
    const navigate = useNavigate();
    const handleDoubleClick = useCallback(() => {
        navigate(`/${Object.values(ItemTypes).indexOf(change.item_type)}/${change.id}`);
    }, [change.id, change.item_type, navigate]);

    return (
        <TableRow aria-label='Double click to view details' onDoubleClick={handleDoubleClick}>
            <TableCell>{change.item_type}</TableCell>
            <TableCell>{change.change_type}</TableCell>
            <TableCell>{new Date(change.change_date).toLocaleString()}</TableCell>
        </TableRow>
    );
});
ChangeEntry.displayName = 'ChangeEntry';

const RecentChanges: FC = (): ReactElement => {
    const { courseCode } = useGlobalContext((state) => ({
        courseCode: state.courseCode,
    }));

    const { data, isLoading, isError } = useQuery({
        queryKey: ['changes', courseCode],
        queryFn: getRecentChanges,
    });

    const [changes, setChanges] = useState<Change[]>([]);
    useEffect(() => {
        if (data) {
            // Sort changes by date
            const sortedChanges = data.sort((a, b) => {
                return new Date(b.change_date).getTime() - new Date(a.change_date).getTime();
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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course Material</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {changes.map((change) => (
                            <ChangeEntry key={change.id} {...change} />
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
RecentChanges.displayName = 'RecentChanges';
export default RecentChanges;
