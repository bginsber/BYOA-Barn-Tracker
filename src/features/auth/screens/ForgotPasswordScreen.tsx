import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types/navigation.types';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const { resetPassword, loading } = useAuth();

  const handleResetPassword = async () => {
    try {
      setFormError(null);
      setTouched(true);
      
      if (!email.trim()) {
        setFormError('Email is required');
        return;
      }

      await resetPassword(email);
      Alert.alert(
        'Reset Link Sent',
        'Check your email for instructions to reset your password.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      setFormError(error.message);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.header}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>
      </View>

      <View style={styles.form}>
        <AuthInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          onBlur={() => setTouched(true)}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          error={!email.trim() && touched ? 'Email is required' : undefined}
          touched={touched}
        />

        {formError && (
          <Text style={styles.errorText}>{formError}</Text>
        )}

        <AuthButton
          title="Send reset link"
          onPress={handleResetPassword}
          loading={loading}
          style={styles.submitButton}
          size="large"
        />

        <AuthButton
          title="Back to sign in"
          onPress={() => navigation.navigate('Login')}
          variant="outline"
          style={styles.backButton}
          size="medium"
        />
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.variants.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.variants.body1,
    color: colors.text.secondary,
  },
  form: {
    marginBottom: spacing.xl,
  },
  errorText: {
    ...typography.variants.caption,
    color: colors.error.main,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  backButton: {
    marginTop: spacing.sm,
  },
}); 