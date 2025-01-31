import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="AddTask" 
        component={AddTaskScreen} 
        options={{
          tabBarLabel: 'Add Task',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }} 
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator; 