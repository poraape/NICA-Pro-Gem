import { UserProfile, DailyLog, NutritionalPlan, ActivityLevel, Gender } from './types';

export const INITIAL_PROFILE: UserProfile = {
  id: "user-001",
  onboardingMode: 'complete',
  language: 'pt',
  name: "Alex Silva",
  
  biometrics: {
    age: 32,
    gender: Gender.MALE,
    height: 178,
    weight: 78.5,
    waistCircumference: 85,
    bodyFatPercentage: 18
  },
  
  clinical: {
    medicalConditions: [],
    medications: [],
    mentalHealth: ["Mild stress"],
    familyHistory: ["Diabetes Type 2"]
  },
  
  lifestyle: {
    activityLevel: ActivityLevel.MODERATE,
    exerciseFrequency: 3,
    exerciseTypes: ["Running", "Gym"],
    sleepQuality: 'good',
    stressLevel: 'moderate',
    smoking: false,
    alcoholIntake: "Socially",
    caffeineIntake: "2 cups coffee/day"
  },
  
  routine: {
    dietaryPreference: 'omnivore',
    mealsPerDay: 4,
    preferredMealTimes: "08:00, 12:00, 16:00, 20:00",
    cookingTime: 'medium',
    allergies: ["Shellfish"],
    intolerances: [],
    dislikes: ["Okra"],
    favorites: ["Salmon", "Oats"],
    culturalRestrictions: [],
    socialContext: "Eats out on weekends"
  },
  
  goals: {
    primary: "loss",
    secondary: ["Improve energy", "Lower cholesterol"],
    deadline: "3 months",
    motivation: "Health and aesthetics"
  },
  
  consent: {
    dataProcessing: true,
    analytics: true,
    camera: true,
    notifications: true
  },

  bmr: 1750,
  tdee: 2600
};

export const MOCK_PLAN: NutritionalPlan = {
  id: "plan-init-001",
  targetCalories: 2100,
  targetMacros: {
    protein: 160,
    carbs: 210,
    fats: 70
  },
  targetWater: 2500,
  recommendations: [
    "Prioritize lean proteins at every meal.",
    "Limit sodium intake to under 2300mg.",
    "Consume 30g of fiber daily."
  ],
  sampleMenu: [
    { meal: "Breakfast", description: "Oatmeal with whey protein and berries" },
    { meal: "Lunch", description: "Grilled chicken breast with quinoa and roasted broccoli" },
    { meal: "Snack", description: "Greek yogurt with almonds" },
    { meal: "Dinner", description: "Baked salmon with asparagus and sweet potato" }
  ],
  generatedAt: new Date().toISOString()
};

export const MOCK_LOGS: DailyLog[] = [
  {
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    meals: [],
    totalCalories: 1950,
    totalMacros: { protein: 140, carbs: 200, fats: 65 },
    waterIntake: 2100
  },
  {
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    meals: [],
    totalCalories: 2050,
    totalMacros: { protein: 155, carbs: 190, fats: 72 },
    waterIntake: 2400
  },
  {
    date: new Date().toISOString().split('T')[0],
    meals: [
      {
        id: "m1",
        name: "Avocado Toast & Eggs",
        calories: 450,
        macros: { protein: 22, carbs: 35, fats: 24 },
        timestamp: new Date().toISOString()
      }
    ],
    totalCalories: 450,
    totalMacros: { protein: 22, carbs: 35, fats: 24 },
    waterIntake: 500
  }
];

export const MOCK_WEIGHT_HISTORY = [
  { date: '2023-10-01', value: 82.0 },
  { date: '2023-10-15', value: 80.5 },
  { date: '2023-11-01', value: 79.2 },
  { date: '2023-11-15', value: 78.5 },
];