import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task } from '../types';

interface Props {
  task: Task;
  onUpdate: (update: Partial<Task>) => void;
}

const defaultScheduledTime = {
  hour: 0,
  minute: 0,
  weatherDependent: false,
  weatherConditions: {
    noRain: false,
    maxTemp: 0,
    minTemp: 0,
    maxWindSpeed: 0,
  },
};

export const WeatherAwareScheduling: React.FC<Props> = ({ task, onUpdate }) => {
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      onUpdate({
        scheduledTime: {
          ...task.scheduledTime,
          hour: selectedTime.getHours(),
          minute: selectedTime.getMinutes(),
        },
      });
    }
  };

  const handleWeatherDependentToggle = (value: boolean) => {
    const currentScheduled = task.scheduledTime ?? defaultScheduledTime;
    const newScheduled = {
      hour: currentScheduled.hour,
      minute: currentScheduled.minute,
      weatherDependent: value,
      weatherConditions: {
        noRain: currentScheduled.weatherConditions?.noRain ?? false,
        maxTemp: currentScheduled.weatherConditions?.maxTemp ?? 0,
        minTemp: currentScheduled.weatherConditions?.minTemp ?? 0,
        maxWindSpeed: currentScheduled.weatherConditions?.maxWindSpeed ?? 0,
      },
    };
    onUpdate({ scheduledTime: newScheduled });
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weather-Aware Scheduling</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Weather Dependent</Text>
            <Switch
              testID="weatherDependentSwitch"
              value={task.scheduledTime?.weatherDependent || false}
              onValueChange={handleWeatherDependentToggle}
            />
          </View>

          {task.scheduledTime?.weatherDependent && (
            <View style={styles.weatherConditions}>
              <View style={styles.row}>
                <Text style={styles.label}>No Rain</Text>
                <Switch
                  testID="noRainSwitch"
                  value={task.scheduledTime?.weatherConditions?.noRain || false}
                  onValueChange={(value) => {
                    const currentScheduled = task.scheduledTime ?? defaultScheduledTime;
                    const newScheduled = {
                      hour: currentScheduled.hour,
                      minute: currentScheduled.minute,
                      weatherDependent: currentScheduled.weatherDependent || false,
                      weatherConditions: {
                        noRain: value,
                        maxTemp: currentScheduled.weatherConditions?.maxTemp ?? 0,
                        minTemp: currentScheduled.weatherConditions?.minTemp ?? 0,
                        maxWindSpeed: currentScheduled.weatherConditions?.maxWindSpeed ?? 0,
                      },
                    };
                    onUpdate({ scheduledTime: newScheduled });
                  }}
                />
              </View>
              {/* Add more weather condition switches here using a similar pattern */}
            </View>
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
}); 