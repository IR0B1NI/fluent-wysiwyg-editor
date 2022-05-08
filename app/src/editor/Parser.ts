import { draftToMarkdown, DraftToMarkdownOptions, markdownToDraft, MarkdownToDraftOptions } from 'markdown-draft-js';
import { EditorState, convertToRaw, convertFromRaw, ContentState, ContentBlock, CompositeDecorator } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { stateFromHTML } from 'draft-js-import-html';
import { DraftLink } from './DraftLink';

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
 * Find all entities in the editor that are links.
 *
 * @param {ContentBlock} block The targeted block.
 * @param {() => void} callback The callback to execute.
 * @param {ContentState} contentState The current content state.
 */
const findLinkEntities = (block: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) => {
    block.findEntityRanges((character) => {
        const entityKey = character.getEntity();
        return entityKey !== null && contentState.getEntity(entityKey).getType() === 'LINK';
    }, callback);
};

/** Custom decorator for creating a draft js editor state. */
const decorator = new CompositeDecorator([
    {
        strategy: findLinkEntities,
        component: DraftLink,
    },
]);

/**
 * Convert a given markdown string into a new draft-js editor state.
 *
 * @param {string} markdownString The string representation of a markdown value.
 * @returns {EditorState} The editor state to use for the base draft-js WYSIWYG editor.
 */
export const getEditorStateFromMarkdown = (markdownString: string): EditorState => {
    const rawObject = markdownToDraft(markdownString, markdownToDraftOptions);
    const contentState = convertFromRaw(rawObject);
    const editorState = EditorState.createWithContent(contentState, decorator);
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

/**
 * Convert a given html string into a new draft-js editor state.
 *
 * @param {string} htmlString The string representation of a html value.
 * @returns {EditorState} The editor state to use for the base draft-js WYSIWYG editor.
 */
export const getEditorStateFromHtml = (htmlString: string): EditorState => {
    const contentState = stateFromHTML(htmlString);
    const editorState = EditorState.createWithContent(contentState, decorator);
    return editorState;
};

/**
 * Convert a given draft-js editor state into a markdown string.
 *
 * @param {EditorState} editorState The draft-js WYSIWYG editor state.
 * @returns {string} The html string representation of the current draft-js WYSIWYG editor state.
 */
export const exportEditorStateToHtmlString = (editorState: EditorState): string => {
    const draftContent = editorState.getCurrentContent();
    const html = stateToHTML(draftContent);
    return html;
};

/**
 * Create and return a new editor state based on given content state.
 *
 * @param {ContentState} contentState The content state to use.
 * @returns {EditorState} The created editor state.
 */
export const createEditorStateFromContent = (contentState: ContentState): EditorState => {
    return EditorState.createWithContent(contentState, decorator);
};
