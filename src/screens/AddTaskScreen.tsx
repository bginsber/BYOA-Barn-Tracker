import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { taskService } from '../services/taskService';
import { useAuth } from '../hooks/useAuth';
import { Picker } from '@react-native-picker/picker';
import { WeatherAwareScheduling } from '../components/WeatherAwareScheduling';
import { BlanketingCalculator } from '../components/BlanketingCalculator';
import { TaskCategory, TaskFrequency, Horse, TaskPriority } from '../types';
import { locationService, LocationCoordinates } from '../services/locationService';

export default function AddTaskScreen() {
  const [taskName, setTaskName] = useState('');
  const [category, setCategory] = useState<TaskCategory>('grooming');
  const [frequency, setFrequency] = useState<TaskFrequency>('daily');
  const [description, setDescription] = useState('');
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [scheduledTime, setScheduledTime] = useState({
    hour: new Date().getHours(),
    minute: 0,
    weatherDependent: false,
    weatherConditions: {
      noRain: false,
      maxTemp: 0,
      minTemp: 0,
      maxWindSpeed: 0,
    },
  });

  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    const initializeLocation = async () => {
      const coords = await locationService.getCurrentLocation();
      setLocation(coords);
    };

    initializeLocation();
  }, []);

  const isBlanketingTask = taskName.toLowerCase().includes('blanket') || 
                          description.toLowerCase().includes('blanket');

  const handleAddTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create tasks');
      return;
    }

    try {
      const taskData = {
        title: taskName,
        category,
        frequency,
        description,
        priority: 'medium' as TaskPriority,
        completed: false,
        completionHistory: [],
        currentStreak: 0,
        bestStreak: 0,
        createdAt: Date.now(),
        userId: user.uid,
        scheduledTime,
      };

      // Only add horseDetails if we have a selected horse
      if (selectedHorse) {
        Object.assign(taskData, {
          horseDetails: {
            age: selectedHorse.age,
            weight: selectedHorse.weight,
            hairLength: selectedHorse.hairLength,
          },
        });
      }

      // Only add location if we have it
      if (location) {
        Object.assign(taskData, { location });
      }

      await taskService.createTask(taskData);
      navigation.goBack();
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };

  const handleScheduleUpdate = (update: any) => {
    setScheduledTime(prev => ({
      ...prev,
      ...update.scheduledTime,
    }));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Task Name</Text>
              <TextInput
                style={styles.input}
                value={taskName}
                onChangeText={setTaskName}
                placeholder="Enter task name"
                autoFocus
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add details about this task"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Settings</Text>
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={(value) => setCategory(value as TaskCategory)}
                  style={styles.picker}
                >
                  <Picker.Item label="🐎 Grooming" value="grooming" />
                  <Picker.Item label="🥕 Feeding" value="feeding" />
                  <Picker.Item label="💊 Medical" value="medical" />
                  <Picker.Item label="🔧 Maintenance" value="maintenance" />
                  <Picker.Item label="📝 Other" value="other" />
                </Picker>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Frequency</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={frequency}
                  onValueChange={(value) => setFrequency(value as TaskFrequency)}
                  style={styles.picker}
                >
                  <Picker.Item label="🔄 Daily" value="daily" />
                  <Picker.Item label="📅 Weekly" value="weekly" />
                  <Picker.Item label="📆 Monthly" value="monthly" />
                  <Picker.Item label="🗓 Annual" value="annual" />
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {isBlanketingTask && selectedHorse && location && (
          <BlanketingCalculator
            horse={selectedHorse}
            location={location}
          />
        )}

        <WeatherAwareScheduling
          task={{ scheduledTime } as any}
          onUpdate={handleScheduleUpdate}
          isBlanketingTask={isBlanketingTask}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleAddTask}
          >
            <Text style={styles.buttonText}>Create Task</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#1f2937',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  pickerContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 