import type { MaterialInputProps } from './material.types';
import { memo, type FC, type ReactElement } from 'react';

const Assignment: FC<MaterialInputProps> = memo(({ change }): ReactElement => {
    return (
        <div>
            <p>Assignment</p>
            <p className='text-muted-foreground text-sm'>{JSON.stringify(change)}</p>
        </div>
    );
});
Assignment.displayName = 'Assignment';
export default Assignment;
