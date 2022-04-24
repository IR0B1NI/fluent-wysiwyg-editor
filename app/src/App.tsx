import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { TextEditor } from './TextEditor';

const AppContainer = styled.div`
    display: flex;
    flex: 1;
    max-width: 100%;
    max-height: 100%;
    padding: 25px;
    flex-direction: column;
`;

const App = () => {
    /** The state of the current markdown content value. */
    const [markdown, setMarkdown] = useState<string>('');

    /** Handle updates on the markdown content value. */
    useEffect(() => {
        console.log(markdown);
    }, [markdown]);

    return (
        <AppContainer>
            <h2>Markdown WYSIWYG:</h2>
            <TextEditor initialMarkdownContent={markdown} handleContentUpdate={(newMarkdown: string) => setMarkdown(newMarkdown)} />
        </AppContainer>
    );
};

export default App;
