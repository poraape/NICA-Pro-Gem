import React, { useState } from 'react';
import { MealItem } from '../types';
import { analyzeMealText } from '../services/geminiService';
import { NutriButton } from './Button';
import { NutriInput } from './NutriInput';
import { Mic, Send, Plus, Trash2, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FoodDiaryProps {
  onAddMeal: (meal: MealItem) => void;
  recentMeals: MealItem[];
  onDeleteMeal: (id: string) => void;
}

export const FoodDiary: React.FC<FoodDiaryProps> = ({ onAddMeal, recentMeals, onDeleteMeal }) => {
  const { t, language } = useLanguage();
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsAnalyzing(true);
    const meal = await analyzeMealText(input, language);
    
    if (meal) {
      onAddMeal(meal);
      setInput("");
    } else {
      alert("Could not interpret meal. Please try a more descriptive text.");
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full pb-20">
      {/* Input Section */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-glass border border-white/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-900">{t('diary.new')}</h3>
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-md">{t('diary.ai')}</span>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <NutriInput
              label={t('diary.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              multiline
              disabled={isAnalyzing}
              helperText={t('diary.helper')}
            />
            
            <div className="flex gap-3">
              <NutriButton 
                type="submit" 
                isLoading={isAnalyzing} 
                className="flex-1"
                icon={<Send size={16} />}
              >
                {t('diary.submit')}
              </NutriButton>
              <NutriButton 
                type="button" 
                variant="secondary"
                icon={<Mic size={18} />}
                title={t('diary.voice_mock')}
              />
            </div>
          </form>
        </div>

        <div className="bg-secondary-50/50 p-5 rounded-2xl border border-secondary-100 flex gap-4 items-start">
          <Info className="text-secondary-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-secondary-800 mb-1">{t('diary.tip')}</h4>
            <p className="text-xs text-secondary-700 leading-relaxed">
              {t('diary.tip_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass border border-white/50 flex flex-col overflow-hidden h-[600px] lg:h-auto">
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-white/50">
          <h3 className="text-lg font-bold text-neutral-900">{t('diary.list_title')}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">{t('diary.total')}</span>
            <span className="bg-neutral-900 text-white text-sm px-3 py-1 rounded-full font-bold shadow-md">
              {recentMeals.reduce((acc, m) => acc + m.calories, 0)} kcal
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {recentMeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <Plus size={32} className="opacity-40" />
              </div>
              <p className="font-medium">{t('diary.empty')}</p>
              <p className="text-xs mt-1">{t('diary.empty_sub')}</p>
            </div>
          ) : (
            recentMeals.map((meal) => (
              <div key={meal.id} className="group relative flex items-center justify-between p-5 rounded-xl border border-neutral-100 bg-white hover:border-primary-200 hover:shadow-md transition-all duration-200">
                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-2">
                    <h5 className="font-semibold text-neutral-900 text-lg">{meal.name}</h5>
                    <span className="text-base font-bold text-primary-600">{meal.calories} <span className="text-xs font-normal text-neutral-500">kcal</span></span>
                  </div>
                  <div className="flex gap-4 text-xs text-neutral-500">
                    <span className="flex items-center gap-1.5 font-medium"><div className="w-2 h-2 rounded-full bg-secondary-400"/> {meal.macros.protein}g Protein</span>
                    <span className="flex items-center gap-1.5 font-medium"><div className="w-2 h-2 rounded-full bg-green-400"/> {meal.macros.carbs}g Carbs</span>
                    <span className="flex items-center gap-1.5 font-medium"><div className="w-2 h-2 rounded-full bg-yellow-400"/> {meal.macros.fats}g Fats</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 ml-4">
                   <span className="text-xs text-neutral-300 font-mono">{new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
                   <button 
                    onClick={() => onDeleteMeal(meal.id)}
                    className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove Entry"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};