import { Dropdown, IDropdownOption } from '@fluentui/react';
import React, { useState } from 'react';
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

const AppHeadlineContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const MarkdownPreview = styled.textarea`
    display: flex;
    flex: 1;
    resize: none;
`;

const App = () => {
    /** The state of the current string content value. */
    const [stringContent, setStringContent] = useState<string>('');
    /** The currently selected content type key. */
    const [selectedContentType, setSelectedContentType] = useState<string | number>('markdown');

    /** Options for the content type dropdown. */
    const contentTypeDropdownOptions: IDropdownOption[] = [
        { key: 'markdown', text: 'Markdown' },
        { key: 'html', text: 'HTML' },
    ];

    return (
        <AppContainer>
            <ContentContainer>
                <AppHeadlineContainer>
                    <Dropdown
                        styles={{ root: { minWidth: 120, marginRight: 25 } }}
                        options={contentTypeDropdownOptions}
                        selectedKey={selectedContentType}
                        onChange={(_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption | undefined) => {
                            if (!option) {
                                return;
                            }
                            setSelectedContentType(option.key);
                        }}
                    />
                    <h2>Editor</h2>
                </AppHeadlineContainer>
                <SingleContentWrapper>
                    <TextEditor initialMarkdownContent={stringContent} handleContentUpdate={(newMarkdown: string) => setStringContent(newMarkdown)} />
                </SingleContentWrapper>
                <AppHeadlineContainer>
                    <h2>Generated Markdown</h2>
                </AppHeadlineContainer>
                <SingleContentWrapper>
                    <MarkdownPreview value={stringContent} readOnly />
                </SingleContentWrapper>
            </ContentContainer>
        </AppContainer>
    );
};

export default App;
