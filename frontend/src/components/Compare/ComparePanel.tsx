import AnnotationsFrame from '../Annotations/AnnotationsFrame';
import type { FC, ReactElement } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/src/components/ui/resizable';
import { useCompareWindowStore } from '@/src/stores/CompareWindowStore';
import { useShallow } from 'zustand/react/shallow';
import { useTheme } from 'next-themes';

const ComparePanel: FC = (): ReactElement => {
    const { theme } = useTheme();
    const cardBgColor = theme === 'light' ? 'hsl(0 0% 100%)' : 'hsl(24 9.8% 10%)';
    const textColor = theme === 'light' ? 'black' : 'white';

    // TODO: Change with actual difference.
    const diffBeforeHTML = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    body {
                        background-color: ${cardBgColor};
                    }

                    h1 {
                        color: ${textColor};
                    }
                </style>
            </head>
            <body>
                <h1>This is a placeholder for the before view.</h1>
            </body>
        </html>
    `;

    const diffAfterHTML = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    body {
                        background-color: ${cardBgColor};
                    }

                    h1 {
                        color: ${textColor};
                    }
                </style>
            </head>
            <body>
                <h1>This is a placeholder for the after view.</h1>
            </body>
        </html>
    `;

    const { openAnnotations, viewMode } = useCompareWindowStore(
        useShallow((state) => ({
            openAnnotations: state.openAnnotations,
            viewMode: state.viewMode,
        }))
    );

    return (
        <ResizablePanelGroup autoSaveId='compare-annotation' className='w-full flex-grow' direction='horizontal'>
            <ResizablePanel defaultSize={60} id='panel1' order={1}>
                <ResizablePanelGroup
                    autoSaveId='compare-panel'
                    className='w-full flex-grow'
                    direction={viewMode === 'vertical' ? 'vertical' : 'horizontal'}
                >
                    {viewMode !== 'after' && (
                        <ResizablePanel defaultSize={50} id='panel11' order={1}>
                            <iframe className='w-full h-full' srcDoc={diffBeforeHTML} title='before' />
                        </ResizablePanel>
                    )}
                    {viewMode !== 'after' && viewMode !== 'before' && <ResizableHandle withHandle />}
                    {viewMode !== 'before' && (
                        <ResizablePanel defaultSize={50} id='panel12' order={2}>
                            <iframe className='w-full h-full' srcDoc={diffAfterHTML} title='after' />
                        </ResizablePanel>
                    )}
                </ResizablePanelGroup>
            </ResizablePanel>
            {openAnnotations && (
                <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={40} id='panel2' order={2}>
                        <AnnotationsFrame />
                    </ResizablePanel>
                </>
            )}
        </ResizablePanelGroup>
    );
};
ComparePanel.displayName = 'ComparePanel';
export default ComparePanel;
