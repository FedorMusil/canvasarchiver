import type { MaterialInputProps } from './material.types';
import { memo, type FC, type ReactElement } from 'react';

const Quiz: FC<MaterialInputProps> = memo(({ change }): ReactElement => {
    return (
        <div>
            <p>Quiz</p>
            <p className='text-muted-foreground text-sm'>{JSON.stringify(change)}</p>
        </div>
    );
});
Quiz.displayName = 'Quiz';
export default Quiz;
