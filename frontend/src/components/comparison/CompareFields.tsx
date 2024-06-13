import { UIEvent, useRef, useState } from 'react';
import LineNumberTextField from './LineNumberTextField';

const CompareFields: React.FC = () => {
    const [leftText, setLeftText] = useState<string>('');
    const [rightText, setRightText] = useState<string>('');
    const leftScrollRef = useRef<HTMLTextAreaElement>(null);
    const rightScrollRef = useRef<HTMLTextAreaElement>(null);

    const syncScroll = (e: UIEvent<HTMLTextAreaElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        const scrollLeft = e.currentTarget.scrollLeft;
        if (leftScrollRef.current && rightScrollRef.current) {
            leftScrollRef.current.scrollTop = scrollTop;
            leftScrollRef.current.scrollLeft = scrollLeft;
            rightScrollRef.current.scrollTop = scrollTop;
            rightScrollRef.current.scrollLeft = scrollLeft;
        }
    };

    return (
        <div className='w-screen h-screen overflow-hidden relative'>
            <LineNumberTextField ref={leftScrollRef} text={leftText} setText={setLeftText} syncScroll={syncScroll} />
            <LineNumberTextField ref={rightScrollRef} text={rightText} setText={setRightText} syncScroll={syncScroll} />
        </div>
    );
};

export default CompareFields;
