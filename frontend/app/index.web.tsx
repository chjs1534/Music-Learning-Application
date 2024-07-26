import React from "react";
// import { createRoot } from 'react-dom/client';
import ReactDOM from "react-dom/client";
import App from "./App";

// const rootElement = document.getElementById('root');
const rootElement = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

if (rootElement) {
    rootElement.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error('Root element not found');
}
