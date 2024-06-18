import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip';
import { memo, type FC, type ReactElement, type ReactNode } from 'react';

type TooltipWrapperProps = {
    children: ReactNode;
    tooltip: string;
};

const TooltipWrapper: FC<TooltipWrapperProps> = memo(({ children, tooltip }): ReactElement => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>{children}</TooltipTrigger>
                <TooltipContent side='bottom'>
                    <p>{tooltip}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
});
TooltipWrapper.displayName = 'TooltipWrapper';
export default TooltipWrapper;
