import React, { useState, useEffect } from 'react';
import { MealItem } from '../types';
import { analyzeMealText } from '../services/geminiService';
import { NutriButton } from './Button';
import { NutriInput } from './NutriInput';
import { Mic, Camera, X, Sparkles, Check, AlertTriangle, RefreshCw, ChevronRight, Activity, ArrowRight, GripVertical, Plus, RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SmartMealInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: MealItem) => void;
  initialMeal?: MealItem;
}

export const SmartMealInput: React.FC<SmartMealInputProps> = ({ isOpen, onClose, onSave, initialMeal }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'smart' | 'manual'>('smart');
  
  // Smart Mode State
  const [smartText, setSmartText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MealItem | null>(null);
  const [suggestions, setSuggestions] = useState<{name: string, cal: number}[]>([]);

  // Manual Mode State
  const [manualValues, setManualValues] = useState({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });

  // Load initial data
  useEffect(() => {
    if (initialMeal) {
      setManualValues({
        name: initialMeal.name,
        calories: initialMeal.calories,
        protein: initialMeal.macros.protein,
        carbs: initialMeal.macros.carbs,
        fats: initialMeal.macros.fats
      });
      setSmartText(`${initialMeal.name} ${initialMeal.description || ''}`);
      setActiveTab('manual'); 
    } else {
      setSmartText('');
      setManualValues({ name: '', calories: 0, protein: 0, carbs: 0, fats: 0 });
      setAnalysisResult(null);
      setSuggestions([]);
      setActiveTab('smart');
    }
  }, [initialMeal, isOpen]);

  // Handlers
  const handleAnalyze = async () => {
    if (!smartText.trim()) return;
    setIsAnalyzing(true);
    // Haptic feedback
    if(navigator.vibrate) navigator.vibrate(10);
    
    // Simulate suggestions generation alongside analysis
    setTimeout(() => {
       setSuggestions([
         { name: "Add Side Salad (+45kcal)", cal: 45 },
         { name: "Swap for Grilled Option (-120kcal)", cal: -120 }
       ]);
    }, 1500);

    const result = await analyzeMealText(smartText, language);
    setIsAnalyzing(false);
    if(navigator.vibrate) navigator.vibrate([10, 30, 10]); // Success pattern

    if (result) {
      setAnalysisResult(result);
      // Auto-fill manual values for preview
      setManualValues({
        name: result.name,
        calories: result.calories,
        protein: result.macros.protein,
        carbs: result.macros.carbs,
        fats: result.macros.fats
      });
    }
  };

  const applySuggestion = (s: {name: string, cal: number}) => {
     if(navigator.vibrate) navigator.vibrate(5);
     setSmartText(prev => `${prev} + ${s.name}`);
     // Simulate immediate update
     setManualValues(prev => ({
        ...prev,
        calories: prev.calories + s.cal
     }));
     setSuggestions(prev => prev.filter(i => i.name !== s.name));
  };

  const handleSave = () => {
    if(navigator.vibrate) navigator.vibrate(20);
    const mealToSave: MealItem = {
      id: initialMeal?.id || crypto.randomUUID(),
      name: manualValues.name || (analysisResult?.name || 'Unknown Meal'),
      description: activeTab === 'smart' ? smartText : (initialMeal?.description || ''),
      calories: manualValues.calories,
      macros: {
        protein: manualValues.protein,
        carbs: manualValues.carbs,
        fats: manualValues.fats
      },
      timestamp: initialMeal?.timestamp || new Date().toISOString(),
      isEdited: true
    };
    onSave(mealToSave);
    onClose();
  };

  // Determine feedback color based on calorie density (Simulated logic)
  const getStatusColor = (cals: number) => {
     if (cals > 800) return 'text-error-500 bg-error-50 border-error-100';
     if (cals > 600) return 'text-brand-orange bg-orange-50 border-orange-100';
     return 'text-primary-600 bg-primary-50 border-primary-100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm pointer-events-auto transition-opacity duration-300" onClick={onClose} aria-hidden="true" />
      
      <div 
        className="bg-white/90 backdrop-blur-xl w-full sm:max-w-lg p-6 rounded-t-[32px] sm:rounded-[32px] shadow-2xl z-50 pointer-events-auto animate-slide-up max-h-[90vh] overflow-y-auto border border-white/50 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meal-editor-title"
      >
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 id="meal-editor-title" className="text-2xl font-bold text-neutral-900 tracking-tight">
              {initialMeal ? t('common.edit') : t('diary.new')}
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-primary-600 mt-1">
              {activeTab === 'smart' ? t('diary.ai') : t('diary.manual_entry')}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-neutral-100 rounded-2xl mb-6 relative">
          <div 
            className="absolute top-1 bottom-1 w-1/2 bg-white rounded-xl shadow-sm transition-transform duration-300 ease-out"
            style={{ transform: activeTab === 'smart' ? 'translateX(0)' : 'translateX(100%)' }}
          />
          <button onClick={() => setActiveTab('smart')} className={`flex-1 relative z-10 py-3 text-sm font-bold transition-colors ${activeTab === 'smart' ? 'text-primary-600' : 'text-neutral-500'}`}>{t('diary.smart_scan')}</button>
          <button onClick={() => setActiveTab('manual')} className={`flex-1 relative z-10 py-3 text-sm font-bold transition-colors ${activeTab === 'manual' ? 'text-primary-600' : 'text-neutral-500'}`}>{t('diary.manual_detail')}</button>
        </div>

        {/* SMART MODE */}
        {activeTab === 'smart' && (
          <div className="space-y-6 animate-fade-in">
            <div className="relative group">
              <textarea
                value={smartText}
                onChange={(e) => setSmartText(e.target.value)}
                placeholder={t('diary.placeholder')}
                className="w-full min-h-[140px] p-5 bg-white border-2 border-neutral-100 rounded-2xl text-lg text-neutral-800 placeholder-neutral-300 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all resize-none shadow-inner"
                autoFocus
                aria-label="Meal description"
              />
              {/* Multi-modal Inputs with Tilt Effect */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                 <button 
                   className="p-2.5 rounded-xl bg-neutral-50 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 transition-transform hover:scale-105 hover:rotate-2 shadow-sm"
                   title="Speech to Text (Simulated)"
                   onClick={() => setSmartText(prev => prev + " (recorded audio)")}
                   aria-label="Use Microphone"
                 >
                    <Mic size={20} />
                 </button>
                 <button 
                   className="p-2.5 rounded-xl bg-neutral-50 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 transition-transform hover:scale-105 hover:-rotate-2 shadow-sm"
                   title="Scan Meal (Simulated)"
                   onClick={() => setSmartText("Grilled Chicken Caesar Salad")}
                   aria-label="Use Camera"
                 >
                    <Camera size={20} />
                 </button>
              </div>
            </div>

            <NutriButton 
              fullWidth 
              size="lg" 
              onClick={handleAnalyze} 
              isLoading={isAnalyzing}
              disabled={!smartText.trim()}
              icon={<Sparkles size={20} />}
              className="shadow-glow"
            >
              {isAnalyzing ? t('diary.analyzing') : t('diary.analyze')}
            </NutriButton>

            {/* Smart Suggestions & Analysis Result */}
            {(analysisResult || suggestions.length > 0) && (
               <div className="space-y-4 animate-scale-in">
                  
                  {/* Result Card */}
                  {analysisResult && (
                    <div className={`border rounded-2xl p-4 flex justify-between items-center ${getStatusColor(analysisResult.calories)}`}>
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                              <Check size={20} strokeWidth={3} />
                           </div>
                           <div>
                              <p className="font-bold text-lg">{analysisResult.name}</p>
                              <p className="text-xs opacity-80 font-mono">Parsed Successfully</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className="block font-mono font-bold text-2xl">{analysisResult.calories}</span>
                           <span className="text-[10px] uppercase font-bold">kcal</span>
                        </div>
                    </div>
                  )}

                  {/* Suggestions List */}
                  {suggestions.length > 0 && (
                     <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                           <Sparkles size={12}/> {t('diary.ai_suggestions')}
                        </p>
                        <div className="space-y-2">
                           {suggestions.map((s, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-xl border border-neutral-100 shadow-sm flex justify-between items-center group">
                                 <div className="flex items-center gap-2">
                                    <GripVertical size={16} className="text-neutral-300" />
                                    <span className="text-sm font-medium text-neutral-700">{s.name}</span>
                                 </div>
                                 <button 
                                   onClick={() => applySuggestion(s)}
                                   className="p-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors focus:ring-2 focus:ring-primary-500"
                                   aria-label={`Add suggestion ${s.name}`}
                                 >
                                    <Plus size={16} />
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {analysisResult && (
                    <div className="flex justify-center">
                        <button 
                        onClick={() => setActiveTab('manual')}
                        className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 py-2"
                        >
                        {t('diary.edit_details')} <ArrowRight size={12} />
                        </button>
                    </div>
                  )}
               </div>
            )}
          </div>
        )}

        {/* MANUAL MODE (Live Analysis) */}
        {activeTab === 'manual' && (
           <div className="space-y-6 animate-fade-in">
              <NutriInput 
                label={t('plan.manual.name')} 
                value={manualValues.name} 
                onChange={(e) => setManualValues({...manualValues, name: e.target.value})} 
                className="font-semibold text-lg"
              />
              
              {/* Live Analysis Dashboard */}
              <div className="bg-neutral-900 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden transition-all duration-300">
                 {/* Dynamic Background Glow */}
                 <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl opacity-30 transition-colors duration-500 ${manualValues.calories > 800 ? 'bg-red-500' : manualValues.calories > 500 ? 'bg-brand-orange' : 'bg-primary-500'}`}></div>
                 
                 <div className="flex justify-between items-end mb-5 relative z-10">
                    <div>
                       <p className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Activity size={12} /> {t('diary.live_analysis')}
                       </p>
                       <div className="text-4xl font-mono font-bold tracking-tight text-white flex items-baseline gap-1">
                          {manualValues.calories} <span className="text-sm text-neutral-500 font-sans">kcal</span>
                       </div>
                    </div>
                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${manualValues.calories > 800 ? 'bg-red-500/20 text-red-200' : 'bg-primary-500/20 text-primary-200'}`}>
                       {manualValues.calories > 800 ? <AlertTriangle size={12} /> : <Check size={12} />}
                       {manualValues.calories > 800 ? t('diary.high_density') : t('diary.balanced')}
                    </div>
                 </div>

                 {/* Macro Grid */}
                 <div className="grid grid-cols-3 gap-3 relative z-10">
                    {[
                      { l: 'Protein', v: manualValues.protein, c: 'text-primary-300' },
                      { l: 'Carbs', v: manualValues.carbs, c: 'text-green-300' },
                      { l: 'Fats', v: manualValues.fats, c: 'text-amber-300' }
                    ].map((m, i) => (
                      <div key={i} className="bg-white/10 rounded-xl p-3 backdrop-blur-md border border-white/5">
                         <p className="text-[10px] text-neutral-300 uppercase mb-1">{m.l}</p>
                         <p className={`text-xl font-mono font-bold ${m.c}`}>{m.v}g</p>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                 <NutriInput 
                    label={t('plan.manual.cals')} 
                    type="number" 
                    value={manualValues.calories} 
                    onChange={(e) => setManualValues({...manualValues, calories: Number(e.target.value)})} 
                    startIcon={<Activity size={16} />}
                 />
                 <div className="grid grid-cols-3 gap-3">
                    <NutriInput label={t('plan.manual.protein')} type="number" value={manualValues.protein} onChange={(e) => setManualValues({...manualValues, protein: Number(e.target.value)})} />
                    <NutriInput label={t('plan.manual.carbs')} type="number" value={manualValues.carbs} onChange={(e) => setManualValues({...manualValues, carbs: Number(e.target.value)})} />
                    <NutriInput label={t('plan.manual.fats')} type="number" value={manualValues.fats} onChange={(e) => setManualValues({...manualValues, fats: Number(e.target.value)})} />
                 </div>
              </div>

              <NutriButton fullWidth size="lg" onClick={handleSave} className="shadow-lg shadow-primary-500/20">
                 {initialMeal ? t('common.save') : t('diary.submit')}
              </NutriButton>
           </div>
        )}

      </div>
    </div>
  );
};