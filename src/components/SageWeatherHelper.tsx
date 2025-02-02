import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import * as Notifications from 'expo-notifications';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Horse } from '../types';
import { weatherService } from '../services/weatherService';
import { locationService } from '../services/locationService';
import { blanketingService } from '../services/blanketingService';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

interface SageWeatherHelperProps {
  horse: Horse;
}

export const SageWeatherHelper: React.FC<SageWeatherHelperProps> = ({ horse }) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sageMessage, setSageMessage] = useState<string>('');
  const [recommendation, setRecommendation] = useState<{
    blanketNeeded: boolean;
    blanketWeight: 'none' | 'light' | 'medium' | 'heavy';
    factors?: any;
  } | null>(null);

  const generateSageResponse = async (weatherData: any, blanketingResult: any) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `
        You are Sage, a warm and knowledgeable digital barn manager with 25+ years of experience.
        Current weather: ${weatherData.temperature}°F
        Blanketing recommendation: ${blanketingResult.blanketNeeded ? blanketingResult.blanketWeight + ' blanket' : 'no blanket'}
        
        Please provide a brief, friendly recommendation about the horse's blanketing needs. 
        Be concise but warm, like an experienced barn manager. Keep it under 2 sentences.
        Include the temperature and recommendation naturally in your response.
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      setSageMessage(text);
    } catch (error) {
      console.error('Error generating Sage response:', error);
      // Fallback to basic message if Gemini fails
      setSageMessage(recommendation?.blanketNeeded 
        ? `Based on the current weather (${weather?.temperature}°F) and your horse's details, I recommend a ${recommendation.blanketWeight} blanket.`
        : `Your horse is comfortable right now—no blanket needed.`);
    }
  };

  useEffect(() => {
    const fetchLocationAndWeather = async () => {
      try {
        const coords = await locationService.getCurrentLocation();
        setLocation(coords);
        const weatherData = await weatherService.getCurrentWeather(coords.latitude, coords.longitude);
        setWeather(weatherData);
        const blanketingResult = blanketingService.calculateBlanketing(horse, weatherData);
        setRecommendation(blanketingResult);
        await generateSageResponse(weatherData, blanketingResult);
      } catch (error) {
        console.error('Error in fetching location/weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationAndWeather();
  }, [horse]);

  const handleScheduleNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Sage Reminder",
        body: "Check your horse's blanketing recommendation based on the current weather.",
      },
      trigger: {
        seconds: 5,
        repeats: false
      },
    });
    alert("Notification scheduled in 5 seconds.");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text>Loading Sage's Weather Helper...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sageMessage ? (
        <Text style={styles.adviceText}>
          {sageMessage}
        </Text>
      ) : (
        <Text style={styles.adviceText}>Sage couldn't determine a recommendation at this time.</Text>
      )}
      <View style={styles.buttonContainer}>
        <Button title="Remind Me" onPress={handleScheduleNotification} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16, 
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  adviceText: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonContainer: {
    marginTop: 8,
  },
}); 