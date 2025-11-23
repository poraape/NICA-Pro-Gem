
// Value Objects
export interface MacroBreakdown {
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
}

export interface Micronutrients {
  sodium: number; // mg
  potassium: number; // mg
  vitaminC: number; // mg
  iron: number; // mg
}

// Enums & Types
export enum ActivityLevel {
  SEDENTARY = "Sedentary",
  LIGHT = "Lightly Active",
  MODERATE = "Moderately Active",
  VERY = "Very Active",
  EXTRA = "Extra Active"
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  OTHER = "Other"
}

export type DietaryPreference = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean';
export type CookingTime = 'low' | 'medium' | 'high'; 
export type WellnessLevel = 'poor' | 'average' | 'good' | 'excellent';
export type StressLevel = 'low' | 'moderate' | 'high';
export type OnboardingMode = 'express' | 'complete';
export type Language = 'en' | 'pt' | 'es' | 'zh';

// Sub-Interfaces for Granular Data
export interface Biometrics {
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  waistCircumference?: number; // cm (Optional)
  hipCircumference?: number; // cm (Optional)
  bodyFatPercentage?: number; // % (Optional)
}

export interface ClinicalData {
  medicalConditions: string[]; // Diabetes, Hypertension etc.
  medications: string[]; // Names/Dosages
  recentLabs?: string; // Free text summary or specific JSON later
  familyHistory?: string[];
  mentalHealth?: string[]; // Anxiety, Depression, etc.
  physicalLimitations?: string[];
}

export interface LifestyleData {
  activityLevel: ActivityLevel;
  exerciseFrequency: number; // times per week
  exerciseTypes: string[]; // Gym, Running, Yoga
  sleepQuality: WellnessLevel;
  stressLevel: StressLevel;
  smoking: boolean;
  alcoholIntake: string; // e.g. "Socially", "None", "Daily"
  caffeineIntake: string;
}

export interface RoutineData {
  mealsPerDay: number;
  preferredMealTimes: string; // e.g. "08:00, 13:00, 20:00"
  cookingTime: CookingTime;
  dietaryPreference: DietaryPreference;
  allergies: string[];
  intolerances: string[];
  dislikes: string[]; // Foods to avoid
  favorites: string[]; // Foods to include
  culturalRestrictions: string[]; // Kosher, Halal
  fastingWindow?: string; // e.g. "16:8", "None"
  socialContext: string; // "Eats alone", "Family", "Social events"
}

export interface GoalsData {
  primary: "loss" | "maintain" | "gain" | "longevity" | "performance";
  secondary: string[]; // e.g. "Cholesterol", "Sleep"
  targetWeight?: number;
  deadline?: string; // "6 months", "No rush"
  motivation?: string;
}

export interface UserConsent {
  dataProcessing: boolean; // LGPD/GDPR
  analytics: boolean;
  camera: boolean;
  notifications: boolean;
}

// Master Profile Entity
export interface UserProfile {
  id: string;
  onboardingMode: OnboardingMode;
  language: Language;
  name: string;
  
  // Grouped Data
  biometrics: Biometrics;
  clinical: ClinicalData;
  lifestyle: LifestyleData;
  routine: RoutineData;
  goals: GoalsData;
  consent: UserConsent;

  // Calculated
  bmr?: number;
  tdee?: number;
}

export interface MealItem {
  id: string;
  name: string;
  description?: string;
  calories: number;
  macros: MacroBreakdown;
  timestamp: string; // ISO string
  isEdited?: boolean;
}

export interface DayPlan {
  day: string;
  meals: MealItem[];
  dailyCalories: number;
  dailyMacros: MacroBreakdown;
}

export interface WeeklyPlan {
  id: string;
  days: DayPlan[];
  averageCalories: number;
  averageMacros: MacroBreakdown;
  recommendations: string[];
  generatedAt: string;
}

export interface NutritionalPlan {
  id: string;
  targetCalories: number;
  targetMacros: MacroBreakdown;
  targetWater: number;
  recommendations: string[];
  sampleMenu: { meal: string; description: string }[];
  generatedAt: string;
}

export interface DailyLog {
  date: string;
  meals: MealItem[];
  totalCalories: number;
  totalMacros: MacroBreakdown;
  waterIntake: number;
}

export interface ClinicalReport {
  id: string;
  generatedAt: string;
  overallScore: number;
  weightProjection: number;
  dailyDeficit: number;
  micronutrientAnalysis: {
    deficiencies: string[];
    adequacies: string[];
    notes: string;
  };
  behavioralInsights: string[];
  risks: string[];
}

export interface DashboardData {
  profile: UserProfile;
  weeklyPlan: WeeklyPlan | null;
  clinicalReport?: ClinicalReport | null;
  logs: DailyLog[];
}

export type ViewState = 'setup' | 'weekly-plan' | 'health-stats' | 'diary';
