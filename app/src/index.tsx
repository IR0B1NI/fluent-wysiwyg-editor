import React from 'react';
import ReactDOM from 'react-dom/client';
import { initializeIcons } from '@fluentui/react';
import App from './App';

// Initialize the fluent ui icons.
initializeIcons();
// Determine the root html element.
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
// Render the react app.
root.render(<App />);
