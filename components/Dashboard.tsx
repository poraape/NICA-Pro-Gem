import React, { useEffect, useState } from 'react';
import { DashboardData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, ArrowRight, Sparkles, X, ChevronRight } from 'lucide-react';
import { HealthStats } from './HealthStats';

interface DashboardProps {
  data: DashboardData;
  onTabChange: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onTabChange }) => {
  const { t, language } = useLanguage();
  const [showInsights, setShowInsights] = useState(true);

  // --- Derived Metrics ---
  const todayLog = data.logs.find(l => l.date === new Date().toISOString().split('T')[0]) || {
    totalCalories: 0,
    totalMacros: { protein: 0, carbs: 0, fats: 0 }
  };
  
  const targetCals = data.weeklyPlan?.averageCalories || data.profile.tdee || 2000;
  const targetMacros = data.weeklyPlan?.averageMacros || { protein: 150, carbs: 200, fats: 70 };

  const calPercentage = Math.min((todayLog.totalCalories / targetCals) * 100, 130);
  
  // Progress Bar Color Logic
  let calBarColor = 'bg-primary-500'; // Green/Teal (Standard)
  if (calPercentage > 100) calBarColor = 'bg-orange-400'; // Warning
  if (calPercentage > 120) calBarColor = 'bg-error-500'; // Danger

  // Date Formatter
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const todayString = new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : language === 'zh' ? 'zh-CN' : 'en-US', dateOptions);

  // Time of Day Greeting
  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      return "Good Evening";
  };
  const greeting = getGreeting();

  // Macro Ring Component
  const MacroRing = ({ value, max, color, label }: { value: number, max: number, color: string, label: string }) => {
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    const percent = Math.min(value / max, 1);
    const strokeDashoffset = circumference - percent * circumference;

    return (
      <div className="flex flex-col items-center gap-1 group cursor-default" role="img" aria-label={`${label} progress: ${value} of ${max}`}>
        <div className="relative w-16 h-16 flex items-center justify-center transition-transform transform group-hover:scale-110">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
            <circle cx="32" cy="32" r={radius} stroke="#f3f4f6" strokeWidth="4" fill="transparent" />
            <circle 
              cx="32" cy="32" r={radius} 
              stroke={color} strokeWidth="4" fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-700">
            <span className="text-[10px] font-bold font-mono text-neutral-900">{value}</span>
            <span className="text-[8px] text-neutral-400">/{max}</span>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">{label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. Header */}
      <div className="flex items-end justify-between px-2 animate-fade-in">
        <div>
          <p className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">{todayString}</p>
          <h2 className="text-3xl font-bold text-neutral-900 leading-tight">
            {greeting}, <span className="text-primary-600 block">{data.profile.name.split(' ')[0]}</span>
          </h2>
        </div>
        <div 
            className="w-12 h-12 rounded-full bg-cream-200 border-2 border-white shadow-md flex items-center justify-center text-primary-700 font-bold text-lg hover:scale-105 transition-transform cursor-pointer"
            onClick={() => onTabChange('setup')}
            role="button"
            tabIndex={0}
            aria-label="Go to Profile"
        >
            {data.profile.name.charAt(0)}
        </div>
      </div>

      {/* 2. Daily Goal Card (Glassmorphism) */}
      <div 
        className="relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/80 rounded-[24px] shadow-glass p-6 animate-slide-up transform transition-all duration-300 hover:shadow-lg"
      >
        <div className="flex justify-between items-start mb-6">
          <div 
            onClick={() => onTabChange('diary')} 
            className="cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
            role="button"
            tabIndex={0}
            aria-label="View Daily Diary"
          >
            <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-1 group-hover:text-primary-600 transition-colors">
                {t('nav.diary')} <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
            </h3>
            <p className="text-xs text-neutral-500">{t('stats.daily_deficit')}</p>
          </div>
          <div className="bg-white/50 px-3 py-1 rounded-full border border-white shadow-sm backdrop-blur-md">
             <span className="text-xs font-mono font-bold text-neutral-600">{todayLog.totalCalories} / {targetCals} kcal</span>
          </div>
        </div>

        {/* Calorie Linear Progress */}
        <div className="mb-8" role="progressbar" aria-valuenow={todayLog.totalCalories} aria-valuemin={0} aria-valuemax={targetCals} aria-label="Daily Calories">
           <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden shadow-inner border border-neutral-100/50">
              <div 
                className={`h-full ${calBarColor} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]`} 
                style={{ width: `${calPercentage}%` }}
              />
           </div>
           <div className="flex justify-between mt-2 text-xs font-medium text-neutral-400">
              <span>0%</span>
              <span className="text-neutral-300">Target</span>
              <span>120%</span>
           </div>
        </div>

        {/* Macro Rings */}
        <div className="flex justify-between items-center px-2 sm:px-8">
          <MacroRing value={todayLog.totalMacros.protein} max={targetMacros.protein} color="#208192" label="Prot" />
          <MacroRing value={todayLog.totalMacros.carbs} max={targetMacros.carbs} color="#E87D4A" label="Carb" />
          <MacroRing value={todayLog.totalMacros.fats} max={targetMacros.fats} color="#C01530" label="Fat" />
        </div>

        {/* Primary Action Button */}
        <div className="mt-8">
           <button 
             onClick={() => onTabChange('diary')}
             className="w-full h-[52px] bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-2xl shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20"
             aria-label={t('diary.new')}
           >
             <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
             {t('diary.new')}
           </button>
        </div>
      </div>

      {/* 3. Insights Section */}
      {showInsights && (
         <div className="space-y-4">
            <div className="flex items-center justify-between px-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
               <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                 <Sparkles size={18} className="text-brand-orange" /> Insights
               </h3>
               <button onClick={() => setShowInsights(false)} className="text-neutral-400 hover:text-neutral-600 p-1 rounded-full hover:bg-neutral-100">
                 <X size={16} />
               </button>
            </div>

            <div 
                className="bg-brand-orange text-white p-6 rounded-3xl shadow-lg shadow-brand-orange/20 relative overflow-hidden transform transition-all hover:scale-[1.01] cursor-pointer animate-slide-up focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300"
                style={{ animationDelay: '200ms' }}
                onClick={() => onTabChange('health-stats')}
                role="button"
                tabIndex={0}
                aria-label="View Clinical Insights"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-overlay opacity-10 -translate-y-10 translate-x-10 pointer-events-none"></div>
               
               <div className="flex items-start gap-3 relative z-10">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                     <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                     <span className="inline-block px-2 py-0.5 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 backdrop-blur-sm">Pattern Detected</span>
                     <h4 className="font-bold text-lg mb-1">{data.clinicalReport?.behavioralInsights?.[0] || "Macronutrient Gap"}</h4>
                     <p className="text-orange-50 text-sm leading-relaxed mb-4">
                        {data.clinicalReport?.behavioralInsights?.[0] ? "Consistent with your report analysis." : "We detected a lower protein intake during lunch. Bumping this up may reduce afternoon cravings."}
                     </p>
                     
                     <div className="flex gap-3">
                        <span className="px-4 py-2 bg-white text-brand-orange font-bold text-sm rounded-xl shadow-sm hover:bg-orange-50 transition-colors inline-block">
                           View Details
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* 4. Deep Dive Stats (Existing Component) */}
      <div className="pt-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4 px-2">
             <h3 className="text-lg font-bold text-neutral-900">{t('nav.projections')}</h3>
             <button onClick={() => onTabChange('health-stats')} className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View Report <ArrowRight size={16} />
             </button>
          </div>
          
          {data.weeklyPlan ? (
             <HealthStats profile={data.profile} plan={data.weeklyPlan} report={data.clinicalReport || undefined} />
          ) : (
            <div className="p-8 text-center bg-white/40 border border-neutral-100 border-dashed rounded-3xl text-neutral-400">
               Generate a plan to see projections.
            </div>
          )}
      </div>

    </div>
  );
};