import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { RootStackParamList } from './types/navigation.types';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { useAuth } from '../features/auth/hooks/useAuth';
import { colors } from '../theme/colors';
import AddTaskScreen from '../screens/AddTaskScreen';
import { EditTaskScreen } from '../screens/EditTaskScreen';
import { TaskCalendarScreen } from '../screens/TaskCalendarScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen 
            name="Main" 
            component={MainNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AddTask" 
            component={AddTaskScreen}
            options={{ 
              headerShown: true, 
              title: 'Add Task',
              presentation: 'modal'
            }}
          />
          <Stack.Screen 
            name="EditTask" 
            component={EditTaskScreen}
            options={{ 
              headerShown: true, 
              title: 'Edit Task',
              presentation: 'modal'
            }}
          />
          <Stack.Screen 
            name="TaskCalendar" 
            component={TaskCalendarScreen}
            options={{ 
              headerShown: true, 
              title: 'Task Calendar',
              presentation: 'modal'
            }}
          />
        </>
      ) : (
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      )}
    </Stack.Navigator>
  );
}; 