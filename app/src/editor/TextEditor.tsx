import 'draft-js/dist/Draft.css';

import React, { FunctionComponent, MutableRefObject, useCallback, useEffect, useRef, useState, KeyboardEvent, FormEvent } from 'react';
import { Editor, EditorState, RichUtils, DraftEditorCommand, DraftHandleValue, ContentBlock } from 'draft-js';
import styled from 'styled-components';
import { DefaultButton, Dialog, DialogFooter, Dropdown, IconButton, IDropdownOption, IPalette, PrimaryButton, TextField, TooltipHost, useTheme } from '@fluentui/react';
import { exportEditorStateToHtmlString, exportEditorStateToMarkdownString, getEditorStateFromHtml, getEditorStateFromMarkdown } from './Parser';
import { addLink, applyBlockStyle, applyInlineStyle, removeLink } from './Helper';
import { useId } from '@fluentui/react-hooks';
import { customBlockQuoteStyle } from './CustomStyles';

interface IThemed {
    palette: IPalette;
}

const EditorContainer = styled.div<IThemed>`
    border: 1px solid ${(props) => props.palette.black};
    display: flex;
    flex: 1;
    flex-direction: column;
    max-width: inherit;
    overflow: hidden;
`;

const ToolbarContainer = styled.div<IThemed>`
    display: flex;
    margin: 5px;
    padding: 5px 0;
    border-bottom: 1px solid ${(props) => props.palette.black};
    align-items: center;
    flex-wrap: wrap;
`;

const ControlSection = styled.div`
    margin-right: 25px;
    display: flex;
    min-width: max-content;
`;

const EditorTextfieldWrapper = styled.div`
    padding: 15px;
    flex: 1;
    overflow: auto;
`;

export interface ITextEditor {
    /** The initial content as string. */
    initialContent?: string;
    /** The content type to import / export. */
    contentType: 'markdown' | 'html';
    /** Callback to execute when the value changes. */
    handleContentUpdate: (newContent: string) => void;
}

/**
 * Custom WYSIWYG editor based on draft-js.
 *
 * @param {ITextEditor} props The properties of the WYSIWYG editor.
 * @returns {FunctionComponent} The WYSIWYG editor component.
 */
export const TextEditor: FunctionComponent<ITextEditor> = (props) => {
    /** Access to the theme. */
    const theme = useTheme();
    /** The maximum allowed indent level for lists. */
    const maxIntend = 4;

    /** React state of the current draft-js editor state. */
    const [editorState, setEditorState] = useState(
        props.initialContent && props.contentType === 'markdown'
            ? getEditorStateFromMarkdown(props.initialContent)
            : props.initialContent && props.contentType === 'html'
                ? getEditorStateFromHtml(props.initialContent)
                : EditorState.createEmpty()
    );

    /** The currently selected heading type. */
    const [selectedHeading, setSelectedHeading] = useState<string | number>('paragraph');
    /** Whether the bold style is currently active or not. */
    const [isBoldActive, setIsBoldActive] = useState<boolean>(false);
    /** Whether the italic style is currently active or not. */
    const [isItalicActive, setIsItalicActive] = useState<boolean>(false);
    /** Whether the underline style is currently active or not. */
    const [isUnderlineActive, setIsUnderlineActive] = useState<boolean>(false);
    /** Whether the ordered list style is currently active or not. */
    const [isOrderedListActive, setIsOrderedListActive] = useState<boolean>(false);
    /** Whether the unordered list style is currently active or not. */
    const [isUnorderedListActive, setIsUnorderedListActive] = useState<boolean>(false);
    /** Whether the strike through style is currently active or not. */
    const [isStrikeThroughActive, setIsStrikeThroughActive] = useState<boolean>(false);
    /** Whether the blockquote style is currently active or not. */
    const [isBlockquoteActive, setIsBlockquoteActive] = useState<boolean>(false);
    /** Whether the code block style is currently active or not. */
    const [isCodeBlockActive, setIsCodeBlockActive] = useState<boolean>(false);

    /** The current value of the url input. */
    const [urlValue, setUrlValue] = useState<string>('');
    /** Whether the url input is visible or not. */
    const [isUrlInputVisible, setIsUrlInputVisible] = useState<boolean>(false);

    /** The unique identifier of the tooltip element for the bold styling button. */
    const boldTooltipId = useId();
    /** The unique identifier of the tooltip element for the italic styling button. */
    const italicTooltipId = useId();
    /** The unique identifier of the tooltip element for the underline styling button. */
    const underlineTooltipId = useId();
    /** The unique identifier of the tooltip element for the undo button. */
    const undoTooltipId = useId();
    /** The unique identifier of the tooltip element for the redo button. */
    const redoTooltipId = useId();

    /** Reference to the draft-js editor component. */
    const editorRef = useRef<Editor>();

    /** Options for the heading dropdown */
    const headingOptions: IDropdownOption[] = [
        { key: 'paragraph', text: 'Paragraph' },
        { key: 'header-one', text: 'Headline 1' },
        { key: 'header-two', text: 'Headline 2' },
        { key: 'header-three', text: 'Headline 3' },
    ];

    /**
     * Set the user input focus into the text editor.
     */
    const setFocusIntoEditor = () => {
        setTimeout(() => editorRef.current?.focus(), 0);
    };

    /** Handle editor state updates by calling the property callback. */
    useEffect(() => {
        let newContent = '';
        if (props.contentType === 'markdown') {
            newContent = exportEditorStateToMarkdownString(editorState);
        } else if (props.contentType === 'html') {
            newContent = exportEditorStateToHtmlString(editorState);
        }
        props.handleContentUpdate(newContent);
    }, [editorState, props]);

    /**
     * Handle keyboard shortcuts in the draft-js editor.
     *
     * @param {DraftEditorCommand} command The command to execute.
     * @param {EditorState} editorState The editor state to modify.
     * @returns {DraftHandleValue} The draft handle value.
     */
    const handleKeyCommand = useCallback((command: DraftEditorCommand, editorState: EditorState): DraftHandleValue => {
        if (command === 'backspace') {
            return 'not-handled';
        }
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            return 'handled';
        }
        return 'not-handled';
    }, []);

    /**
     * Handle what happens when the user presses the return key.
     *
     * @param {KeyboardEvent} event The occurred keyboard event.
     * @returns {DraftHandleValue} The draft handle value.
     */
    const handleReturn = useCallback(
        (event: KeyboardEvent): DraftHandleValue => {
            if (event.shiftKey) {
                setEditorState(RichUtils.insertSoftNewline(editorState));
                return 'handled';
            }
            return 'not-handled';
        },
        [editorState]
    );

    /**
     * Function to apply custom block styles.
     *
     * @param {ContentBlock} contentBlock The content block to format.
     * @returns {string} The CSS classes to apply.
     */
    const blockStyleFn = (contentBlock: ContentBlock): string => {
        const type = contentBlock.getType();
        if (type === 'blockquote') {
            return customBlockQuoteStyle;
        }
        return '';
    };

    /**
     * Handle what happens when the user press tab.
     *
     * @param {KeyboardEvent} event The occurred keyboard event.
     */
    const onTab = useCallback(
        (event: KeyboardEvent) => {
            setEditorState(RichUtils.onTab(event, editorState, maxIntend));
        },
        [editorState]
    );

    /**
     * Mouse down handler to apply BOLD style.
     */
    const onBoldMouseDown = () => {
        applyInlineStyle(editorState, setEditorState, 'BOLD');
        setFocusIntoEditor();
    };

    /**
     * Mouse down handler to apply ITALIC style.
     */
    const onItalicMouseDown = () => {
        applyInlineStyle(editorState, setEditorState, 'ITALIC');
        setFocusIntoEditor();
    };

    /**
     * Mouse down handler to apply UNDERLINE style.
     */
    const onUnderlineMouseDown = () => {
        applyInlineStyle(editorState, setEditorState, 'UNDERLINE');
        setFocusIntoEditor();
    };

    /**
     * Mouse down handler to apply UNDERLINE style.
     */
    const onStrikeThroughMouseDown = () => {
        applyInlineStyle(editorState, setEditorState, 'STRIKETHROUGH');
        setFocusIntoEditor();
    };

    /**
     * On change handler for the heading dropdown.
     * Applies the selected heading type to the current editor block.
     *
     * @param {FormEvent<HTMLDivElement>} _ The occurred form event.
     * @param {IDropdownOption | undefined} option The selected dropdown option.
     */
    const onHeadingChange = (_: FormEvent<HTMLDivElement>, option?: IDropdownOption | undefined) => {
        if (!option) {
            return;
        }
        let keyToSet = option.key;
        switch (option.key) {
            case 'paragraph':
                applyBlockStyle(editorState, setEditorState, 'paragraph');
                setFocusIntoEditor();
                break;
            case 'header-one':
                applyBlockStyle(editorState, setEditorState, 'header-one');
                setFocusIntoEditor();
                break;
            case 'header-two':
                applyBlockStyle(editorState, setEditorState, 'header-two');
                setFocusIntoEditor();
                break;
            case 'header-three':
                applyBlockStyle(editorState, setEditorState, 'header-three');
                setFocusIntoEditor();
                break;
            default:
                keyToSet = 'paragraph';
                break;
        }
        setSelectedHeading(keyToSet);
    };

    /** Handle changes in block type. */
    useEffect(() => {
        // Get the current inline style.
        const currentInlineStyle = editorState.getCurrentInlineStyle();
        // Activate states of applied styles.
        setIsBoldActive(currentInlineStyle.has('BOLD'));
        setIsItalicActive(currentInlineStyle.has('ITALIC'));
        setIsUnderlineActive(currentInlineStyle.has('UNDERLINE'));
        setIsStrikeThroughActive(currentInlineStyle.has('STRIKETHROUGH'));
        // Get the selection.
        const currentSelection = editorState.getSelection();
        // Get the anchor key.
        const anchorKey = currentSelection.getAnchorKey();
        // Get the current content.
        const currentContent = editorState.getCurrentContent();
        // Get the content block of the current content.
        const currentContentBlock = currentContent.getBlockForKey(anchorKey);
        const currentBlockType = currentContentBlock.getType();
        setIsUnorderedListActive(currentBlockType === 'unordered-list-item');
        setIsOrderedListActive(currentBlockType === 'ordered-list-item');
        setIsBlockquoteActive(currentBlockType === 'blockquote');
        setIsCodeBlockActive(currentBlockType === 'code-block');
        if (currentBlockType === 'unstyled') {
            setSelectedHeading('paragraph');
            return;
        }
        // Update the block type dropdown.
        setSelectedHeading(currentBlockType);
    }, [editorState]);

    return (
        <EditorContainer palette={theme.palette}>
            {/* @ts-expect-error: Ignore no children prop error. */}
            <Dialog hidden={!isUrlInputVisible} title="Insert Link">
                <TextField
                    hidden={!isUrlInputVisible}
                    value={urlValue}
                    onKeyDown={(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        if (event.key === 'Enter') {
                            addLink(editorState, setEditorState, urlValue);
                            setIsUrlInputVisible(false);
                            setUrlValue('');
                            setFocusIntoEditor();
                        }
                    }}
                    onChange={(_: FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string | undefined) => {
                        if (newValue || newValue === '') {
                            setUrlValue(newValue);
                        }
                    }}
                />
                {/* @ts-expect-error: Ignore no children prop error. */}
                <DialogFooter>
                    <PrimaryButton
                        text="Add Link"
                        onClick={(e) => {
                            e.preventDefault();
                            addLink(editorState, setEditorState, urlValue);
                            setIsUrlInputVisible(false);
                            setUrlValue('');
                            setFocusIntoEditor();
                        }}
                    />
                    <DefaultButton
                        text="Abort"
                        onClick={() => {
                            setIsUrlInputVisible(false);
                            setUrlValue('');
                        }}
                    />
                </DialogFooter>
            </Dialog>
            <ToolbarContainer palette={theme.palette}>
                <ControlSection>
                    <Dropdown styles={{ root: { minWidth: 150, maxWidth: 150 } }} options={headingOptions} selectedKey={selectedHeading} onChange={onHeadingChange} />
                </ControlSection>
                <ControlSection>
                    <TooltipHost
                        id={boldTooltipId}
                        content={
                            <>
                                <div>Ctrl + B</div>
                                <div>CMD + B</div>
                            </>
                        }
                    >
                        <IconButton
                            aria-describedby={boldTooltipId}
                            styles={{ root: { backgroundColor: isBoldActive ? theme.palette.neutralQuaternary : 'unset', marginRight: '5px', color: theme.palette.black } }}
                            iconProps={{ iconName: 'Bold' }}
                            onMouseDown={(event) => {
                                event.preventDefault();
                                onBoldMouseDown();
                            }}
                        />
                    </TooltipHost>
                    <TooltipHost
                        id={italicTooltipId}
                        content={
                            <>
                                <div>Ctrl + I</div>
                                <div>CMD + I</div>
                            </>
                        }
                    >
                        <IconButton
                            styles={{ root: { backgroundColor: isItalicActive ? theme.palette.neutralQuaternary : 'unset', marginRight: '5px', color: theme.palette.black } }}
                            iconProps={{ iconName: 'Italic' }}
                            onMouseDown={(event) => {
                                event.preventDefault();
                                onItalicMouseDown();
                            }}
                        />
                    </TooltipHost>
                    <TooltipHost
                        id={underlineTooltipId}
                        content={
                            <>
                                <div>Ctrl + U</div>
                                <div>CMD + U</div>
                            </>
                        }
                    >
                        <IconButton
                            styles={{ root: { backgroundColor: isUnderlineActive ? theme.palette.neutralQuaternary : 'unset', marginRight: '5px', color: theme.palette.black } }}
                            iconProps={{ iconName: 'Underline' }}
                            onMouseDown={(event) => {
                                event.preventDefault();
                                onUnderlineMouseDown();
                            }}
                        />
                    </TooltipHost>
                    <IconButton
                        styles={{ root: { backgroundColor: isStrikeThroughActive ? theme.palette.neutralQuaternary : 'unset', marginRight: '5px', color: theme.palette.black } }}
                        iconProps={{ iconName: 'Strikethrough' }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            onStrikeThroughMouseDown();
                        }}
                    />
                </ControlSection>
                <ControlSection>
                    <IconButton
                        styles={{ root: { backgroundColor: isUnorderedListActive ? theme.palette.neutralQuaternary : 'unset', marginRight: '5px', color: theme.palette.black } }}
                        iconProps={{ iconName: 'BulletedList' }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            applyBlockStyle(editorState, setEditorState, 'unordered-list-item');
                        }}
                    />
                    <IconButton
                        styles={{ root: { backgroundColor: isOrderedListActive ? theme.palette.neutralQuaternary : 'unset', marginRight: '5px', color: theme.palette.black } }}
                        iconProps={{ iconName: 'NumberedList' }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            applyBlockStyle(editorState, setEditorState, 'ordered-list-item');
                        }}
                    />
                    <IconButton
                        styles={{ root: { marginRight: '5px', color: theme.palette.black } }}
                        iconProps={{ iconName: 'DecreaseIndentLegacy' }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const e: any = { preventDefault: () => null, shiftKey: true };
                            setEditorState(RichUtils.onTab(e, editorState, maxIntend));
                        }}
                    />
                    <IconButton
                        styles={{ root: { marginRight: '5px', color: theme.palette.black } }}
                        iconProps={{ iconName: 'IncreaseIndentLegacy' }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const e: any = { preventDefault: () => null };
                            setEditorState(RichUtils.onTab(e, editorState, maxIntend));
                        }}
                    />
                </ControlSection>
                <ControlSection>
                    <IconButton
                        styles={{ root: { backgroundColor: isBlockquoteActive ? theme.palette.neutralQuaternary : 'unset', marginRight: '5px', color: theme.palette.black } }}
                        iconProps={{ iconName: 'RightDoubleQuote' }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            applyBlockStyle(editorState, setEditorState, 'blockquote');
                        }}
                    />
                    <IconButton
                        styles={{ root: { backgroundColor: isCodeBlockActive ? theme.palette.neutralQuaternary : 'unset', marginRight: '5px', color: theme.palette.black } }}
                        iconProps={{ iconName: 'Code' }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            applyBlockStyle(editorState, setEditorState, 'code-block');
                        }}
                    />
                </ControlSection>
                <ControlSection>
                    <IconButton
                        styles={{ root: { marginRight: '5px', color: theme.palette.black } }}
                        iconProps={{ iconName: 'AddLink' }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            setIsUrlInputVisible(true);
                        }}
                    />
                    <IconButton
                        styles={{ root: { marginRight: '5px', color: theme.palette.black } }}
                        iconProps={{ iconName: 'RemoveLink' }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            removeLink(editorState, setEditorState);
                        }}
                    />
                </ControlSection>
                <ControlSection>
                    <TooltipHost
                        id={undoTooltipId}
                        content={
                            <>
                                <div>Ctrl + Z</div>
                                <div>CMD + Z</div>
                            </>
                        }
                    >
                        <IconButton
                            styles={{ root: { marginRight: '5px', color: theme.palette.black } }}
                            iconProps={{ iconName: 'Undo' }}
                            onMouseDown={(event) => {
                                event.preventDefault();
                                setEditorState(EditorState.undo(editorState));
                            }}
                        />
                    </TooltipHost>
                    <TooltipHost
                        id={redoTooltipId}
                        content={
                            <>
                                <div>Ctrl + Y</div>
                                <div>CMD + Shift + Z</div>
                            </>
                        }
                    >
                        <IconButton
                            styles={{ root: { marginRight: '5px', color: theme.palette.black } }}
                            iconProps={{ iconName: 'Redo' }}
                            onMouseDown={(event) => {
                                event.preventDefault();
                                setEditorState(EditorState.redo(editorState));
                            }}
                        />
                    </TooltipHost>
                </ControlSection>
            </ToolbarContainer>
            <EditorTextfieldWrapper onClick={setFocusIntoEditor}>
                <Editor
                    handleReturn={handleReturn}
                    ref={editorRef as MutableRefObject<Editor>}
                    editorState={editorState}
                    onChange={setEditorState}
                    handleKeyCommand={handleKeyCommand}
                    onTab={onTab}
                    blockStyleFn={blockStyleFn}
                />
            </EditorTextfieldWrapper>
        </EditorContainer>
    );
};
