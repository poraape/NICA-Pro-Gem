
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, MealItem, WeeklyPlan, NutritionalPlan, ClinicalReport, Language } from "../types";
import { getLanguageName } from "../utils/i18n";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = 'gemini-2.5-flash';

// Helper to enforce language in system instruction or prompt
const getLanguageInstruction = (lang: Language) => {
  const langName = getLanguageName(lang);
  return `IMPORTANT: All output text (names, descriptions, recommendations, notes, insights) MUST be in ${langName} language.`;
};

export const analyzeMealText = async (text: string, language: Language = 'en'): Promise<MealItem | null> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Analyze this meal description: "${text}". Estimate calories and macros. Return JSON. ${getLanguageInstruction(language)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Short meal name" },
            description: { type: Type.STRING, description: "Brief description of ingredients" },
            calories: { type: Type.NUMBER },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fats: { type: Type.NUMBER }
              },
              required: ["protein", "carbs", "fats"]
            }
          },
          required: ["name", "calories", "macros"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    if (!result.name) return null;

    return {
      id: crypto.randomUUID(),
      name: result.name,
      description: result.description,
      calories: result.calories,
      macros: result.macros,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error parsing meal:", error);
    return null;
  }
};

export const generateWeeklyPlan = async (profile: UserProfile): Promise<WeeklyPlan | null> => {
  try {
    const isExpress = profile.onboardingMode === 'express';
    const langInstruction = getLanguageInstruction(profile.language);
    
    // Construct a rich context based on the new deep data structure
    const prompt = `
      ACT AS A SENIOR CLINICAL NUTRITIONIST. Create a highly personalized 7-DAY Weekly Meal Plan.
      ${langInstruction}
      
      ## 1. USER BIOMETRICS
      - Bio: ${profile.biometrics.age}y, ${profile.biometrics.gender}, ${profile.biometrics.height}cm, ${profile.biometrics.weight}kg
      - BMR: ${profile.bmr} | TDEE: ${profile.tdee}
      - Body Fat: ${profile.biometrics.bodyFatPercentage || 'N/A'}% | Waist: ${profile.biometrics.waistCircumference || 'N/A'}cm

      ## 2. GOALS & STRATEGY
      - Primary Goal: ${profile.goals.primary} (Motivation: ${profile.goals.motivation || 'General health'})
      - Secondary Goals: ${profile.goals.secondary?.join(', ')}
      - Deadline: ${profile.goals.deadline || 'Sustainable pace'}

      ## 3. CLINICAL CONTEXT
      - Medical Conditions: ${profile.clinical.medicalConditions.join(", ") || "None"}
      - Medications: ${profile.clinical.medications.join(", ") || "None"}
      - Mental Health context: ${profile.clinical.mentalHealth?.join(", ") || "None"}

      ## 4. LIFESTYLE & ROUTINE
      - Activity: ${profile.lifestyle.activityLevel} (${profile.lifestyle.exerciseTypes?.join(', ')})
      - Sleep: ${profile.lifestyle.sleepQuality} | Stress: ${profile.lifestyle.stressLevel}
      - Diet Type: ${profile.routine.dietaryPreference}
      - Eating Window/Fasting: ${profile.routine.fastingWindow || 'Standard'}
      - Meals/Day: ${profile.routine.mealsPerDay} (Times: ${profile.routine.preferredMealTimes})
      - Social: ${profile.routine.socialContext}
      - Habits: Smoking (${profile.lifestyle.smoking}), Alcohol (${profile.lifestyle.alcoholIntake}), Caffeine (${profile.lifestyle.caffeineIntake})

      ## 5. PREFERENCES
      - Allergies: ${profile.routine.allergies.join(", ") || "None"}
      - Dislikes: ${profile.routine.dislikes.join(", ") || "None"}
      - Favorites: ${profile.routine.favorites.join(", ") || "None"}

      ## REQUIREMENTS
      1. Generate 7 days (Monday - Sunday).
      2. Strictly follow the meal frequency (${profile.routine.mealsPerDay}).
      3. Adjust macros/calories based on the Goal and TDEE.
      4. Consider the Clinical Context (e.g., lower sodium for hypertension, lower sugar for diabetes).
      5. Provide specific recommendations.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  meals: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        calories: { type: Type.NUMBER },
                        macros: {
                          type: Type.OBJECT,
                          properties: {
                            protein: { type: Type.NUMBER },
                            carbs: { type: Type.NUMBER },
                            fats: { type: Type.NUMBER }
                          },
                          required: ["protein", "carbs", "fats"]
                        }
                      },
                      required: ["name", "calories", "macros"]
                    }
                  }
                },
                required: ["day", "meals"]
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["days", "recommendations"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");

    if (!result.days || result.days.length === 0) return null;

    // Post-process to add IDs and calculate averages
    let totalCals = 0;
    let totalP = 0, totalC = 0, totalF = 0;
    const daysProcessed = result.days.map((d: any) => {
      let dayCals = 0;
      let dayP = 0, dayC = 0, dayF = 0;
      
      const meals = d.meals.map((m: any) => {
        dayCals += m.calories;
        dayP += m.macros.protein;
        dayC += m.macros.carbs;
        dayF += m.macros.fats;
        return { ...m, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
      });

      totalCals += dayCals;
      totalP += dayP; totalC += dayC; totalF += dayF;

      return {
        day: d.day,
        meals,
        dailyCalories: dayCals,
        dailyMacros: { protein: dayP, carbs: dayC, fats: dayF }
      };
    });

    return {
      id: crypto.randomUUID(),
      days: daysProcessed,
      averageCalories: Math.round(totalCals / 7),
      averageMacros: {
        protein: Math.round(totalP / 7),
        carbs: Math.round(totalC / 7),
        fats: Math.round(totalF / 7)
      },
      recommendations: result.recommendations,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error("Error generating weekly plan:", error);
    return null;
  }
};

export const generateClinicalReport = async (profile: UserProfile, plan: WeeklyPlan): Promise<ClinicalReport | null> => {
   try {
    const langInstruction = getLanguageInstruction(profile.language);
    const prompt = `
       ACT AS A SENIOR CLINICAL DIETITIAN.
       Analyze this generated meal plan against the user's DEEP profile and generate a Clinical Report.
       ${langInstruction}

       User Profile:
       - TDEE: ${profile.tdee}, Goal: ${profile.goals.primary}
       - Conditions: ${profile.clinical.medicalConditions.join(",")}
       - Labs/Meds: ${profile.clinical.medications.join(",")}
       - Lifestyle: ${profile.lifestyle.alcoholIntake} alcohol, ${profile.lifestyle.smoking ? 'Smoker' : 'Non-smoker'}

       Generated Plan Averages:
       - Calories: ${plan.averageCalories}
       - Macros: P${plan.averageMacros.protein} / C${plan.averageMacros.carbs} / F${plan.averageMacros.fats}

       OUTPUT JSON with:
       1. overallScore (0-100)
       2. weightProjection (kg change per week, negative for loss)
       3. dailyDeficit (kcal)
       4. micronutrientAnalysis (List potential deficiencies like Iron, Zinc, B12 based on diet type and food list)
       5. behavioralInsights (Psychological/Habit tips considering their stress/sleep)
       6. risks (Any clinical risks e.g. drug-nutrient interactions or contraindications)
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             overallScore: { type: Type.NUMBER },
             weightProjection: { type: Type.NUMBER },
             dailyDeficit: { type: Type.NUMBER },
             micronutrientAnalysis: {
                type: Type.OBJECT,
                properties: {
                   deficiencies: { type: Type.ARRAY, items: { type: Type.STRING } },
                   adequacies: { type: Type.ARRAY, items: { type: Type.STRING } },
                   notes: { type: Type.STRING }
                }
             },
             behavioralInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
             risks: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
       id: crypto.randomUUID(),
       generatedAt: new Date().toISOString(),
       ...result
    };

   } catch (e) {
      console.error(e);
      return null;
   }
};

export const generateNutritionPlan = async (profile: UserProfile): Promise<NutritionalPlan | null> => {
  return null; 
};
