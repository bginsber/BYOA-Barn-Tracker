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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [formError, setFormError] = useState<string | null>(null);
  
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    try {
      setFormError(null);
      setTouched({ email: true, password: true });

      if (!email.trim()) {
        setFormError('Email is required');
        return;
      }
      if (!password) {
        setFormError('Password is required');
        return;
      }

      await login({ email, password });
    } catch (error: any) {
      setFormError(error.message);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>

      <View style={styles.form}>
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
          placeholder="Enter your password"
          secureTextEntry
          textContentType="password"
          autoComplete="password"
          error={!password && touched.password ? 'Password is required' : undefined}
          touched={touched.password}
        />

        {formError && (
          <Text style={styles.errorText}>{formError}</Text>
        )}

        <AuthButton
          title="Sign in"
          onPress={handleLogin}
          loading={loading}
          style={styles.submitButton}
          size="large"
        />

        <AuthButton
          title="Forgot password?"
          onPress={() => navigation.navigate('ForgotPassword')}
          variant="text"
          style={styles.forgotButton}
          size="medium"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <AuthButton
          title="Create account"
          onPress={() => navigation.navigate('Register')}
          variant="outline"
          style={styles.registerButton}
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
  forgotButton: {
    marginTop: spacing.sm,
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
  registerButton: {
    width: '100%',
  },
}); 