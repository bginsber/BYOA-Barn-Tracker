import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task } from '../types';
import { weatherService } from '../services/weatherService';
import { locationService, LocationCoordinates } from '../services/locationService';

interface Props {
  task: Task;
  onUpdate: (update: Partial<Task>) => void;
  isBlanketingTask?: boolean;
}

interface WeatherConditions {
  noRain: boolean;
  maxTemp: number;
  minTemp: number;
  maxWindSpeed: number;
}

interface ScheduledTime {
  hour: number;
  minute: number;
  weatherDependent: boolean;
  weatherConditions: WeatherConditions;
}

const defaultWeatherConditions: WeatherConditions = {
  noRain: false,
  maxTemp: 0,
  minTemp: 0,
  maxWindSpeed: 0,
};

const defaultScheduledTime: ScheduledTime = {
  hour: 0,
  minute: 0,
  weatherDependent: false,
  weatherConditions: defaultWeatherConditions,
};

export const WeatherAwareScheduling: React.FC<Props> = ({ 
  task, 
  onUpdate,
  isBlanketingTask = false 
}) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const initializeLocation = async () => {
      setIsLoadingLocation(true);
      setLocationError(null);
      try {
        const coords = await locationService.getCurrentLocation();
        setLocation(coords);
        
        // Start watching for location updates
        locationService.startLocationUpdates((newLocation) => {
          setLocation(newLocation);
        });
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationError('Unable to get location. Weather-based features may be limited.');
      } finally {
        setIsLoadingLocation(false);
      }
    };

    initializeLocation();

    // Cleanup location subscription
    return () => {
      locationService.stopLocationUpdates();
    };
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!location) return;
      
      try {
        const weather = await weatherService.getCurrentWeather(location.latitude, location.longitude);
        setCurrentWeather(weather);
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };

    if (task.scheduledTime?.weatherDependent && location) {
      fetchWeather();
    }
  }, [task.scheduledTime?.weatherDependent, location]);

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const currentScheduled = task.scheduledTime ?? defaultScheduledTime;
      onUpdate({
        scheduledTime: {
          ...currentScheduled,
          hour: selectedTime.getHours(),
          minute: selectedTime.getMinutes(),
          weatherDependent: currentScheduled.weatherDependent,
          weatherConditions: currentScheduled.weatherConditions,
        },
      });
    }
  };

  const handleWeatherDependentToggle = (value: boolean) => {
    const currentScheduled = task.scheduledTime ?? defaultScheduledTime;
    onUpdate({
      scheduledTime: {
        ...currentScheduled,
        weatherDependent: value,
        weatherConditions: value ? currentScheduled.weatherConditions : defaultWeatherConditions,
      },
    });
  };

  const handleWeatherConditionChange = (key: keyof WeatherConditions, value: number | boolean) => {
    const currentScheduled = task.scheduledTime ?? defaultScheduledTime;
    const currentConditions = currentScheduled.weatherConditions ?? defaultWeatherConditions;
    
    onUpdate({
      scheduledTime: {
        ...currentScheduled,
        weatherConditions: {
          ...currentConditions,
          [key]: value,
        },
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weather-Aware Scheduling</Text>
        <View style={styles.card}>
          {isLoadingLocation ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Getting location...</Text>
            </View>
          ) : locationError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{locationError}</Text>
            </View>
          ) : (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Weather Dependent</Text>
                <Switch
                  testID="weatherDependentSwitch"
                  value={task.scheduledTime?.weatherDependent ?? false}
                  onValueChange={handleWeatherDependentToggle}
                />
              </View>

              {task.scheduledTime?.weatherDependent && (
                <View style={styles.weatherConditions}>
                  <View style={styles.row}>
                    <Text style={styles.label}>No Rain</Text>
                    <Switch
                      testID="noRainSwitch"
                      value={task.scheduledTime?.weatherConditions?.noRain ?? false}
                      onValueChange={(value) => handleWeatherConditionChange('noRain', value)}
                    />
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Temperature Range</Text>
                    <View style={styles.temperatureInputs}>
                      <TextInput
                        style={styles.tempInput}
                        value={String(task.scheduledTime?.weatherConditions?.minTemp ?? '')}
                        onChangeText={(value) => handleWeatherConditionChange('minTemp', Number(value) || 0)}
                        placeholder="Min °F"
                        keyboardType="numeric"
                      />
                      <Text style={styles.tempSeparator}>to</Text>
                      <TextInput
                        style={styles.tempInput}
                        value={String(task.scheduledTime?.weatherConditions?.maxTemp ?? '')}
                        onChangeText={(value) => handleWeatherConditionChange('maxTemp', Number(value) || 0)}
                        placeholder="Max °F"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {isBlanketingTask && (
                    <View style={styles.blanketingNote}>
                      <Text style={styles.noteText}>
                        Note: Temperature ranges will be adjusted based on horse's age, weight, and coat condition.
                      </Text>
                    </View>
                  )}

                  <View style={styles.row}>
                    <Text style={styles.label}>Max Wind Speed (mph)</Text>
                    <TextInput
                      style={[styles.tempInput, styles.windInput]}
                      value={String(task.scheduledTime?.weatherConditions?.maxWindSpeed ?? '')}
                      onChangeText={(value) => handleWeatherConditionChange('maxWindSpeed', Number(value) || 0)}
                      placeholder="Max mph"
                      keyboardType="numeric"
                    />
                  </View>

                  {currentWeather && (
                    <View style={styles.currentWeather}>
                      <Text style={styles.weatherTitle}>Current Conditions:</Text>
                      <Text style={styles.weatherText}>
                        Temperature: {currentWeather.temperature}°F
                      </Text>
                      <Text style={styles.weatherText}>
                        Conditions: {currentWeather.condition}
                      </Text>
                      <Text style={styles.weatherText}>
                        Wind Speed: {currentWeather.windSpeed} mph
                      </Text>
                    </View>
                  )}
                </View>
              )}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: '#4b5563',
  },
  weatherConditions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  temperatureInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 160,
  },
  tempInput: {
    width: 60,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    textAlign: 'center',
  },
  tempSeparator: {
    marginHorizontal: 8,
    color: '#6b7280',
  },
  windInput: {
    width: 80,
  },
  currentWeather: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  weatherTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  weatherText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  blanketingNote: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  noteText: {
    fontSize: 14,
    color: '#9a3412',
    lineHeight: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
}); 