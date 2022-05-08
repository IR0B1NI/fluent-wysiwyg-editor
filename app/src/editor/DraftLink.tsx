import React, { FunctionComponent } from 'react';
import { ContentState } from 'draft-js';
import { ILinkStyles, Link } from '@fluentui/react';

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
    /** Styles for the fluent ui link. */
    const linkStyles: Partial<ILinkStyles> = {
        root: {
            cursor: 'pointer',
        },
    };

    /** Get url and link text. */
    const { url, linkText } = props.contentState.getEntity(props.entityKey).getData();

    /**
     * Callback to execute when the user press the link in editor edit mode.
     */
    const onLinkClick = () => {
        window?.open(url)?.focus();
    };

    return (
        <Link href={url} styles={linkStyles} onClick={onLinkClick}>
            {linkText || props.children}
        </Link>
    );
};
