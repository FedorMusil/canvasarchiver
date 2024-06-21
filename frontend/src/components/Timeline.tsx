import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/src/components/ui/drawer';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeftCircle, ChevronRightCircle, Eraser, Pencil, Plus } from 'lucide-react';
import { memo, useCallback, useState, type FC, type ReactElement } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ChangeType, type Change } from '../api/change';
import { useCompareIdContext } from '../stores/CompareIdStore/useCompareIdStore';
import { useCompareWindowStore } from '../stores/CompareWindowStore';
import { Button } from './ui/Button';

type TimelineProps = {
    changes: Change[];
};

const Timeline: FC<TimelineProps> = memo(({ changes }): ReactElement => {
    const { changeId, changeChangeId } = useCompareIdContext(
        useShallow((state) => ({ changeId: state.changeId, changeChangeId: state.changeChangeId }))
    );

    const index = changes.findIndex((change) => change.id === changeId);
    const pagesNeeded = Math.ceil(changes.length / 3);

    const [currentPage, setCurrentPage] = useState<number>(Math.floor(index / 3));
    const [selectedIndex, setSelectedIndex] = useState<number>(index);

    const typeToSvg = useCallback((type: ChangeType) => {
        switch (type) {
            case ChangeType.CREATE:
                return <Plus className='w-2 h-2' />;
            case ChangeType.UPDATE:
                return <Pencil className='w-2 h-2' />;
            case ChangeType.DELETE:
                return <Eraser className='w-2 h-2' />;
            default:
                return null;
        }
    }, []);

    return (
        <div className='flex justify-center items-center md:scale-150'>
            <Button
                aria-disabled={currentPage === 0}
                className='m-0 p-0'
                disabled={currentPage === 0}
                onClick={() => {
                    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
                }}
                variant='ghost'
            >
                <ChevronLeftCircle className='w-6 h-6 flex-shrink-0 stroke-foreground' />
            </Button>
            <div className='w-[300px] overflow-x-hidden h-20 flex justify-start items-center relative'>
                <motion.div
                    animate={{ translate: `${currentPage * -300}px` }}
                    className='h-1 bg-foreground/25 relative flex-shrink-0'
                    style={{ width: `${300 * pagesNeeded}px` }}
                >
                    {changes.map((change, index) => {
                        return (
                            <div
                                key={change.id}
                                className='absolute inset-0 flex flex-col justify-center w-fit items-center -translate-y-[10px] gap-1 z-20'
                                style={{ marginLeft: `${35 + 100 * index}px` }}
                            >
                                <div className='text-xs'>{format(new Date(change.timestamp), 'dd MMM')}</div>
                                <Button
                                    aria-disabled={selectedIndex === index}
                                    className={`p-0 m-0 w-5 h-5 border-2 ${
                                        selectedIndex === index ? 'border-primary' : 'border-foreground/25'
                                    } bg-background rounded-full flex-shrink-0 disabled:opacity-100 grid place-content-center`}
                                    disabled={selectedIndex === index}
                                    onClick={() => {
                                        setSelectedIndex(index);
                                        changeChangeId(change.id);
                                    }}
                                    variant='ghost'
                                    tabIndex={Math.floor(index / 3) === currentPage ? 0 : -1}
                                >
                                    {typeToSvg(change.change_type)}
                                </Button>
                            </div>
                        );
                    })}
                    <motion.div
                        animate={{ width: `${55 + 100 * selectedIndex}px` }}
                        className='absolute inset-0 h-1 bg-primary flex-shrink-0 z-10'
                    />
                </motion.div>
            </div>
            <Button
                aria-disabled={currentPage === pagesNeeded - 1}
                className='m-0 p-0'
                disabled={currentPage === pagesNeeded - 1}
                onClick={() => {
                    if (currentPage < pagesNeeded - 1) setCurrentPage((prev) => prev + 1);
                }}
                variant='ghost'
            >
                <ChevronRightCircle className='w-6 h-6 flex-shrink-0 stroke-foreground' />
            </Button>
        </div>
    );
});
Timeline.displayName = 'Timeline';

const TimelineDrawer: FC<TimelineProps> = memo(({ changes }): ReactElement => {
    const { openTimeline, setOpenTimeline } = useCompareWindowStore(
        useShallow((state) => ({
            openTimeline: state.openTimeline,
            setOpenTimeline: state.setOpenTimeline,
        }))
    );

    return (
        <Drawer open={openTimeline} onOpenChange={(open) => setOpenTimeline(open)}>
            <DrawerContent className='w-full'>
                <DrawerHeader className='flex justify-between'>
                    <div>
                        <DrawerTitle>Timeline</DrawerTitle>
                        <DrawerDescription>View the timeline of changes</DrawerDescription>
                    </div>
                    <DrawerClose asChild>
                        <Button onClick={() => setOpenTimeline(false)} variant='secondary'>
                            Close
                        </Button>
                    </DrawerClose>
                </DrawerHeader>
                <Timeline changes={changes} />
            </DrawerContent>
        </Drawer>
    );
});
TimelineDrawer.displayName = 'TimelineDrawer';
export default TimelineDrawer;
