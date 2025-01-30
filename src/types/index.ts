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