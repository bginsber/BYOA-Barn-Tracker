import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Horse } from '../types';
import { blanketingService } from '../services/blanketingService';
import { Weather, weatherService } from '../services/weatherService';

interface Props {
  horse: Horse;
  location: {
    latitude: number;
    longitude: number;
  };
}

export const BlanketingCalculator: React.FC<Props> = ({ horse, location }) => {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);

  useEffect(() => {
    loadWeatherAndCalculate();
  }, [horse, location]);

  const loadWeatherAndCalculate = async () => {
    try {
      setLoading(true);
      const currentWeather = await weatherService.getCurrentWeather(
        location.latitude,
        location.longitude
      );
      setWeather(currentWeather);
      
      const result = blanketingService.calculateBlanketing(horse, currentWeather);
      setRecommendation(result);
    } catch (error) {
      console.error('Error calculating blanketing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Blanketing Recommendation</Text>
        
        <View style={styles.weatherInfo}>
          <Text style={styles.weatherText}>
            Current Temperature: {weather?.temperature}°F
          </Text>
          <Text style={styles.weatherText}>
            Conditions: {weather?.condition}
          </Text>
        </View>

        <View style={styles.recommendation}>
          <Text style={styles.recommendationText}>
            {recommendation?.blanketNeeded
              ? `Recommended Blanket: ${recommendation.blanketWeight}`
              : 'No blanket needed'}
          </Text>
        </View>

        <View style={styles.factors}>
          <Text style={styles.factorsTitle}>Factors Considered:</Text>
          {recommendation?.factors && (
            <>
              <Text style={styles.factor}>Age Factor: {recommendation.factors.age}</Text>
              <Text style={styles.factor}>Weight Factor: {recommendation.factors.weight}</Text>
              <Text style={styles.factor}>Coat Factor: {recommendation.factors.coat}</Text>
              <Text style={styles.factor}>Weather Factor: {recommendation.factors.weather}</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  weatherInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  weatherText: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 4,
  },
  recommendation: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  recommendationText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0284c7',
  },
  factors: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  factorsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
  },
  factor: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
}); 