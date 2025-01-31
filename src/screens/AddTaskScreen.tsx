import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';

export default function AddTaskScreen() {
  const [taskName, setTaskName] = useState('');
  const navigation = useNavigation();

  const handleAddTask = async () => {
    if (taskName.trim()) {
      try {
        await addDoc(collection(db, 'tasks'), {
          title: taskName,
          completed: false,
          createdAt: Date.now(),
          userId: 'dummyUserId', // Match the ID we're using in HomeScreen
          category: 'Health', // Default category
          frequency: 'daily', // Default frequency
          completionHistory: [],
          currentStreak: 0,
          bestStreak: 0,
          description: '',
          priority: 'high', // Default priority
        });
        navigation.goBack();
      } catch (error) {
        console.error('Error adding task: ', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={taskName}
        onChangeText={setTaskName}
        placeholder="Enter task name"
      />
      <TouchableOpacity 
        style={styles.button}
        onPress={handleAddTask}
      >
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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