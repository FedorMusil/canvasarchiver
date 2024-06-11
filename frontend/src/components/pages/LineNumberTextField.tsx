// src/components/pages/LineNumberTextField.tsx
import React, { forwardRef, useEffect, useRef } from 'react';
import './LineNumberTextField.css';

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
                    .map(lineNumber => `<div class="line-number">${lineNumber}</div>`)
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
            <div className="line-number-text-field">
                <div className="line-numbers" ref={lineNumbersRef}></div>
                <textarea
                    ref={ref}
                    className="text-area"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onScroll={handleScroll}
                />
            </div>
        );
    }
);

export default LineNumberTextField;
