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
          category: 'other', // Default category
          frequency: 'daily', // Default frequency
          completionHistory: [],
          currentStreak: 0,
          bestStreak: 0,
          description: ''
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 