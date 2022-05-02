import { Dropdown, IconButton, IDropdownOption, PartialTheme, ThemeProvider } from '@fluentui/react';
import React, { useState } from 'react';
import styled from 'styled-components';
import { TextEditor } from './TextEditor';
import { DarkPalette, DefaultComponentStyles, DefaultFontStyle, Fonts, Palette } from './Theme';

const AppContainer = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 100vw;
    max-height: 100vh;
    min-height: 100vh;
    min-width: 100vw;
`;

const HeaderContainer = styled.div`
    display: flex;
    padding: 10px;
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

interface IMarkdownPreview {
    backgroundColor: string;
    color: string;
}

const MarkdownPreview = styled.textarea<IMarkdownPreview>`
    display: flex;
    flex: 1;
    resize: none;
    color: ${(props) => props.color};
    background-color: ${(props) => props.backgroundColor};
`;

const App = () => {
    /** The state of the current string content value. */
    const [stringContent, setStringContent] = useState<string>('');
    /** The currently selected content type key. */
    const [selectedContentType, setSelectedContentType] = useState<'markdown' | 'html'>('markdown');
    /** Whether the dark mode is enabled or not. */
    const [isDarkModeEnabled, setIsDarkModeEnabled] = useState<boolean>(false);

    // Build the fluent ui theme.
    const theme: PartialTheme = {
        palette: isDarkModeEnabled ? DarkPalette : Palette,
        defaultFontStyle: DefaultFontStyle,
        components: DefaultComponentStyles(Palette),
        fonts: Fonts,
    };

    /** Options for the content type dropdown. */
    const contentTypeDropdownOptions: IDropdownOption[] = [
        { key: 'markdown', text: 'Markdown' },
        { key: 'html', text: 'HTML' },
    ];

    return (
        <ThemeProvider theme={theme}>
            <AppContainer>
                <HeaderContainer>
                    <IconButton
                        styles={{ root: { marginLeft: 'auto' } }}
                        iconProps={{ iconName: isDarkModeEnabled ? 'ClearNight' : 'Sunny', styles: { root:  { color: theme.palette?.black } } }}
                        onClick={() => setIsDarkModeEnabled(!isDarkModeEnabled)}
                    />
                </HeaderContainer>
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
                                if (option.key === 'markdown' || option.key === 'html') {
                                    setSelectedContentType(option.key);
                                }
                            }}
                        />
                        <h2>Editor</h2>
                    </AppHeadlineContainer>
                    <SingleContentWrapper>
                        <TextEditor initialContent={stringContent} contentType={selectedContentType} handleContentUpdate={(newContent: string) => setStringContent(newContent)} />
                    </SingleContentWrapper>
                    <AppHeadlineContainer>
                        <h2>Generated {selectedContentType === 'markdown' ? 'Markdown' : 'HTML'}</h2>
                    </AppHeadlineContainer>
                    <SingleContentWrapper>
                        <MarkdownPreview color={theme.palette?.black ?? 'unset'} backgroundColor={theme.palette?.white ?? 'unset'} value={stringContent} readOnly />
                    </SingleContentWrapper>
                </ContentContainer>
            </AppContainer>
        </ThemeProvider>
    );
};

export default App;
