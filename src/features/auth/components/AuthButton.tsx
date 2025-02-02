import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  Text,
  ActivityIndicator,
  Platform,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';

interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
}

type ButtonStyleKey = keyof typeof buttonStyles;
type TextStyleKey = keyof typeof textStyles;

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  disabled,
  ...props
}) => {
  const getButtonStyleKey = (value: string): ButtonStyleKey => {
    return `${value.charAt(0).toUpperCase()}${value.slice(1)}` as ButtonStyleKey;
  };

  const getTextStyleKey = (value: string): TextStyleKey => {
    return `${value.charAt(0).toUpperCase()}${value.slice(1)}` as TextStyleKey;
  };

  const combinedButtonStyles = [
    buttonStyles.Base,
    buttonStyles[getButtonStyleKey(size)],
    buttonStyles[getButtonStyleKey(variant)],
    disabled && buttonStyles.Disabled,
    variant === 'text' && buttonStyles.Text,
    style,
  ];

  const combinedTextStyles = [
    textStyles.Base,
    textStyles[getTextStyleKey(size)],
    textStyles[getTextStyleKey(variant)],
    disabled && textStyles.Disabled,
  ];

  const getLoadingColor = () => {
    if (disabled) return colors.text.disabled;
    switch (variant) {
      case 'outline':
      case 'text':
        return colors.primary.main;
      default:
        return colors.primary.contrast;
    }
  };

  return (
    <TouchableOpacity
      style={combinedButtonStyles}
      disabled={disabled || loading}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={getLoadingColor()} size="small" />
        ) : (
          <Text style={combinedTextStyles}>{title}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  Base: {
    borderRadius: spacing.cardBorderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  } as ViewStyle,
  Small: {
    height: 32,
    paddingHorizontal: spacing.md,
  } as ViewStyle,
  Medium: {
    height: spacing.inputHeight,
    paddingHorizontal: spacing.lg,
  } as ViewStyle,
  Large: {
    height: spacing.inputHeight + spacing.sm,
    paddingHorizontal: spacing.xl,
  } as ViewStyle,
  Primary: {
    backgroundColor: colors.primary.main,
  } as ViewStyle,
  Secondary: {
    backgroundColor: colors.secondary.main,
  } as ViewStyle,
  Outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary.main,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  } as ViewStyle,
  Text: {
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  } as ViewStyle,
  Disabled: {
    backgroundColor: colors.gray[200],
    borderColor: colors.gray[200],
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  } as ViewStyle,
});

const textStyles = StyleSheet.create({
  Base: {
    ...typography.variants.button,
    textAlign: 'center',
  } as TextStyle,
  Small: {
    fontSize: 13,
  } as TextStyle,
  Medium: {
    fontSize: 14,
  } as TextStyle,
  Large: {
    fontSize: 16,
  } as TextStyle,
  Primary: {
    color: colors.primary.contrast,
  } as TextStyle,
  Secondary: {
    color: colors.secondary.contrast,
  } as TextStyle,
  Outline: {
    color: colors.primary.main,
  } as TextStyle,
  Text: {
    color: colors.primary.main,
  } as TextStyle,
  Disabled: {
    color: colors.text.disabled,
  } as TextStyle,
});

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
}); 