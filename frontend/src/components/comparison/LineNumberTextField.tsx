import { forwardRef, useEffect, useRef } from 'react';

interface LineNumberTextFieldProps {
    text: string;
    setText: (text: string) => void;
    syncScroll: (e: React.UIEvent<HTMLTextAreaElement>) => void;
}

const LineNumberTextField = forwardRef<HTMLTextAreaElement, LineNumberTextFieldProps>(
    ({ text, setText, syncScroll }, ref) => {
        const lineNumbersRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (lineNumbersRef.current) {
                const lines = text.split('\n').length;
                lineNumbersRef.current.innerHTML = Array.from({ length: lines }, (_, i) => i + 1)
                    .map((lineNumber) => `<div class="line-number">${lineNumber}</div>`)
                    .join('');
            }
        }, [text]);

        const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
            if (lineNumbersRef.current) {
                lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
            }
            syncScroll(e);
        };

        return (
            <div className='flex flex-1 border border-solid border-gray-200 overflow-hidden w-full h-1/2 second'>
                <div className='line-numbers' ref={lineNumbersRef}></div>
                <textarea
                    ref={ref}
                    className='border border-red-500 w-full'
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onScroll={handleScroll}
                />
            </div>
        );
    }
);

export default LineNumberTextField;
