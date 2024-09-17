import React from 'react';
import ReactDOM from 'react-dom/client';
import {Main} from './Main.jsx';
import {BrowserRouter} from "react-router-dom";


setTimeout(() => renderIt());

const renderIt = () => {
    const root = ReactDOM.createRoot(
        document.getElementById('root') as HTMLElement
    );
    root.render(
            <React.StrictMode>
                <BrowserRouter>
                    <Main/>
                </BrowserRouter>
            </React.StrictMode>
    );
}

