import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

export const UserProfileButton = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  if (!user) return null;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => navigation.navigate('Profile' as never)}
    >
      <Text style={styles.text}>
        {user.email?.charAt(0).toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 