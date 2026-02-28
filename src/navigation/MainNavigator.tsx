import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { MainTabParamList, HorsesStackParamList, SupplementsStackParamList } from '../types';
import { HorsesScreen } from '../screens/horses/HorsesScreen';
import { HorseFormScreen } from '../screens/horses/HorseFormScreen';
import { SupplementsScreen } from '../screens/supplements/SupplementsScreen';
import { SupplementFormScreen } from '../screens/supplements/SupplementFormScreen';
import { ShavingsScreen } from '../screens/shavings/ShavingsScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HorsesStack = createNativeStackNavigator<HorsesStackParamList>();
const SupplementsStack = createNativeStackNavigator<SupplementsStackParamList>();

const HorsesNavigator = () => (
  <HorsesStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background.default },
      headerTintColor: colors.primary.main,
      headerTitleStyle: { fontWeight: '600' },
    }}
  >
    <HorsesStack.Screen
      name="HorsesList"
      component={HorsesScreen}
      options={{ title: 'Horses' }}
    />
    <HorsesStack.Screen
      name="HorseForm"
      component={HorseFormScreen}
      options={({ route }) =>
        route.params?.horse ? { title: 'Edit Horse' } : { title: 'Add Horse' }
      }
    />
  </HorsesStack.Navigator>
);

const SupplementsNavigator = () => (
  <SupplementsStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background.default },
      headerTintColor: colors.primary.main,
      headerTitleStyle: { fontWeight: '600' },
    }}
  >
    <SupplementsStack.Screen
      name="SupplementsList"
      component={SupplementsScreen}
      options={{ title: 'Supplements' }}
    />
    <SupplementsStack.Screen
      name="SupplementForm"
      component={SupplementFormScreen}
      options={({ route }) =>
        route.params?.supplement
          ? { title: 'Edit Supplement' }
          : { title: 'Add Supplement' }
      }
    />
  </SupplementsStack.Navigator>
);

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          borderTopColor: colors.gray[200],
          backgroundColor: colors.background.default,
          paddingBottom: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Horses"
        component={HorsesNavigator}
        options={{
          tabBarLabel: 'Horses',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="paw-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Supplements"
        component={SupplementsNavigator}
        options={{
          tabBarLabel: 'Supplements',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="nutrition-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Shavings"
        component={ShavingsScreen}
        options={{
          headerShown: true,
          title: 'Shavings',
          tabBarLabel: 'Shavings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="layers-outline" size={size} color={color} />
          ),
          headerStyle: { backgroundColor: colors.background.default },
          headerTintColor: colors.primary.main,
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={UserProfileScreen}
        options={{
          headerShown: true,
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          headerStyle: { backgroundColor: colors.background.default },
          headerTintColor: colors.primary.main,
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
    </Tab.Navigator>
  );
};
