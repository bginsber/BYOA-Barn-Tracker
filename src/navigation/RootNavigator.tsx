import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EditTaskScreen } from '../screens/EditTaskScreen';
import BottomTabNavigator from './BottomTabNavigator';
import { Task } from '../types';

// Define the type for the root stack parameter list
export type RootStackParamList = {
  MainTabs: undefined;
  EditTask: { task: Task };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={BottomTabNavigator} 
      />
      <Stack.Screen 
        name="EditTask" 
        component={EditTaskScreen}
        options={{
          headerShown: true,
          title: 'Edit Task',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontWeight: '600',
          },
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}; 