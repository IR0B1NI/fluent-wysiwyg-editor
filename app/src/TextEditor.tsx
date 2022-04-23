import React, { FunctionComponent, MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Editor, EditorState, RichUtils, DraftEditorCommand } from 'draft-js';
import styled from 'styled-components';
import { Dropdown, IconButton, IDropdownOption } from '@fluentui/react';
import 'draft-js/dist/Draft.css';
import { exportEditorStateToMarkdownString, getEditorStateFromMarkdown } from './MarkdownParser';

const EditorContainer = styled.div`
    border: 1px solid black;
    display: flex;
    flex-direction: column;
    min-height: 500px;
`;

const ToolbarContainer = styled.div`
    display: flex;
    margin: 5px;
    padding: 5px 0;
    border-bottom: 1px solid black;
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
    /** The initial content as markdown string. */
    initialMarkdownContent?: string;
    /** Callback to execute when the markdown value changes. */
    handleContentUpdate: (newMarkdownContent: string) => void;
}

/**
 * Custom WYSIWYG editor based on draft-js.
 *
 * @param {ITextEditor} props The properties of the WYSIWYG editor.
 * @returns {FunctionComponent} The WYSIWYG editor component.
 */
export const TextEditor: FunctionComponent<ITextEditor> = (props) => {
    /** React state of the current draft-js editor state. */
    const [editorState, setEditorState] = React.useState(props.initialMarkdownContent ? getEditorStateFromMarkdown(props.initialMarkdownContent) : EditorState.createEmpty());
    /** The currently selected heading type. */
    const [selectedHeading, setSelectedHeading] = useState<string | number>('paragraph');
    /** Reference to the draft-js editor component. */
    const editorRef = useRef<Editor>();

    /** Options for the heading dropdown */
    const headingOptions: IDropdownOption[] = [
        { key: 'paragraph', text: 'Paragraph' },
        { key: 'header-one', text: 'Headline 1' },
        { key: 'header-two', text: 'Headline 2' },
        { key: 'header-three', text: 'Headline 3' },
    ];

    /** Handle editor state updates by calling the property callback. */
    useEffect(() => {
        const newMarkdown = exportEditorStateToMarkdownString(editorState);
        props.handleContentUpdate(newMarkdown);
    }, [editorState, props]);

    /**
     * Handle keyboard shortcuts in the draft-js editor.
     *
     * @param {DraftEditorCommand} command The command to execute.
     * @param {EditorState} editorState The editor state to modify.
     */
    const handleKeyCommand = useCallback((command: DraftEditorCommand, editorState: EditorState) => {
        console.log(command);
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
                const currentInlineStyle = editorState.getCurrentInlineStyle();
                if (currentInlineStyle.has(inlineStyle)) {
                    // todo: remove
                    console.log('remove');
                } else {
                    //todo: add
                    console.log('add');
                }
            }
            // Move the users focus back into the editor input field.
            setTimeout(() => editorRef.current?.focus(), 1);
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
            setEditorState(RichUtils.toggleBlockType(editorState, blockStyle));
            // Move the users focus back into the editor input field.
            setTimeout(() => editorRef.current?.focus(), 100);
        },
        [editorState]
    );

    /**
     * Click handler to apply BOLD style.
     */
    const onBoldClick = useCallback(() => {
        applyInlineStyle('BOLD');
    }, [applyInlineStyle]);

    /**
     * Click handler to apply ITALIC style.
     */
    const onItalicClick = useCallback(() => {
        applyInlineStyle('ITALIC');
    }, [applyInlineStyle]);

    /**
     * Click handler to apply UNDERLINE style.
     */
    const onUnderlineClick = useCallback(() => {
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
        (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption | undefined) => {
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

    useEffect(() => {
        // Get the selection.
        const currentSelection = editorState.getSelection();
        // Get the anchor key.
        const anchorKey = currentSelection.getAnchorKey();
        // Get the current content.
        const currentContent = editorState.getCurrentContent();
        // Get the content block of the current content.
        const currentContentBlock = currentContent.getBlockForKey(anchorKey);
        const currentBlockType = currentContentBlock.getType();
        if (currentBlockType === 'unstyled') {
            applyBlockStyle('paragraph');
            return;
        }
        // Update the block type dropdown.
        setSelectedHeading(currentBlockType);
    }, [applyBlockStyle, editorState]);

    return (
        <EditorContainer>
            <ToolbarContainer>
                <ControlSection>
                    <Dropdown styles={{ root: { minWidth: 150, maxWidth: 150 } }} options={headingOptions} selectedKey={selectedHeading} onChange={onHeadingChange} />
                </ControlSection>
                <ControlSection>
                    <IconButton iconProps={{ iconName: 'Bold' }} onClick={onBoldClick} />
                    <IconButton iconProps={{ iconName: 'Italic' }} onClick={onItalicClick} />
                    <IconButton iconProps={{ iconName: 'Underline' }} onClick={onUnderlineClick} />
                </ControlSection>
            </ToolbarContainer>
            <EditorTextfieldWrapper onClick={() => editorRef.current?.focus()}>
                <Editor ref={editorRef as MutableRefObject<Editor>} editorState={editorState} onChange={setEditorState} handleKeyCommand={handleKeyCommand} />
            </EditorTextfieldWrapper>
        </EditorContainer>
    );
};
