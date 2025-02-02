import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  frequency: TaskFrequency;
  priority: TaskPriority;
  completed: boolean;
  completionHistory: CompletionRecord[];
  currentStreak: number;
  bestStreak: number;
  createdAt: number;
  userId: string;
  scheduledTime?: {
    hour: number;
    minute: number;
    weatherDependent: boolean;
    weatherConditions?: {
      noRain: boolean;
      maxTemp: number;
      minTemp: number;
      maxWindSpeed: number;
    };
  };
  horseDetails?: {
    age: number;
    weight: number;
    hairLength: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
}

export type TaskCategory = 'grooming' | 'feeding' | 'medical' | 'maintenance' | 'other';
export type TaskFrequency = 'daily' | 'weekly' | 'monthly' | 'annual';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface CompletionRecord {
  timestamp: number;
  weather?: {
    temperature: number;
    condition: string;
    windSpeed: number;
  };
  photos?: string[];
  notes?: string;
}

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  AddTask: undefined;
  EditTask: { task: Task };
  TaskCalendar: { task: Task };
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface Horse {
  id: string;
  name: string;
  age: number;
  weight: number;
  hairLength: string;
  coatCondition: string;
  blanketPreferences?: {
    minTemp: number;
    maxTemp: number;
    preferredBlanketWeight: string;
  };
} 