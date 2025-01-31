import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number; // timestamp
  completedAt?: number; // timestamp
  userId: string;
  category: TaskCategory;
  frequency: TaskFrequency;
  completionHistory: CompletionRecord[];
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface CompletionRecord {
  date: string;
  timestamp: number;
}

export type TaskCategory = 
  | 'grooming'
  | 'feeding'
  | 'medical'
  | 'maintenance'
  | 'other';

export type TaskFrequency = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'annual'
  | 'once';

export type RootStackParamList = {
  Home: undefined;
  AddTask: undefined;
  EditTask: {
    task: Task;
  };
  TaskCalendar: {
    task: Task;
  };
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>; 