import React, { useState } from 'react';
import { MealItem } from '../types';
import { SmartMealInput } from './SmartMealInput';
import { NutriButton } from './Button';
import { Plus, Trash2, Calendar, Coffee, Utensils } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FoodDiaryProps {
  onAddMeal: (meal: MealItem) => void;
  recentMeals: MealItem[];
  onDeleteMeal: (id: string) => void;
}

export const FoodDiary: React.FC<FoodDiaryProps> = ({ onAddMeal, recentMeals, onDeleteMeal }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="h-full pb-24 relative">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
        <div>
           <h2 className="text-3xl font-bold text-neutral-900">{t('diary.list_title')}</h2>
           <p className="text-neutral-500 mt-1 flex items-center gap-2">
             <Calendar size={16} /> Today's Timeline
           </p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-xl border border-neutral-200 shadow-sm">
              <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-0.5">Total Intake</p>
              <p className="text-xl font-mono font-bold text-primary-600">
                {recentMeals.reduce((acc, m) => acc + m.calories, 0)} <span className="text-xs text-neutral-400 font-sans">kcal</span>
              </p>
           </div>
           
           <NutriButton onClick={() => setIsModalOpen(true)} icon={<Plus size={20} />} className="shadow-glow">
              {t('diary.new')}
           </NutriButton>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {recentMeals.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-neutral-400 bg-white/40 border-2 border-dashed border-neutral-200 rounded-3xl animate-scale-in">
              <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
                 <Utensils size={32} className="opacity-40" />
              </div>
              <h3 className="text-lg font-bold text-neutral-600">{t('diary.empty')}</h3>
              <p className="text-sm max-w-xs text-center mt-2 opacity-70">{t('diary.empty_sub')}</p>
           </div>
        ) : (
           recentMeals.map((meal, index) => (
             <div 
                key={meal.id} 
                className="group relative bg-white/80 backdrop-blur-sm border border-neutral-100 rounded-2xl p-5 shadow-sm hover:shadow-glass hover:border-primary-200 transition-all duration-300"
                style={{ 
                  animation: 'fadeIn 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards',
                  opacity: 0,
                  animationDelay: `${index * 100}ms` 
                }}
             >
                <div className="flex justify-between items-start">
                   <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 flex items-center justify-center shadow-inner">
                         <Coffee size={20} />
                      </div>
                      <div>
                         <h4 className="font-bold text-lg text-neutral-800 leading-tight mb-1">{meal.name}</h4>
                         <p className="text-xs font-mono text-neutral-400">{new Date(meal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                         
                         {/* Macros */}
                         <div className="flex gap-3 mt-3">
                            <span className="text-[10px] font-bold px-2 py-1 rounded bg-neutral-100 text-neutral-500">
                               {meal.macros.protein}g P
                            </span>
                            <span className="text-[10px] font-bold px-2 py-1 rounded bg-neutral-100 text-neutral-500">
                               {meal.macros.carbs}g C
                            </span>
                            <span className="text-[10px] font-bold px-2 py-1 rounded bg-neutral-100 text-neutral-500">
                               {meal.macros.fats}g F
                            </span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex flex-col items-end gap-2">
                      <span className="text-xl font-mono font-bold text-primary-600">{meal.calories}</span>
                      <button 
                        onClick={() => onDeleteMeal(meal.id)}
                        className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                         <Trash2 size={18} />
                      </button>
                   </div>
                </div>
             </div>
           ))
        )}
      </div>

      <SmartMealInput 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddMeal}
      />
    </div>
  );
};