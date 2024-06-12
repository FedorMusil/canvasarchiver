import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './globals.css';
import { allHandlers } from './mock/allHandlers.ts';

async function enableMocking() {
    if (import.meta.env.MODE !== 'mock' || typeof window === 'undefined') return;

    const { setupWorker } = await import('msw/browser');
    const browserWorker = setupWorker(...allHandlers);
    return await browserWorker.start({
        onUnhandledRequest: 'bypass',
    });
}

enableMocking()
    .then(() => {
        ReactDOM.createRoot(document.getElementById('root')!).render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    })
    .catch((error) => {
        console.error('Failed to enable mocking', error);
    });
