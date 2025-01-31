import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Task
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TaskCategory, TaskFrequency } from '../types';
import { taskService } from '../services/taskService';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { WeatherAwareScheduling } from '../components/WeatherAwareScheduling';
import { TaskDocumentation } from '../components/TaskDocumentation';

type Props = NativeStackScreenProps<RootStackParamList, 'EditTask'>;

export const EditTaskScreen: React.FC<Props> = ({ route, navigation }) => {
  const { task } = route.params;
  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState(task.category);
  const [frequency, setFrequency] = useState(task.frequency);
  const [description, setDescription] = useState(task.description || '');

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Task name is required');
      return;
    }

    try {
      await taskService.updateTask(task.id, {
        title,
        category,
        frequency,
        description,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await taskService.deleteTask(task.id);
              navigation.navigate('Home');
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const handleTaskUpdate = async (updates: Partial<Task>) => {
    try {
      // Create a new task object with the updates
      const updatedTask = {
        ...task,
        ...updates,
        // Ensure scheduledTime is properly merged
        scheduledTime: 'scheduledTime' in updates ? {
          ...task.scheduledTime,
          ...(updates as any).scheduledTime,
        } : task.scheduledTime,
      };

      // Update local state if needed
      setTitle(updatedTask.title || title);
      setCategory(updatedTask.category || category);
      setFrequency(updatedTask.frequency || frequency);
      setDescription(updatedTask.description || description);

      // Save to Firebase
      await taskService.updateTask(task.id, updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task settings');
    }
  };

  const handlePhotoAdded = async (photoUrl: string) => {
    try {
      await taskService.updateTask(task.id, {
        ...task,
        photos: [...(task.photos || []), photoUrl],
      });
    } catch (error) {
      console.error('Error adding photo:', error);
      Alert.alert('Error', 'Failed to save photo');
    }
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
                value={title}
                onChangeText={setTitle}
                placeholder="Enter task name"
                placeholderTextColor="#999"
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
                placeholderTextColor="#999"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Settings</Text>
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerWrapper}>
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
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={frequency}
                  onValueChange={(value) => setFrequency(value as TaskFrequency)}
                  style={styles.picker}
                >
                  <Picker.Item label="🔄 Daily" value="daily" />
                  <Picker.Item label="📅 Weekly" value="weekly" />
                  <Picker.Item label="📆 Monthly" value="monthly" />
                  <Picker.Item label="🗓 Annual" value="annual" />
                  <Picker.Item label="1️⃣ Once" value="once" />
                </Picker>
              </View>
            </View>
          </View>
        </View>

        <WeatherAwareScheduling 
          task={task}
          onUpdate={handleTaskUpdate}
        />
        
        <TaskDocumentation
          taskId={task.id}
          onPhotoAdded={handlePhotoAdded}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
          >
            <Ionicons name="save-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" style={styles.buttonIcon} />
            <Text style={styles.deleteButtonText}>Delete Task</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
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
    paddingTop: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  pickerWrapper: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
}); 