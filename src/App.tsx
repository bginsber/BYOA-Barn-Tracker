import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './navigation/RootNavigator';
import { colors } from './theme/colors';

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <StatusBar style="auto" backgroundColor={colors.background.default} />
        <RootNavigator />
      </SafeAreaProvider>
    </NavigationContainer>
  );
} 