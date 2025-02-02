import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { SageWeatherHelper } from '../components/SageWeatherHelper';
import { useAuth } from '../hooks/useAuth';

export const SageScreen = () => {
  const { user } = useAuth();
  
  // TODO: Replace with actual horse data fetch
  const demoHorse = {
    id: '1',
    name: 'Demo Horse',
    age: 12,
    weight: 1000,
    hairLength: 'medium',
    coatCondition: 'normal'
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Sage</Text>
          <Text style={styles.subtitle}>Your Digital Barn Manager</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weather-Smart Blanketing</Text>
            <Text style={styles.description}>
              Get real-time blanketing recommendations based on current weather 
              conditions and your horse's specific needs.
            </Text>
            <SageWeatherHelper horse={demoHorse} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
}); 