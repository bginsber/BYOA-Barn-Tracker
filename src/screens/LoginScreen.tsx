import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useAuth } from '../hooks/useAuth';

type AuthMode = 'login' | 'signup' | 'reset';

export const LoginScreen = () => {
  console.warn('LoginScreen rendering');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  const { signIn, signUp, resetPassword, error } = useAuth();

  const handleSubmit = async () => {
    switch (mode) {
      case 'login':
        await signIn(email, password);
        break;
      case 'signup':
        await signUp(email, password);
        break;
      case 'reset':
        await resetPassword(email);
        setMode('login');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === 'login' ? 'Welcome Back' : 
         mode === 'signup' ? 'Create Account' : 
         'Reset Password'}
      </Text>
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      {mode !== 'reset' && (
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>
          {mode === 'login' ? 'Login' : 
           mode === 'signup' ? 'Sign Up' : 
           'Reset Password'}
        </Text>
      </TouchableOpacity>

      <View style={styles.optionsContainer}>
        {mode === 'login' && (
          <>
            <TouchableOpacity onPress={() => setMode('signup')}>
              <Text style={styles.link}>Create Account</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode('reset')}>
              <Text style={styles.link}>Forgot Password?</Text>
            </TouchableOpacity>
          </>
        )}
        {(mode === 'signup' || mode === 'reset') && (
          <TouchableOpacity onPress={() => setMode('login')}>
            <Text style={styles.link}>Back to Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  optionsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen; 