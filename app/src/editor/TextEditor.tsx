import 'draft-js/dist/Draft.css';

import React, { FunctionComponent, MutableRefObject, useCallback, useEffect, useRef, useState, KeyboardEvent, FormEvent } from 'react';
import { Editor, EditorState, RichUtils, DraftEditorCommand, DraftHandleValue } from 'draft-js';
import styled from 'styled-components';
import { DefaultButton, Dialog, DialogFooter, Dropdown, IconButton, IDropdownOption, IPalette, PrimaryButton, TextField, useTheme } from '@fluentui/react';
import { createEditorStateFromContent, exportEditorStateToHtmlString, exportEditorStateToMarkdownString, getEditorStateFromHtml, getEditorStateFromMarkdown } from './Parser';

interface IThemed {
    palette: IPalette;
}

const EditorContainer = styled.div<IThemed>`
    border: 1px solid ${(props) => props.palette.black};
    display: flex;
    flex: 1;
    flex-direction: column;
`;

const ToolbarContainer = styled.div<IThemed>`
    display: flex;
    margin: 5px;
    padding: 5px 0;
    border-bottom: 1px solid ${(props) => props.palette.black};
    align-items: center;
`;

const ControlSection = styled.div`
    margin-right: 25px;
`;

const EditorTextfieldWrapper = styled.div`
    padding: 15px;
    flex: 1;
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
    const [editorState, setEditorState] = React.useState(
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
    /** The current value of the url input. */
    const [urlValue, setUrlValue] = useState<string>('');
    /** Whether the url input is visible or not. */
    const [isUrlInputVisible, setIsUrlInputVisible] = useState<boolean>(false);

    /** Reference to the draft-js editor component. */
    const editorRef = useRef<Editor>();

    /**
     * Add a link to the current selection.
     */
    const addLink = () => {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', { url: urlValue, target: '_blank' });
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const selection = editorState.getSelection();
        let newState = RichUtils.toggleLink(editorState, selection, entityKey);
        if (!newState) {
            return;
        }
        newState = createEditorStateFromContent(newState.getCurrentContent());
        setEditorState(newState);
        setIsUrlInputVisible(false);
        setUrlValue('');
        setTimeout(() => editorRef.current?.focus(), 0);
    };

    /**
     * Remove all links in the current selection.
     */
    const removeLink = () => {
        const selection = editorState.getSelection();
        if (!selection.isCollapsed()) {
            setEditorState(RichUtils.toggleLink(editorState, selection, null));
        }
    };

    /** Options for the heading dropdown */
    const headingOptions: IDropdownOption[] = [
        { key: 'paragraph', text: 'Paragraph' },
        { key: 'header-one', text: 'Headline 1' },
        { key: 'header-two', text: 'Headline 2' },
        { key: 'header-three', text: 'Headline 3' },
    ];

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
     * General function to apply an inline style to the current draft-js editor state.
     *
     * @param {string} inlineStyle The style name to apply.
     */
    const applyInlineStyle = useCallback(
        (inlineStyle: string) => {
            const selection = editorState.getSelection();
            if (!selection.isCollapsed()) {
                setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
            } else {
                const newState = RichUtils.toggleInlineStyle(editorState, inlineStyle);
                if (newState) {
                    setEditorState(newState);
                }
            }
            // Move the users focus back into the editor input field.
            setTimeout(() => editorRef.current?.focus(), 0);
        },
        [editorState]
    );

    /**
     * General function to apply a block style to the current draft-js editor state.
     *
     * @param {string} blockStyle The style to apply to the current editor block
     */
    const applyBlockStyle = useCallback(
        (blockStyle: string) => {
            // Toggle the block style.
            setEditorState(RichUtils.toggleBlockType(editorState, blockStyle));
            // Move the users focus back into the editor input field.
            setTimeout(() => editorRef.current?.focus(), 0);
        },
        [editorState]
    );

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
    const onBoldMouseDown = useCallback(() => {
        applyInlineStyle('BOLD');
    }, [applyInlineStyle]);

    /**
     * Mouse down handler to apply ITALIC style.
     */
    const onItalicMouseDown = useCallback(() => {
        applyInlineStyle('ITALIC');
    }, [applyInlineStyle]);

    /**
     * Mouse down handler to apply UNDERLINE style.
     */
    const onUnderlineMouseDown = useCallback(() => {
        applyInlineStyle('UNDERLINE');
    }, [applyInlineStyle]);

    /**
     * On change handler for the heading dropdown.
     * Applies the selected heading type to the current editor block.
     *
     * @param {React.FormEvent<HTMLDivElement>} _ The occurred form event.
     * @param {IDropdownOption | undefined} option The selected dropdown option.
     */
    const onHeadingChange = useCallback(
        (_: FormEvent<HTMLDivElement>, option?: IDropdownOption | undefined) => {
            if (!option) {
                return;
            }
            let keyToSet = option.key;
            switch (option.key) {
                case 'paragraph':
                    applyBlockStyle('paragraph');
                    break;
                case 'header-one':
                    applyBlockStyle('header-one');
                    break;
                case 'header-two':
                    applyBlockStyle('header-two');
                    break;
                case 'header-three':
                    applyBlockStyle('header-three');
                    break;
                default:
                    keyToSet = 'paragraph';
                    break;
            }
            setSelectedHeading(keyToSet);
        },
        [applyBlockStyle]
    );

    /** Handle changes in block type. */
    useEffect(() => {
        // Get the current inline style.
        const currentInlineStyle = editorState.getCurrentInlineStyle();
        // Activate states of applied styles.
        setIsBoldActive(currentInlineStyle.has('BOLD'));
        setIsItalicActive(currentInlineStyle.has('ITALIC'));
        setIsUnderlineActive(currentInlineStyle.has('UNDERLINE'));
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
        if (currentBlockType === 'unstyled') {
            setSelectedHeading('paragraph');
            return;
        }
        // Update the block type dropdown.
        setSelectedHeading(currentBlockType);
    }, [applyBlockStyle, editorState]);

    return (
        <EditorContainer palette={theme.palette}>
            {/* @ts-expect-error: Ignore no children prop error. */}
            <Dialog isOpen={isUrlInputVisible}>
                <TextField
                    hidden={!isUrlInputVisible}
                    value={urlValue}
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
                            addLink();
                            setIsUrlInputVisible(false);
                        }}
                    />
                    <DefaultButton text="Abort" onClick={() => setIsUrlInputVisible(false)} />
                </DialogFooter>
            </Dialog>
            <ToolbarContainer palette={theme.palette}>
                <ControlSection>
                    <Dropdown styles={{ root: { minWidth: 150, maxWidth: 150 } }} options={headingOptions} selectedKey={selectedHeading} onChange={onHeadingChange} />
                </ControlSection>
                <ControlSection>
                    <IconButton
                        styles={{ root: { backgroundColor: isBoldActive ? theme.palette.neutralQuaternary : 'unset', marginRight: '5px', color: theme.palette.black } }}
                        iconProps={{ iconName: 'Bold' }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            onBoldMouseDown();
                        }}
                    />
                    <IconButton
                        styles={{ root: { backgroundColor: isItalicActive ? theme.palette.neutralQuaternary : 'unset', marginRight: '5px', color: theme.palette.black } }}
                        iconProps={{ iconName: 'Italic' }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            onItalicMouseDown();
                        }}
                    />
                    <IconButton
                        styles={{ root: { backgroundColor: isUnderlineActive ? theme.palette.neutralQuaternary : 'unset', marginRight: '5px', color: theme.palette.black } }}
                        iconProps={{ iconName: 'Underline' }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            onUnderlineMouseDown();
                        }}
                    />
                </ControlSection>
                <ControlSection>
                    <IconButton
                        styles={{ root: { backgroundColor: isUnorderedListActive ? theme.palette.neutralQuaternary : 'unset', marginRight: '5px', color: theme.palette.black } }}
                        iconProps={{ iconName: 'BulletedList' }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            applyBlockStyle('unordered-list-item');
                        }}
                    />
                    <IconButton
                        styles={{ root: { backgroundColor: isOrderedListActive ? theme.palette.neutralQuaternary : 'unset', marginRight: '5px', color: theme.palette.black } }}
                        iconProps={{ iconName: 'NumberedList' }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            applyBlockStyle('ordered-list-item');
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
                            removeLink();
                        }}
                    />
                </ControlSection>
            </ToolbarContainer>
            <EditorTextfieldWrapper onClick={() => editorRef.current?.focus()}>
                <Editor
                    handleReturn={handleReturn}
                    ref={editorRef as MutableRefObject<Editor>}
                    editorState={editorState}
                    onChange={setEditorState}
                    handleKeyCommand={handleKeyCommand}
                    onTab={onTab}
                />
            </EditorTextfieldWrapper>
        </EditorContainer>
    );
};
