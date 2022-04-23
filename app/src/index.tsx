import React from 'react';
import ReactDOM from 'react-dom/client';
import { initializeIcons, PartialTheme, ThemeProvider } from '@fluentui/react';
import App from './App';
import { DefaultComponentStyles, DefaultFontStyle, Fonts, Palette } from './Theme';

// Initialize the fluent ui icons.
initializeIcons();
// Build the fluent ui theme.
const theme: PartialTheme = {
    palette: Palette,
    defaultFontStyle: DefaultFontStyle,
    components: DefaultComponentStyles(Palette),
    fonts: Fonts,
};
// Determine the root html element.
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
// Render the react app.
root.render(
    <ThemeProvider theme={theme}>
        <App />
    </ThemeProvider>
);
