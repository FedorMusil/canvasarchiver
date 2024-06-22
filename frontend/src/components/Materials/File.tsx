import type { MaterialInputProps } from './material.types';
import { memo, type FC, type ReactElement } from 'react';

const File: FC<MaterialInputProps> = memo(({ change }): ReactElement => {
    return (
        <div>
            <p>File</p>
            <p className='text-muted-foreground text-sm'>{JSON.stringify(change)}</p>
        </div>
    );
});
File.displayName = 'File';
export default File;
