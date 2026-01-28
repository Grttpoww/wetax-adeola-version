import 'styled-components'

// Old Colors
export const BACKGROUND_GRAY = '#e3e8e8'
export const COLOR_A_BASE = '#2F3779'
export const COLOR_B_BASE = 'rgb(202, 92, 128)'
export const COLOR_B_DARK = 'rgb(89, 23, 49)'
export const COLOR_C_BASE = '#31D8AC'
export const COLOR_C_DARK = '#31D8AC'
export const COLOR_C_LIGHT = '#31D8AC'
export const COLOR_D_BASE = '#9d6cad'
export const COLOR_D_DARK = '#875996'
export const COLOR_D_VERY_DARK = '#4d2959'
export const COLOR_E_BASE = '#3c86b7'
export const COLOR_E_DARK = '#3876a1'
export const COLOR_E_VERY_DARK = '#194f75'

export const PRIMARY_DARK = '#0070FF'
export const PRIMARY_MEDIUM = '#E5F1FF'
export const PRIMARY_LIGHT = '#E3EDFB'
export const BACKGROUND = '#F7F8FB'
export const BACKGROUND_MODAL = '#FDFFFF'
export const RED = '#FF9C8A'
export const GREEN = '#33C02B'
export const GRAY_TEXT = '#808080'
export const BLUE_TEXT = '#0F2153'
export const BORDER_GRAY = '#EFEFF0'
export const FADED_GRAY_TEXT = '#D6D9E4'
export const PURPLE_LIGHT = '#BEBEE4'

export const Colors = {
  BACKGROUND_GRAY,
  COLOR_A_BASE,
  COLOR_B_BASE,
  COLOR_B_DARK,
  COLOR_C_BASE,
  COLOR_C_DARK,
  COLOR_C_LIGHT,
  COLOR_D_BASE,
  COLOR_D_DARK,
  COLOR_D_VERY_DARK,
  COLOR_E_BASE,
  COLOR_E_DARK,
  COLOR_E_VERY_DARK,
  PRIMARY_DARK,
  PRIMARY_MEDIUM,
  PRIMARY_LIGHT,
  BACKGROUND,
  BACKGROUND_MODAL,
  RED,
  GREEN,
  GRAY_TEXT,
  BLUE_TEXT,
  BORDER_GRAY,
  FADED_GRAY_TEXT,
  PURPLE_LIGHT,
}

// New Colors

export const ColorSchemes = {
  light: {
    PRIMARY: '#1D2DBA',
    PRIMARY_MEDIUM: '#E5F1FF',
    PRIMARY_LIGHT: '#E3EDFB',
    BACKGROUND: '#f5f5f5',
    BACKGROUND_MODAL: '#F7F8FB',
    RED: '#cf2f23',
    GREEN: '#08c908',
    GRAY_TEXT: '#808080',
    TEXT: '#0F2153',
    ITEM_CONTAINER: '#FFFFFF',
    BORDER_GRAY: '#D8DADC',
    FADED_GRAY_TEXT: '#D6D9E4',
    PURPLE_LIGHT: '#BEBEE4',
    ICON_ACTIVE_LIGHT: '#E3EDFB',
    ICON_INACTIVE_LIGHT: '#E4E4E9',
    ICON_INACTIVE_DARK: '#C4C4CE',
    SCAFFOLD_TRIM: '#E3EDFB',
    DIVIDER: '#F6F6F9',
  },
  dark: {
    DIVIDER: '#242424',
    SCAFFOLD_TRIM: '#161617',
    ICON_ACTIVE_LIGHT: '#E3EDFB',
    ICON_INACTIVE_LIGHT: '#3F3F41',
    ICON_INACTIVE_DARK: '#C4C4CE',
    PRIMARY: '#1D2DBA',
    PRIMARY_MEDIUM: '#1A222F',
    PRIMARY_LIGHT: '#E3EDFB',
    BACKGROUND: '#000000',
    BACKGROUND_MODAL: '#242424',
    RED: '#F9104E',
    GREEN: '#08c908',
    ITEM_CONTAINER: '#161617',
    GRAY_TEXT: '#8E8E92',
    TEXT: '#F4F4F4',
    BORDER_GRAY: '#161617',
    FADED_GRAY_TEXT: '#3F3F41',
    PURPLE_LIGHT: '#BEBEE4',
  },
}

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: (typeof ColorSchemes)['light']
  }
}
