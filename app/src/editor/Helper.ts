import { EditorState, RichUtils } from 'draft-js';
import { createEditorStateFromContent } from './Parser';

/**
 * Remove all links in the current selection.
 *
 * @param {EditorState} editorState The current editor state to modify.
 * @param {(editorState: EditorState) => void} setEditorState The callback to update the editor state.
 */
export const removeLink = (editorState: EditorState, setEditorState: (editorState: EditorState) => void) => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
        setEditorState(RichUtils.toggleLink(editorState, selection, null));
    }
};

/**
 * Add a link to the current selection.
 *
 * @param {EditorState} editorState The current editor state to modify.
 * @param {(editorState: EditorState) => void} setEditorState The callback to update the editor state.
 * @param {string} url The url to use to create the link.
 */
export const addLink = (editorState: EditorState, setEditorState: (editorState: EditorState) => void, url: string) => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', { url: url, target: '_blank' });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const selection = editorState.getSelection();
    let newState = RichUtils.toggleLink(editorState, selection, entityKey);
    if (!newState) {
        return;
    }
    newState = createEditorStateFromContent(newState.getCurrentContent());
    setEditorState(newState);
};

/**
 * General function to apply an inline style to the current draft-js editor state.
 *
 * @param {EditorState} editorState The current editor state to modify.
 * @param {(editorState: EditorState) => void} setEditorState The callback to update the editor state.
 * @param {string} inlineStyle The style name to apply.
 */
export const applyInlineStyle = (editorState: EditorState, setEditorState: (editorState: EditorState) => void, inlineStyle: string) => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
        setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
    } else {
        const newState = RichUtils.toggleInlineStyle(editorState, inlineStyle);
        if (newState) {
            setEditorState(newState);
        }
    }
};

/**
 * General function to apply a block style to the current draft-js editor state.
 *
 * @param {EditorState} editorState The current editor state to modify.
 * @param {(editorState: EditorState) => void} setEditorState The callback to update the editor state.
 * @param {string} blockStyle The style to apply to the current editor block
 */
export const applyBlockStyle = (editorState: EditorState, setEditorState: (editorState: EditorState) => void, blockStyle: string) => {
    // Toggle the block style.
    setEditorState(RichUtils.toggleBlockType(editorState, blockStyle));
};
