import type { MaterialInputProps } from './material.types';
import { memo, type FC, type ReactElement } from 'react';

const Section: FC<MaterialInputProps> = memo(({ change }): ReactElement => {
    return (
        <div>
            <p>Section</p>
            <p className='text-muted-foreground text-sm'>{JSON.stringify(change)}</p>
        </div>
    );
});
Section.displayName = 'Section';
export default Section;
