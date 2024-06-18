import TooltipWrapper from '../TooltipWrapper';
import { Button } from '@/src/components/ui/Button';
import { ItemTypes } from '@/src/api/change';
import { PanelBottomClose, PanelBottomOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { useCompareIdContext } from '@/src/stores/CompareIdStore/useCompareIdStore';
import { useCompareWindowStore } from '@/src/stores/CompareWindowStore';
import { useShallow } from 'zustand/react/shallow';
import { type FC, type ReactElement, type SVGProps } from 'react';

const CompareHeader: FC = (): ReactElement => {
    const materialId = useCompareIdContext(useShallow((state) => state.materialId));

    return (
        <div className='w-full p-2 h-16 border-b-2 border-muted flex justify-between'>
            <h1 className='text-4xl flex-grow basis-0'>{Object.values(ItemTypes)[materialId]}</h1>
            <ViewModeTabs />
            <OpenWindowActionButtons />
        </div>
    );
};
CompareHeader.displayName = 'CompareHeader';
export default CompareHeader;

const OpenWindowActionButtons: FC = (): ReactElement => {
    const { openAnnotations, setOpenAnnotations, openTimeline, setOpenTimeline } = useCompareWindowStore(
        useShallow((state) => ({
            openAnnotations: state.openAnnotations,
            setOpenAnnotations: state.setOpenAnnotations,
            openTimeline: state.openTimeline,
            setOpenTimeline: state.setOpenTimeline,
        }))
    );

    return (
        <div className='flex justify-end gap-2 flex-grow basis-0'>
            <Button className='flex w-48' onClick={() => setOpenTimeline(!openTimeline)} variant='secondary'>
                {openTimeline ?
                    <PanelBottomClose className='w-5 h-5 mr-2' />
                :   <PanelBottomOpen className='w-5 h-5 mr-2' />}
                {openTimeline ? 'Close' : 'Open'} Timeline
            </Button>
            <Button className='flex w-48' onClick={() => setOpenAnnotations(!openAnnotations)} variant='secondary'>
                {openAnnotations ?
                    <PanelRightClose className='w-5 h-5 mr-2' />
                :   <PanelRightOpen className='w-5 h-5 mr-2' />}
                {openAnnotations ? 'Close' : 'Open'} Annotations
            </Button>
        </div>
    );
};
OpenWindowActionButtons.displayName = 'OpenWindowActionButtons';

const ViewModeTabs: FC = (): ReactElement => {
    const { viewMode, setViewMode } = useCompareWindowStore(
        useShallow((state) => ({
            viewMode: state.viewMode,
            setViewMode: state.setViewMode,
        }))
    );

    return (
        <Tabs value={viewMode} onValueChange={(newViewMode) => setViewMode(newViewMode as typeof viewMode)}>
            <TabsList className='grid grid-cols-4 w-full'>
                <TooltipWrapper tooltip='Horizontal view'>
                    <TabsTrigger value='horizontal'>
                        <HorizontalViewIcon className='w-5 h-5' />
                    </TabsTrigger>
                </TooltipWrapper>
                <TooltipWrapper tooltip='Vertical view'>
                    <TabsTrigger value='vertical'>
                        <HorizontalViewIcon className='w-5 h-5 rotate-90' />
                    </TabsTrigger>
                </TooltipWrapper>
                <TooltipWrapper tooltip='Before view'>
                    <TabsTrigger value='before'>
                        <BeforeViewIcon className='w-5 h-5' />
                    </TabsTrigger>
                </TooltipWrapper>
                <TooltipWrapper tooltip='After view'>
                    <TabsTrigger value='after'>
                        <AfterViewIcon className='w-5 h-5' />
                    </TabsTrigger>
                </TooltipWrapper>
            </TabsList>
        </Tabs>
    );
};
ViewModeTabs.displayName = 'ViewModeTabs';

// All icons below are created by react-md-editor (https://github.com/uiwjs/react-md-editor)
// -- A simple markdown editor with preview, implemented with React.js and TypeScript. --
// Retrieved on 2024-14-06
// License: MIT

type IconProps = SVGProps<SVGSVGElement>;

const BeforeViewIcon: FC<IconProps> = ({ ...props }): ReactElement => (
    <svg viewBox='0 0 520 520' {...props}>
        <polygon
            fill='currentColor'
            points='0 71.293 0 122 319 122 319 397 0 397 0 449.707 372 449.413 372 71.293'
        ></polygon>
        <polygon
            fill='currentColor'
            points='429 71.293 520 71.293 520 122 481 123 481 396 520 396 520 449.707 429 449.413'
        ></polygon>
    </svg>
);

const AfterViewIcon: FC<IconProps> = ({ ...props }): ReactElement => (
    <svg viewBox='0 0 520 520' {...props}>
        <polygon
            fill='currentColor'
            points='0 71.293 0 122 38.023 123 38.023 398 0 397 0 449.707 91.023 450.413 91.023 72.293'
        ></polygon>
        <polygon
            fill='currentColor'
            points='148.023 72.293 520 71.293 520 122 200.023 124 200.023 397 520 396 520 449.707 148.023 450.413'
        ></polygon>
    </svg>
);

const HorizontalViewIcon: FC<IconProps> = ({ ...props }): ReactElement => (
    <svg viewBox='0 0 520 520' {...props}>
        <polygon
            fill='currentColor'
            points='0 71.293 0 122 179 122 179 397 0 397 0 449.707 232 449.413 232 71.293'
        ></polygon>
        <polygon
            fill='currentColor'
            points='289 71.293 520 71.293 520 122 341 123 341 396 520 396 520 449.707 289 449.413'
        ></polygon>
    </svg>
);
