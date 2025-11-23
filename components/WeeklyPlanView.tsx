import React, { useState } from 'react';
import { WeeklyPlan, MealItem } from '../types';
import { SmartMealInput } from './SmartMealInput';
import { ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface WeeklyPlanViewProps {
  plan: WeeklyPlan;
  onUpdatePlan: (plan: WeeklyPlan) => void;
}

export const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({ plan, onUpdatePlan }) => {
  const { t } = useLanguage();
  const [expandedDay, setExpandedDay] = useState<string>(plan.days[0].day);
  const [editingMealContext, setEditingMealContext] = useState<{ dayIndex: number; mealIndex: number; meal: MealItem } | null>(null);

  const handleEditClick = (dayIndex: number, mealIndex: number, meal: MealItem) => {
    setEditingMealContext({ dayIndex, mealIndex, meal });
  };

  const handleSaveEdit = (updatedMeal: MealItem) => {
    if (!editingMealContext) return;
    
    const newPlan = { ...plan };
    const day = newPlan.days[editingMealContext.dayIndex];
    
    // Update the meal in the plan
    day.meals[editingMealContext.mealIndex] = updatedMeal;

    // Recalculate Day Totals
    day.dailyCalories = day.meals.reduce((sum, m) => sum + m.calories, 0);
    day.dailyMacros = day.meals.reduce((acc, m) => ({
        protein: acc.protein + m.macros.protein,
        carbs: acc.carbs + m.macros.carbs,
        fats: acc.fats + m.macros.fats
    }), { protein: 0, carbs: 0, fats: 0 });

    // Recalculate Week Averages
    newPlan.averageCalories = Math.round(newPlan.days.reduce((sum, d) => sum + d.dailyCalories, 0) / 7);
    const totalMacros = newPlan.days.reduce((acc, d) => ({
        protein: acc.protein + d.dailyMacros.protein,
        carbs: acc.carbs + d.dailyMacros.carbs,
        fats: acc.fats + d.dailyMacros.fats
    }), { protein: 0, carbs: 0, fats: 0 });
    
    newPlan.averageMacros = {
        protein: Math.round(totalMacros.protein / 7),
        carbs: Math.round(totalMacros.carbs / 7),
        fats: Math.round(totalMacros.fats / 7)
    };

    onUpdatePlan(newPlan);
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">{t('plan.title')}</h2>
          <p className="text-neutral-500 text-sm">{t('plan.subtitle')}</p>
        </div>
        <div className="text-right">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">{t('plan.avg')}</span>
            <div className="text-xl font-bold text-primary-600">{plan.averageCalories} kcal</div>
        </div>
      </div>

      <div className="space-y-4">
        {plan.days.map((day, dayIndex) => {
          const isExpanded = expandedDay === day.day;
          
          return (
            <div key={day.day} className={`bg-white/80 backdrop-blur-sm shadow-glass border border-neutral-100 rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary-100' : ''}`}>
              {/* Day Header */}
              <button 
                onClick={() => setExpandedDay(isExpanded ? '' : day.day)}
                className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-neutral-50 to-white hover:bg-neutral-100/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isExpanded ? 'bg-primary-500 text-white' : 'bg-white border border-neutral-200 text-neutral-500'}`}>
                    {dayIndex + 1}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-neutral-900">{day.day}</h3>
                    <div className="flex gap-3 text-xs text-neutral-500">
                      <span>{day.dailyCalories} kcal</span>
                      <span className="text-neutral-300">|</span>
                      <span>{day.dailyMacros.protein}p • {day.dailyMacros.carbs}c • {day.dailyMacros.fats}f</span>
                    </div>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="text-neutral-400" /> : <ChevronDown className="text-neutral-400" />}
              </button>

              {/* Meals List */}
              {isExpanded && (
                <div className="p-2 space-y-2 bg-white">
                  {day.meals.map((meal, mealIndex) => (
                    <div 
                      key={meal.id}
                      onClick={() => handleEditClick(dayIndex, mealIndex, meal)}
                      className="group relative p-4 rounded-xl border border-neutral-100 hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-neutral-800 flex items-center gap-2">
                             {meal.name}
                             {meal.isEdited && <span className="w-2 h-2 rounded-full bg-amber-400" title="Manually Edited"></span>}
                          </h4>
                          {meal.description && <p className="text-xs text-neutral-500 mt-1">{meal.description}</p>}
                        </div>
                        <div className="text-right">
                          <span className="block font-bold text-primary-600 text-sm">{meal.calories}</span>
                          <span className="text-[10px] text-neutral-400">kcal</span>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2 text-[10px] font-medium text-neutral-500">
                        <span className="bg-neutral-100 px-2 py-1 rounded">Pro: {meal.macros.protein}g</span>
                        <span className="bg-neutral-100 px-2 py-1 rounded">Carb: {meal.macros.carbs}g</span>
                        <span className="bg-neutral-100 px-2 py-1 rounded">Fat: {meal.macros.fats}g</span>
                      </div>
                      <div className="absolute top-4 right-14 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="bg-white p-1.5 rounded-full shadow-sm text-primary-500">
                            <Edit2 size={14} />
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SmartMealInput 
        isOpen={!!editingMealContext}
        onClose={() => setEditingMealContext(null)}
        onSave={handleSaveEdit}
        initialMeal={editingMealContext?.meal}
      />
    </div>
  );
};