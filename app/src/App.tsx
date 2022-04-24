import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { TextEditor } from './TextEditor';

const AppContainer = styled.div`
    display: flex;
    max-width: 100vw;
    max-height: 100vh;
    min-height: 100vh;
    min-width: 100vw;
`;

const ContentContainer = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 25px;
`;

const SingleContentWrapper = styled.div`
    display: flex;
    flex: 1;
`;

const AppHeadline = styled.h2`
    text-align: center;
`;

const MarkdownPreview = styled.textarea`
    display: flex;
    flex: 1;
    resize: none;
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
            <ContentContainer>
                <AppHeadline>Markdown Editor</AppHeadline>
                <SingleContentWrapper>
                    <TextEditor initialMarkdownContent={markdown} handleContentUpdate={(newMarkdown: string) => setMarkdown(newMarkdown)} />
                </SingleContentWrapper>
                <AppHeadline>Generated Markdown</AppHeadline>
                <SingleContentWrapper>
                    <MarkdownPreview value={markdown} readOnly />
                </SingleContentWrapper>
            </ContentContainer>
        </AppContainer>
    );
};

export default App;
