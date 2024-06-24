import type { MaterialInputProps } from './material.types';
import { memo, type FC, type ReactElement } from 'react';

const Module: FC<MaterialInputProps> = memo(({ change }): ReactElement => {
    return (
        <div>
            <p>Module</p>
            <p className='text-muted-foreground text-sm'>{JSON.stringify(change)}</p>
        </div>
    );
});
Module.displayName = 'Module';
export default Module;
