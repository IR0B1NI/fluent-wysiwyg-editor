import { draftToMarkdown, DraftToMarkdownOptions, markdownToDraft, MarkdownToDraftOptions } from 'markdown-draft-js';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';

/** Custom options to convert draft to markdown. */
const draftToMarkdownOptions: DraftToMarkdownOptions = {
    styleItems: {
        UNDERLINE: {
            open: function open() {
                return '++';
            },
            close: function close() {
                return '++';
            },
        },
    },
};

/** Custom options to convert markdown to draft. */
const markdownToDraftOptions: MarkdownToDraftOptions = {
    blockStyles: {
        ins_open: 'UNDERLINE',
    },
    remarkableOptions: {
        enable: {
            inline: 'ins',
        },
    },
};

/**
 * Convert a given markdown string into a new draft-js editor state.
 *
 * @param {string} markdownString The string representation of a markdown value.
 * @returns {EditorState} The editor state to use for the base draft-js WYSIWYG editor.
 */
export const getEditorStateFromMarkdown = (markdownString: string): EditorState => {
    const rawObject = markdownToDraft(markdownString, markdownToDraftOptions);
    const contentState = convertFromRaw(rawObject);
    const editorState = EditorState.createWithContent(contentState);
    return editorState;
};

/**
 * Convert a given draft-js editor state into a markdown string.
 *
 * @param {EditorState} editorState The draft-js WYSIWYG editor state.
 * @returns {string} The markdown string representation of the current draft-js WYSIWYG editor state.
 */
export const exportEditorStateToMarkdownString = (editorState: EditorState): string => {
    const draftContent = editorState.getCurrentContent();
    const rawDraftContent = convertToRaw(draftContent);
    const markdown = draftToMarkdown(rawDraftContent, draftToMarkdownOptions);
    return markdown;
};
