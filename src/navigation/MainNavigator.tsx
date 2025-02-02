import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types/navigation.types';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import { SageScreen } from '../screens/SageScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          borderTopColor: colors.gray[200],
          backgroundColor: colors.background.paper,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={AddTaskScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Sage"
        component={SageScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="partly-sunny-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Sage',
        }}
      />
    </Tab.Navigator>
  );
}; 