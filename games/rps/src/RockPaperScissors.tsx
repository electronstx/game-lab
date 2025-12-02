import React from 'react';
import ReactDOM from 'react-dom/client';
import { RpsGameContainer } from './RpsGameContainer';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RpsGameContainer />
    </React.StrictMode>
);