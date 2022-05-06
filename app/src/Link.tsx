import React, { FunctionComponent } from 'react';
import { ContentState } from 'draft-js';

export interface IDraftLinkProps {
    /** The children to render. */
    children: JSX.Element;
    /** The current editor content state. */
    contentState: ContentState;
    /** The entity key. */
    entityKey: string;
}

/**
 * Custom render component to display links in the draft js editor.
 *
 * @param {IDraftLinkProps} props The draft link properties.
 * @returns {FunctionComponent} The link component.
 */
export const DraftLink: FunctionComponent<IDraftLinkProps> = (props) => {
    /** Define link component styles. */
    const styles = {
        root: {
            fontFamily: "'Georgia', serif",
            padding: 20,
            width: 600,
        },
        buttons: {
            marginBottom: 10,
        },
        urlInputContainer: {
            marginBottom: 10,
        },
        urlInput: {
            fontFamily: "'Georgia', serif",
            marginRight: 10,
            padding: 3,
        },
        editor: {
            border: '1px solid #ccc',
            cursor: 'text',
            minHeight: 80,
            padding: 10,
        },
        button: {
            marginTop: 10,
            textAlign: 'center',
        },
        link: {
            color: '#3b5998',
            textDecoration: 'underline',
        },
    };
    /** Get url and link text. */
    const { url, linkText } = props.contentState.getEntity(props.entityKey).getData();
    return (
        <a href={url} style={styles.link}>
            {linkText || props.children}
        </a>
    );
};
