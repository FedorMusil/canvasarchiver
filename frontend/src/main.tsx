import App from './App.tsx';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { worker } from './mock/setupWorker.ts';
import './globals.css';

if (import.meta.env.MODE === 'development') {
    worker.start();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
