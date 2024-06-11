// src/components/pages/CompareFields.tsx
import React, { useRef, useState } from 'react';
import LineNumberTextField from './LineNumberTextField';
import './CompareFields.css';

const CompareFields: React.FC = () => {
    const [leftText, setLeftText] = useState<string>('');
    const [rightText, setRightText] = useState<string>('');
    const leftScrollRef = useRef<HTMLTextAreaElement>(null);
    const rightScrollRef = useRef<HTMLTextAreaElement>(null);

    const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
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
        <div className="compare-fields-container">
            <LineNumberTextField
                ref={leftScrollRef}
                text={leftText}
                setText={setLeftText}
                syncScroll={syncScroll}
            />
            <LineNumberTextField
                ref={rightScrollRef}
                text={rightText}
                setText={setRightText}
                syncScroll={syncScroll}
            />
        </div>
    );
};

export default CompareFields;
