import React from 'react';
import ReactDOM from 'react-dom/client';
import { RpsGamePage } from './RpsGamePage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RpsGamePage />
    </React.StrictMode>,
);
