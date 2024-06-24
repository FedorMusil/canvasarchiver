import type { MaterialInputProps } from './material.types';
import { memo, type FC, type ReactElement } from 'react';

const Page: FC<MaterialInputProps> = memo(({ change }): ReactElement => {
    return (
        <div>
            <p>Page</p>
            <p className='text-muted-foreground text-sm'>{JSON.stringify(change)}</p>
        </div>
    );
});
Page.displayName = 'Page';
export default Page;
