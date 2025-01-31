import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { TaskCalendarScreen } from './src/screens/TaskCalendarScreen';
import { RootStackParamList } from './src/types';
import { Task } from './src/types';
import { EditTaskScreen } from './src/screens/EditTaskScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#f5f5f5',
            },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={({ navigation }) => ({
              title: "Ben's Barn Tracker",
              headerRight: () => (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => navigation.navigate('AddTask')}
                >
                  <Text style={styles.addButtonText}>Add Task</Text>
                </TouchableOpacity>
              ),
              headerTitleStyle: styles.headerTitle,
            })}
          />
          <Stack.Screen 
            name="AddTask" 
            component={AddTaskScreen}
            options={{ 
              title: 'Add New Task',
              headerTitleStyle: styles.headerTitle,
            }}
          />
          <Stack.Screen 
            name="TaskCalendar" 
            component={TaskCalendarScreen}
            options={{ 
              title: 'Task History',
              headerTitleStyle: styles.headerTitle,
            }}
          />
          <Stack.Screen 
            name="EditTask" 
            component={EditTaskScreen}
            options={{ 
              title: 'Edit Task',
              headerTitleStyle: styles.headerTitle,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
