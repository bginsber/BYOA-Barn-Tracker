export const colors = {
  // Primary colors
  primary: {
    light: '#6B8E4E',
    main: '#4A6934',
    dark: '#2C4D1C',
    contrast: '#FFFFFF',
  },
  
  // Secondary colors
  secondary: {
    light: '#B8860B',
    main: '#8B6914',
    dark: '#654321',
    contrast: '#FFFFFF',
  },
  
  // Semantic colors
  success: {
    light: '#4CAF50',
    main: '#2E7D32',
    dark: '#1B5E20',
  },
  error: {
    light: '#EF5350',
    main: '#D32F2F',
    dark: '#C62828',
  },
  warning: {
    light: '#FFB74D',
    main: '#F57C00',
    dark: '#E65100',
  },
  info: {
    light: '#4FC3F7',
    main: '#0288D1',
    dark: '#01579B',
  },
  
  // Grayscale
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Common colors
  common: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
  
  // Background
  background: {
    default: '#FFFFFF',
    paper: '#F5F5F5',
    dark: '#121212',
  },
  
  // Text
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#9E9E9E',
    hint: '#9E9E9E',
  },
} as const;

export type Colors = typeof colors;
