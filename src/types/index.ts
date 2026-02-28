import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ─── Horse ───────────────────────────────────────────────────────────────────

export interface Horse {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  weight?: number;
  color?: string;
  stall?: string;
  notes?: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

export type HorseFormData = Omit<Horse, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

// ─── Supplements ─────────────────────────────────────────────────────────────

export type SupplementFrequency = 'daily' | 'twice_daily' | 'weekly' | 'as_needed';
export type StockUnit = 'lbs' | 'oz' | 'kg' | 'bags' | 'scoops';

export interface SupplementSubscription {
  isActive: boolean;
  supplier?: string;
  deliveryFrequencyDays: number;
  quantityPerDelivery: number;
  nextDeliveryDate?: string;   // YYYY-MM-DD
  lastDeliveryDate?: string;
  notes?: string;
}

export interface Supplement {
  id: string;
  name: string;
  brand?: string;
  horseId: string;
  horseName: string;           // denormalized for display
  dosage: string;
  frequency: SupplementFrequency;
  currentStock: number;
  stockUnit: StockUnit;
  lowStockThreshold: number;
  subscription?: SupplementSubscription;
  notes?: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

export type SupplementFormData = Omit<Supplement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

// ─── Shavings ─────────────────────────────────────────────────────────────────

export interface ShavingsInventory {
  id: string;                  // == userId
  currentBags: number;
  reorderThreshold: number;
  bagsPerOrder: number;
  supplier?: string;
  costPerBag?: number;
  pendingOrderDate?: string;   // YYYY-MM-DD
  expectedDeliveryDate?: string;
  notes?: string;
  userId: string;
  lastUpdated: number;
}

export interface ShavingsDelivery {
  id: string;
  bagsReceived: number;
  deliveredAt: string;         // YYYY-MM-DD
  supplier?: string;
  notes?: string;
  createdAt: number;
}

// ─── Incomplete Task Reports ──────────────────────────────────────────────────

export type IncompleteTaskCategory = 'feeding' | 'water' | 'turnout' | 'stall_cleaning' | 'medical' | 'other';

export interface IncompleteTaskReport {
  id: string;
  category: IncompleteTaskCategory;
  horseId?: string;
  horseName?: string;
  notes?: string;
  reportedBy: string;          // user email
  userId: string;
  createdAt: number;
}

// ─── Navigation Types ─────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type HorsesStackParamList = {
  HorsesList: undefined;
  HorseForm: { horse?: Horse } | undefined;
};

export type SupplementsStackParamList = {
  SupplementsList: undefined;
  SupplementForm: { supplement?: Supplement; horse?: Horse } | undefined;
};

export type MainTabParamList = {
  Horses: NavigatorScreenParams<HorsesStackParamList>;
  Supplements: NavigatorScreenParams<SupplementsStackParamList>;
  Shavings: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
