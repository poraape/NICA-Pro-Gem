import React, { useState } from 'react';
import { WeeklyPlan, MealItem } from '../types';
import { analyzeMealText } from '../services/geminiService';
import { NutriButton } from './Button';
import { NutriInput } from './NutriInput';
import { ChevronDown, ChevronUp, Edit2, Camera, Mic, X, Sparkles, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface WeeklyPlanViewProps {
  plan: WeeklyPlan;
  onUpdatePlan: (plan: WeeklyPlan) => void;
}

export const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({ plan, onUpdatePlan }) => {
  const { t, language } = useLanguage();
  const [expandedDay, setExpandedDay] = useState<string>(plan.days[0].day);
  const [editingMeal, setEditingMeal] = useState<{ dayIndex: number; mealIndex: number; meal: MealItem } | null>(null);
  
  // Edit State
  const [editMode, setEditMode] = useState<'ai' | 'manual'>('ai');
  const [editText, setEditText] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [manualValues, setManualValues] = useState<{name: string, cals: number, p: number, c: number, f: number}>({
    name: '', cals: 0, p: 0, c: 0, f: 0
  });

  const handleEditClick = (dayIndex: number, mealIndex: number, meal: MealItem) => {
    setEditingMeal({ dayIndex, mealIndex, meal });
    setEditText(`${meal.name} ${meal.description || ''}`);
    setManualValues({
        name: meal.name,
        cals: meal.calories,
        p: meal.macros.protein,
        c: meal.macros.carbs,
        f: meal.macros.fats
    });
  };

  const handleAISubmit = async () => {
    if (!editText.trim()) return;
    setIsProcessingAI(true);
    const result = await analyzeMealText(editText, language);
    if (result) {
        setManualValues({
            name: result.name,
            cals: result.calories,
            p: result.macros.protein,
            c: result.macros.carbs,
            f: result.macros.fats
        });
        setEditMode('manual'); // Switch to review
    }
    setIsProcessingAI(false);
  };

  const saveChanges = () => {
    if (!editingMeal) return;
    
    const newPlan = { ...plan };
    const day = newPlan.days[editingMeal.dayIndex];
    const meal = day.meals[editingMeal.mealIndex];

    // Update Meal
    meal.name = manualValues.name;
    meal.calories = manualValues.cals;
    meal.macros = { protein: manualValues.p, carbs: manualValues.c, fats: manualValues.f };
    meal.isEdited = true;

    // Recalculate Day Totals
    day.dailyCalories = day.meals.reduce((sum, m) => sum + m.calories, 0);
    day.dailyMacros = day.meals.reduce((acc, m) => ({
        protein: acc.protein + m.macros.protein,
        carbs: acc.carbs + m.macros.carbs,
        fats: acc.fats + m.macros.fats
    }), { protein: 0, carbs: 0, fats: 0 });

    // Recalculate Week Averages
    newPlan.averageCalories = Math.round(newPlan.days.reduce((sum, d) => sum + d.dailyCalories, 0) / 7);
    newPlan.averageMacros = newPlan.days.reduce((acc, d) => ({
        protein: acc.protein + d.dailyMacros.protein,
        carbs: acc.carbs + d.dailyMacros.carbs,
        fats: acc.fats + d.dailyMacros.fats
    }), { protein: 0, carbs: 0, fats: 0 });
    newPlan.averageMacros = {
        protein: Math.round(newPlan.averageMacros.protein / 7),
        carbs: Math.round(newPlan.averageMacros.carbs / 7),
        fats: Math.round(newPlan.averageMacros.fats / 7)
    };

    onUpdatePlan(newPlan);
    setEditingMeal(null);
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

      {/* Edit Modal / Slide-over */}
      {editingMeal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm pointer-events-auto" onClick={() => setEditingMeal(null)} />
          
          <div className="bg-white w-full sm:max-w-md p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl z-50 pointer-events-auto animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-neutral-900">{t('plan.edit')}</h3>
              <button onClick={() => setEditingMeal(null)} className="p-2 rounded-full hover:bg-neutral-100"><X size={20} /></button>
            </div>

            {/* Tabs */}
            <div className="flex bg-neutral-100 p-1 rounded-xl mb-6">
              <button 
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${editMode === 'ai' ? 'bg-white shadow-sm text-primary-600' : 'text-neutral-500'}`}
                onClick={() => setEditMode('ai')}
              >
                {t('plan.ai_assistant')}
              </button>
              <button 
                 className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${editMode === 'manual' ? 'bg-white shadow-sm text-primary-600' : 'text-neutral-500'}`}
                 onClick={() => setEditMode('manual')}
              >
                {t('plan.manual')}
              </button>
            </div>

            {editMode === 'ai' ? (
               <div className="space-y-4">
                  <NutriInput 
                    label={t('plan.edit.placeholder')}
                    multiline
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    helperText={t('plan.edit.helper')}
                  />
                  <div className="flex gap-2 justify-center pb-4 text-neutral-400">
                     <button className="p-3 rounded-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200"><Camera size={20} /></button>
                     <button className="p-3 rounded-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200"><Mic size={20} /></button>
                  </div>
                  <NutriButton 
                    fullWidth 
                    onClick={handleAISubmit} 
                    isLoading={isProcessingAI}
                    icon={<Sparkles size={18} />}
                  >
                    {t('plan.analyze')}
                  </NutriButton>
               </div>
            ) : (
                <div className="space-y-4">
                   <NutriInput label={t('plan.manual.name')} value={manualValues.name} onChange={(e) => setManualValues({...manualValues, name: e.target.value})} />
                   <div className="grid grid-cols-2 gap-4">
                      <NutriInput label={t('plan.manual.cals')} type="number" value={manualValues.cals} onChange={(e) => setManualValues({...manualValues, cals: Number(e.target.value)})} />
                      <div className="col-span-1" />
                   </div>
                   <div className="grid grid-cols-3 gap-3">
                      <NutriInput label={t('plan.manual.protein')} type="number" value={manualValues.p} onChange={(e) => setManualValues({...manualValues, p: Number(e.target.value)})} />
                      <NutriInput label={t('plan.manual.carbs')} type="number" value={manualValues.c} onChange={(e) => setManualValues({...manualValues, c: Number(e.target.value)})} />
                      <NutriInput label={t('plan.manual.fats')} type="number" value={manualValues.f} onChange={(e) => setManualValues({...manualValues, f: Number(e.target.value)})} />
                   </div>
                   <NutriButton fullWidth onClick={saveChanges} icon={<RefreshCw size={18} />}>{t('plan.save')}</NutriButton>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};