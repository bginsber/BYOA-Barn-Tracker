/**
 * Journal Entry Types
 *
 * Defines the structure for photo and audio journal entries
 * with AI analysis capabilities
 */

/**
 * AI Analysis results for photos
 */
export interface PhotoAnalysis {
  // General photo analysis
  description?: string;
  confidence?: number;

  // Meal/Food analysis
  foodDetected?: boolean;
  foodItems?: Array<{
    name: string;
    quantity?: string;
    calories?: number;
    confidence: number;
  }>;
  totalCalories?: number;

  // Horse blanket detection
  horseDetected?: boolean;
  blanketStatus?: 'blanketed' | 'not_blanketed' | 'uncertain';
  blanketType?: 'none' | 'light' | 'medium' | 'heavy' | 'uncertain';
  horseCondition?: {
    visible: boolean;
    coatCondition?: 'clipped' | 'short' | 'medium' | 'long';
    notes?: string;
  };

  // General animal/barn detection
  animalsDetected?: string[];
  barnActivity?: string;

  // Timestamp of analysis
  analyzedAt?: number;
}

/**
 * Photo entry within a journal entry
 */
export interface JournalPhoto {
  id: string;
  url: string;
  localUri?: string;
  thumbnailUrl?: string;
  analysis?: PhotoAnalysis;
  uploadedAt: number;
  analysisStatus?: 'pending' | 'analyzing' | 'completed' | 'failed';
  analysisError?: string;
}

/**
 * Audio transcription and analysis
 */
export interface AudioTranscription {
  text: string;
  confidence?: number;
  language?: string;
  transcribedAt: number;

  // Parsed information from the transcription
  detectedTasks?: Array<{
    taskId?: string;
    taskTitle: string;
    action: 'completed' | 'added' | 'mentioned';
    confidence: number;
  }>;

  // Keywords and entities
  keywords?: string[];
  mentions?: {
    horses?: string[];
    people?: string[];
    locations?: string[];
  };
}

/**
 * Audio entry within a journal entry
 */
export interface JournalAudio {
  id: string;
  url: string;
  localUri?: string;
  duration: number; // in seconds
  transcription?: AudioTranscription;
  uploadedAt: number;
  transcriptionStatus?: 'pending' | 'transcribing' | 'completed' | 'failed';
  transcriptionError?: string;
}

/**
 * Journal entry types
 */
export type JournalEntryType = 'photo' | 'audio' | 'combined' | 'note';

/**
 * Journal entry categories
 */
export type JournalCategory =
  | 'feeding'      // Meals, food, supplements
  | 'care'         // Grooming, blanketing, general care
  | 'medical'      // Health observations, treatments
  | 'training'     // Training sessions, exercises
  | 'maintenance'  // Barn maintenance, repairs
  | 'observation'  // General observations, notes
  | 'other';

/**
 * Main journal entry structure
 */
export interface JournalEntry {
  id: string;
  userId: string;
  type: JournalEntryType;
  category: JournalCategory;

  // Content
  title?: string;
  notes?: string;

  // Media
  photos?: JournalPhoto[];
  audio?: JournalAudio[];

  // Timestamps
  createdAt: number;
  updatedAt: number;
  entryDate: number; // The actual date/time this entry represents

  // Task relationships
  relatedTasks?: string[]; // Task IDs
  completedTasks?: Array<{
    taskId: string;
    taskTitle: string;
    completedAt: number;
  }>;

  // Location
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };

  // Weather at time of entry
  weather?: {
    temperature: number;
    condition: string;
    windSpeed?: number;
    description?: string;
  };

  // Tags for searching and filtering
  tags?: string[];

  // Sharing and visibility
  isPrivate?: boolean;
  sharedWith?: string[]; // User IDs
}

/**
 * Journal entry creation input
 */
export interface CreateJournalEntryInput {
  type: JournalEntryType;
  category: JournalCategory;
  title?: string;
  notes?: string;
  entryDate?: number; // Defaults to now
  relatedTasks?: string[];
  tags?: string[];
  isPrivate?: boolean;
}

/**
 * Photo analysis request
 */
export interface PhotoAnalysisRequest {
  photoUri: string;
  analysisType: 'food' | 'horse' | 'general' | 'all';
  options?: {
    detectCalories?: boolean;
    detectBlanket?: boolean;
    detectActivity?: boolean;
  };
}

/**
 * Audio transcription request
 */
export interface AudioTranscriptionRequest {
  audioUri: string;
  language?: string;
  analyzeContent?: boolean; // Whether to parse tasks and entities
}

/**
 * Journal query filters
 */
export interface JournalQueryFilters {
  startDate?: number;
  endDate?: number;
  types?: JournalEntryType[];
  categories?: JournalCategory[];
  tags?: string[];
  relatedTaskId?: string;
  hasPhotos?: boolean;
  hasAudio?: boolean;
  searchText?: string;
}

/**
 * Journal statistics
 */
export interface JournalStats {
  totalEntries: number;
  entriesByType: Record<JournalEntryType, number>;
  entriesByCategory: Record<JournalCategory, number>;
  totalPhotos: number;
  totalAudioRecordings: number;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
}
