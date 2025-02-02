import { Platform } from 'react-native';

export const typography = {
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
  },
  
  // Predefined text styles
  variants: {
    h1: {
      fontSize: 48,
      lineHeight: 1.25,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 36,
      lineHeight: 1.25,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 30,
      lineHeight: 1.25,
      fontWeight: 'bold',
    },
    h4: {
      fontSize: 24,
      lineHeight: 1.25,
      fontWeight: 'bold',
    },
    h5: {
      fontSize: 20,
      lineHeight: 1.25,
      fontWeight: 'bold',
    },
    h6: {
      fontSize: 18,
      lineHeight: 1.25,
      fontWeight: 'bold',
    },
    body1: {
      fontSize: 16,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: 14,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      lineHeight: 1.5,
    },
    button: {
      fontSize: 14,
      lineHeight: 1.75,
      fontWeight: 'medium',
      textTransform: 'uppercase',
    },
  },
} as const;

export type Typography = typeof typography;
