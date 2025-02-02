import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  Text,
  Animated,
  Platform,
} from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  touched?: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  error,
  touched,
  style,
  onFocus,
  onBlur,
  value,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [labelAnim] = useState(new Animated.Value(value ? 1 : 0));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    animateLabel(1);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!value) {
      animateLabel(0);
    }
    onBlur?.(e);
  };

  const animateLabel = (toValue: number) => {
    Animated.timing(labelAnim, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const labelStyle = {
    position: 'absolute' as const,
    left: spacing.inputPadding,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [spacing.inputPadding + 2, 6],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.text.secondary, colors.text.primary],
    }),
  };

  const showError = error && touched;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          showError && styles.inputContainerError,
          style,
        ]}
      >
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>
        <TextInput
          style={[
            styles.input,
            Platform.select({
              ios: styles.inputIOS,
              android: styles.inputAndroid,
            }),
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          placeholderTextColor={colors.text.hint}
          selectionColor={colors.primary.main}
          autoCapitalize="none"
          {...props}
        />
      </View>
      {showError && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.inputGap,
  },
  inputContainer: {
    height: spacing.inputHeight + spacing.sm,
    backgroundColor: colors.background.paper,
    borderRadius: spacing.cardBorderRadius,
    borderWidth: 1,
    borderColor: colors.gray[300],
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputContainerFocused: {
    borderColor: colors.primary.main,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputContainerError: {
    borderColor: colors.error.main,
  },
  label: {
    ...typography.variants.body2,
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    paddingHorizontal: spacing.inputPadding,
    paddingTop: spacing.lg + 4,
    paddingBottom: spacing.sm,
    ...typography.variants.body1,
  },
  inputIOS: {
    paddingTop: spacing.lg + 6,
  },
  inputAndroid: {
    paddingTop: spacing.lg + 4,
  },
  errorText: {
    ...typography.variants.caption,
    color: colors.error.main,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
}); 