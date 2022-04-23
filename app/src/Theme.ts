import { ComponentsStyles, IFontStyles, IPalette, IRawStyle } from '@fluentui/react';

/**
 * The color palette for the theme.
 */
export const Palette: Partial<IPalette> = {
    themeDarker: '#004578',
    themeDark: '#005a9e',
    themeDarkAlt: '#106ebe',
    themePrimary: '#0078d4',
    themeSecondary: '#2b88d8',
    themeTertiary: '#71afe5',
    themeLight: '#c7e0f4',
    themeLighter: '#deecf9',
    themeLighterAlt: '#eff6fc',
    black: '#000000',
    blackTranslucent40: '',
    neutralDark: '#151515',
    neutralPrimary: '#000000',
    neutralPrimaryAlt: '#2f2f2f',
    neutralSecondary: '#373737',
    neutralSecondaryAlt: '',
    neutralTertiary: '#595959',
    neutralTertiaryAlt: '#c8c6c4',
    neutralQuaternary: '#d0d0d0',
    neutralQuaternaryAlt: '#dadada',
    neutralLight: '#eaeaea',
    neutralLighter: '#f4f4f4',
    neutralLighterAlt: '#f8f8f8',
    white: '#ffffff',
    red: '#930001',
    green: '#124c00',
};

/**
 * The fonts for the theme.
 */
export const Fonts: Partial<IFontStyles> = {
    // Control Icons
    small: {
        fontSize: '12px',
    },
    // Nav Menus, Labels
    medium: {
        fontSize: '14px',
    },
    // Icons
    mediumPlus: {
        fontSize: '16px',
    },
    // Modal Headlines
    large: {
        fontSize: '20px',
        fontWeight: 'regular',
    },
    // Main Headlines
    xxLarge: {
        fontSize: '30px',
        fontWeight: 'bold',
    },
};

/**
 * The default font style to use for theme.
 */
export const DefaultFontStyle: IRawStyle = {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontWeight: 'regular',
};

/**
 * Default styles for fluent ui components.
 *
 * @param {IPalette} palette The theme color palette.
 * @returns {ComponentsStyles} The default component styles.
 */
export const DefaultComponentStyles = (palette: Partial<IPalette>): ComponentsStyles => {
    return {
        Panel: {
            styles: {
                main: {
                    borderTopLeftRadius: 10,
                    borderBottomLeftRadius: 10,
                },
                scrollableContent: {
                    display: 'flex',
                    flexDirection: 'column',
                },
                overlay: {
                    cursor: 'unset',
                },
            },
        },
        MessageBar: {
            styles: {
                root: {
                    borderRadius: 4,
                    display: 'flex',
                    justifyContent: 'center',
                },
                innerText: {
                    paddingTop: 2,
                },
            },
        },
        DefaultButton: {
            styles: {
                root: {
                    borderRadius: 4,
                    color: palette.themeSecondary,
                    borderColor: palette.themeSecondary,
                },
                rootHovered: {
                    color: palette.themeSecondary,
                },
                rootPressed: {
                    color: palette.themeDarkAlt,
                },
            },
        },
        PrimaryButton: {
            styles: {
                root: {
                    borderRadius: 4,
                    color: palette.white,
                },
                rootHovered: {
                    color: palette.white,
                },
                rootPressed: {
                    color: palette.neutralLight,
                },
            },
        },
        Label: {
            styles: {
                root: {
                    fontSize: 12,
                },
            },
        },
    };
};
