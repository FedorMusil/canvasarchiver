import App from './App.tsx';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './globals.css';

async function enableMocking() {
    if (import.meta.env.MODE !== 'development') return;

    const { worker } = await import('./mock/setupWorker.ts');
    return await worker.start({
        onUnhandledRequest: 'bypass',
    });
}

enableMocking().then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
});
