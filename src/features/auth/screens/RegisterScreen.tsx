import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types/navigation.types';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({
    displayName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const { register, loading } = useAuth();

  const validateForm = () => {
    if (!displayName.trim()) return 'Display name is required';
    if (!email.trim()) return 'Email is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleRegister = async () => {
    try {
      setFormError(null);
      setTouched({
        displayName: true,
        email: true,
        password: true,
        confirmPassword: true,
      });

      const error = validateForm();
      if (error) {
        setFormError(error);
        return;
      }

      await register({ email, password, displayName });
    } catch (error: any) {
      setFormError(error.message);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.header}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
      </View>

      <View style={styles.form}>
        <AuthInput
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          onBlur={() => setTouched(prev => ({ ...prev, displayName: true }))}
          placeholder="Enter your name"
          autoComplete="name"
          textContentType="name"
          autoCapitalize="words"
          error={!displayName.trim() && touched.displayName ? 'Display name is required' : undefined}
          touched={touched.displayName}
        />

        <AuthInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          error={!email.trim() && touched.email ? 'Email is required' : undefined}
          touched={touched.email}
        />

        <AuthInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
          placeholder="Create a password"
          secureTextEntry
          textContentType="newPassword"
          autoComplete="password-new"
          error={password.length < 6 && touched.password ? 'Password must be at least 6 characters' : undefined}
          touched={touched.password}
        />

        <AuthInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
          placeholder="Confirm your password"
          secureTextEntry
          textContentType="newPassword"
          autoComplete="password-new"
          error={password !== confirmPassword && touched.confirmPassword ? 'Passwords do not match' : undefined}
          touched={touched.confirmPassword}
        />

        {formError && (
          <Text style={styles.errorText}>{formError}</Text>
        )}

        <AuthButton
          title="Create account"
          onPress={handleRegister}
          loading={loading}
          style={styles.submitButton}
          size="large"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <AuthButton
          title="Sign in"
          onPress={() => navigation.navigate('Login')}
          variant="outline"
          style={styles.loginButton}
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
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    ...typography.variants.body2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  loginButton: {
    width: '100%',
  },
}); 