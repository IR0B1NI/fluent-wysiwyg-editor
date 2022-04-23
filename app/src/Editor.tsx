import React, { FunctionComponent, useCallback, useEffect } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, DraftEditorCommand } from 'draft-js';
import styled from 'styled-components';
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js';
import 'draft-js/dist/Draft.css';

const EditorContainer = styled.div`
    border: 1px solid black;
    display: flex;
    flex-direction: column;
`;

const ToolbarContainer = styled.div`
    display: flex;
    background: gray;
    padding: 5px;
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
export const TextEditor = (props: ITextEditor) => {
    /** React state of the current draft-js editor state. */
    const [editorState, setEditorState] = React.useState(() => EditorState.createEmpty());

    /**
     * Convert a given markdown string into a new draft-js editor state.
     *
     * @param {string} markdownString The string representation of a markdown value.
     * @returns {EditorState} The editor state to use for the base draft-js WYSIWYG editor.
     */
    const getEditorStateFromMarkdown = (markdownString: string): EditorState => {
        const rawObject = markdownToDraft(markdownString);
        const contentState = convertFromRaw(rawObject);
        const editorState = new EditorState(contentState);
        return editorState;
    };

    /**
     * Convert a given draft-js editor state into a markdown string.
     *
     * @param {EditorState} editorState The draft-js WYSIWYG editor state.
     * @returns {string} The markdown string representation of the current draft-js WYSIWYG editor state.
     */
    const exportEditorStateToMarkdownString = (editorState: EditorState): string => {
        const draftContent = editorState.getCurrentContent();
        const rawDraftContent = convertToRaw(draftContent);
        const markdown = draftToMarkdown(rawDraftContent);
        return markdown;
    };

    /** Handle editor state updates by calling the property callback. */
    useEffect(() => {
        const newMarkdown = exportEditorStateToMarkdownString(editorState);
        props.handleContentUpdate(newMarkdown);
    }, [editorState, props]);

    /** Initialize the editor state using the markdown string property. */
    useEffect(() => {
        if (!props.initialMarkdownContent) {
            // If there is no initial value given, return.
            return;
        }
        // Get the editor state based on the given markdown property.
        const initialEditorState = getEditorStateFromMarkdown(props.initialMarkdownContent);
        // Store the new editor state.
        setEditorState(initialEditorState);
    }, [props.initialMarkdownContent]);

    /**
     * Handle keyboard shortcuts in the draft-js editor.
     *
     * @param {DraftEditorCommand} command The command to execute.
     * @param {EditorState} editorState The editor state to modify.
     */
    const handleKeyCommand = useCallback((command: DraftEditorCommand, editorState: EditorState) => {
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
                return;
            }
            const currentInlineStyle = editorState.getCurrentInlineStyle();
            if (currentInlineStyle.has(inlineStyle)) {
                // todo: remove
                console.log('remove');
            } else {
                //todo: add
                console.log('add');
            }
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

    return (
        <EditorContainer>
            <ToolbarContainer>
                <button onClick={onBoldClick}>BOLD</button>
                <button onClick={onItalicClick}>ITALIC</button>
            </ToolbarContainer>
            <Editor editorState={editorState} onChange={setEditorState} handleKeyCommand={handleKeyCommand} />
        </EditorContainer>
    );
};
