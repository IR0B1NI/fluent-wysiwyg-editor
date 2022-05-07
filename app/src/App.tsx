import { Dropdown, FontIcon, IDropdownOption, PartialTheme, ThemeProvider, Toggle, TooltipHost } from '@fluentui/react';
import { useId } from '@fluentui/react-hooks';
import React, { useState, MouseEvent, FormEvent, useEffect } from 'react';
import styled from 'styled-components';
import { TextEditor } from './editor/TextEditor';
import { DarkPalette, DefaultComponentStyles, DefaultFontStyle, Fonts, Palette } from './Theme';

const AppContainer = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 100vw;
    max-height: 100vh;
    min-height: 100vh;
    min-width: 1000px;
    overflow: hidden;
`;

const HeaderContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 10px;
`;

const ContentContainer = styled.div`
    display: flex;
    flex: 1;
    overflow: hidden;
`;

const SingleContentWrapper = styled.div`
    display: flex;
    flex: 1;
    overflow: hidden;
`;

const AppHeadlineContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ContentSectionContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 25px;
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
    /** The key to sore and load editor content from local storage. */
    const localStorageContentKey = 'stored-editor-content';
    /** The key to store and load the stored content type from the local storage. */
    const localStorageContentTypeKey = 'content-type';

    /** The state of the current string content value. */
    const [stringContent, setStringContent] = useState<string>();
    /** The currently selected content type key. */
    const [selectedContentType, setSelectedContentType] = useState<'markdown' | 'html'>('markdown');
    /** Whether the dark mode is enabled or not. */
    const [isDarkModeEnabled, setIsDarkModeEnabled] = useState<boolean>(false);

    /** The unique identifier for the dark mode toggle tooltip. */
    const darkModeToggleTooltipId = useId();

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

    /** Load possible stored content from local storage initially. */
    useEffect(() => {
        const storedContent = localStorage.getItem(localStorageContentKey);
        if (storedContent !== undefined && storedContent !== null) {
            const storedContentType = localStorage.getItem(localStorageContentTypeKey);
            if (storedContentType === 'markdown' || storedContentType === 'html') {
                setSelectedContentType(storedContentType);
                setStringContent(storedContent);
                return;
            }
        }
        setStringContent('');
    }, []);

    /** Store content state updates in the local storage. */
    useEffect(() => {
        localStorage.setItem(localStorageContentTypeKey, selectedContentType);
        if (stringContent !== undefined && stringContent !== null) {
            localStorage.setItem(localStorageContentKey, stringContent);
        }
    }, [selectedContentType, stringContent]);

    return (
        <ThemeProvider theme={theme}>
            <AppContainer>
                <HeaderContainer>
                    <FontIcon iconName={isDarkModeEnabled ? 'ClearNight' : 'Sunny'} />
                    <TooltipHost id={darkModeToggleTooltipId} content="Activate / Deactivate the dark mode.">
                        <Toggle
                            aria-describedby={darkModeToggleTooltipId}
                            styles={{ root: { marginBottom: 'unset', marginLeft: 10 } }}
                            checked={isDarkModeEnabled}
                            onChange={(_: MouseEvent, checked?: boolean | undefined) => {
                                if (checked) {
                                    setIsDarkModeEnabled(true);
                                } else {
                                    setIsDarkModeEnabled(false);
                                }
                            }}
                        />
                    </TooltipHost>
                </HeaderContainer>
                <ContentContainer>
                    {stringContent !== undefined && stringContent !== null && (
                        <ContentSectionContainer>
                            <AppHeadlineContainer>
                                <Dropdown
                                    styles={{ root: { minWidth: 120, marginRight: 25 } }}
                                    options={contentTypeDropdownOptions}
                                    selectedKey={selectedContentType}
                                    onChange={(_: FormEvent<HTMLDivElement>, option?: IDropdownOption | undefined) => {
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
                                <TextEditor
                                    initialContent={stringContent}
                                    contentType={selectedContentType}
                                    handleContentUpdate={(newContent: string) => setStringContent(newContent)}
                                />
                            </SingleContentWrapper>
                        </ContentSectionContainer>
                    )}
                    {stringContent !== undefined && stringContent !== null && (
                        <ContentSectionContainer>
                            <AppHeadlineContainer>
                                <h2>Generated {selectedContentType === 'markdown' ? 'Markdown' : 'HTML'}</h2>
                            </AppHeadlineContainer>
                            <SingleContentWrapper>
                                <MarkdownPreview color={theme.palette?.black ?? 'unset'} backgroundColor={theme.palette?.white ?? 'unset'} value={stringContent} readOnly />
                            </SingleContentWrapper>
                        </ContentSectionContainer>
                    )}
                </ContentContainer>
            </AppContainer>
        </ThemeProvider>
    );
};

export default App;
