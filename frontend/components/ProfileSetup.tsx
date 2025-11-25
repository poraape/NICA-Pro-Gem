import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Gender, ActivityLevel, OnboardingMode, Biometrics, GoalItem, RoutineData, DietProfileKey } from '../types';
import { NutriInput } from './NutriInput';
import { NutriSelect } from './NutriSelect';
import { NutriButton } from './Button';
import { 
  User, Ruler, Weight, Target, ChevronRight, Sparkles, Clock, 
  Stethoscope, Activity, Lock, Utensils, CheckCircle2, ArrowLeft, 
  Zap, Heart, Pill, Moon, AlertCircle, GripVertical, ChevronUp, ChevronDown,
  AlertTriangle, Watch, Calendar, NotebookPen, Map, HandHeart
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { analyzeNarrative, dietStyleOptions, regionalOptions, spiritualOptions, getIdentityLabel, DietIdentityOption } from '../utils/personalization';

interface ProfileSetupProps {
  initialData?: Partial<UserProfile>;
  onSave: (profile: UserProfile) => void;
  isEditing?: boolean;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ initialData, onSave, isEditing = false }) => {
  const { t, language } = useLanguage();
  const [stepIndex, setStepIndex] = useState(isEditing ? 1 : 0);
  const [mode, setMode] = useState<OnboardingMode>('complete');
  
  // ------------------- STEPS CONFIGURATION -------------------
  // Dynamic labels based on language
  const steps = useMemo(() => {
    const complete = [
      { id: 'mode', icon: Zap, label: t('step.intro') },
      { id: 'bio', icon: User, label: t('step.bio') },
      { id: 'goals', icon: Target, label: t('step.goals') },
      { id: 'diet', icon: Utensils, label: t('step.diet') },
      { id: 'routine', icon: Clock, label: t('step.routine') },
      { id: 'allergy', icon: AlertTriangle, label: t('step.allergy') },
      { id: 'clinical', icon: Stethoscope, label: t('step.health') },
      { id: 'activity', icon: Activity, label: t('step.move') },
      { id: 'chrono', icon: Moon, label: t('step.sleep') },
      { id: 'privacy', icon: Lock, label: t('step.consent') },
      { id: 'review', icon: CheckCircle2, label: t('step.review') }
    ];

    const express = [
      { id: 'mode', icon: Zap, label: t('step.intro') },
      { id: 'bio', icon: User, label: t('step.bio') },
      { id: 'goals', icon: Target, label: t('step.goals') },
      { id: 'privacy', icon: Lock, label: t('step.consent') },
      { id: 'review', icon: CheckCircle2, label: t('step.review') }
    ];

    return { complete, express };
  }, [t]);

  // ------------------- STATE -------------------
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    onboardingMode: 'complete',
    language: language,
    name: '',
    biometrics: { age: 30, gender: Gender.MALE, height: 170, weight: 70 },
    clinical: { medicalConditions: [], medications: [] },
    lifestyle: { 
      activityLevel: ActivityLevel.MODERATE, exerciseFrequency: 3, exerciseTypes: [], 
      sleepQuality: 'average', stressLevel: 'moderate', smoking: false, alcoholIntake: 'Socially', caffeineIntake: 'Moderate',
      sleepDuration: 7, bedTime: '23:00', wakeTime: '07:00'
    },
    routine: { 
      dietaryPreference: 'omnivore',
      dietaryProfiles: ['mediterranean'],
      regionalStyles: [],
      spiritualPractices: [],
      personalNarrative: '',
      ritualCalendar: [],
      taboos: [],
      mealsPerDay: 3,
      preferredMealTimes: '08:00, 13:00, 20:00', 
      cookingTime: 'medium', allergies: [], intolerances: [], dislikes: [], favorites: [], culturalRestrictions: [], socialContext: 'Family' 
    },
    goals: { primary: 'loss', secondary: [], prioritizedGoals: [
        { id: 'loss', type: 'Weight Loss', priority: 1 },
        { id: 'energy', type: 'Daily Energy', priority: 2 },
        { id: 'health', type: 'Long-term Health', priority: 3 }
    ] },
    consent: { dataProcessing: true, analytics: true, camera: true, notifications: true },
    ...initialData
  });

  // Local helper inputs
  const [inputs, setInputs] = useState({
    allergies: initialData?.routine?.allergies?.join(', ') || '',
    meds: initialData?.clinical?.medications?.join(', ') || '',
    conditions: initialData?.clinical?.medicalConditions?.join(', ') || '',
    dislikes: initialData?.routine?.dislikes?.join(', ') || '',
    favorites: initialData?.routine?.favorites?.join(', ') || '',
    taboos: initialData?.routine?.taboos?.join(', ') || initialData?.routine?.culturalRestrictions?.join(', ') || '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [liveMetrics, setLiveMetrics] = useState({ bmr: 0, tdee: 0 });
  const [narrativeInsights, setNarrativeInsights] = useState(() =>
    analyzeNarrative(profile.routine?.personalNarrative || '', (profile.routine as RoutineData) || {} as RoutineData)
  );

  const currentSteps = mode === 'express' ? steps.express : steps.complete;
  const currentStepId = currentSteps[stepIndex]?.id || 'mode';

  // ------------------- EFFECTS -------------------
  // BMR/TDEE Calculator
  useEffect(() => {
    if (profile.biometrics && profile.lifestyle) {
      const { weight, height, age, gender } = profile.biometrics;
      const { activityLevel } = profile.lifestyle;
      
      if (weight && height && age && gender && activityLevel) {
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        bmr += (gender === Gender.MALE ? 5 : -161);
        
        const multipliers = {
          [ActivityLevel.SEDENTARY]: 1.2,
          [ActivityLevel.LIGHT]: 1.375,
          [ActivityLevel.MODERATE]: 1.55,
          [ActivityLevel.VERY]: 1.725,
          [ActivityLevel.EXTRA]: 1.9
        };
        const tdee = Math.round(bmr * (multipliers[activityLevel] || 1.2));
        setLiveMetrics({ bmr: Math.round(bmr), tdee });
      }
    }
  }, [profile.biometrics, profile.lifestyle]);

  useEffect(() => {
    setNarrativeInsights(
      analyzeNarrative(
        profile.routine?.personalNarrative || '',
        (profile.routine as RoutineData) || ({} as RoutineData)
      )
    );
  }, [
    profile.routine?.personalNarrative,
    profile.routine?.dietaryProfiles,
    profile.routine?.regionalStyles,
    profile.routine?.spiritualPractices
  ]);

  const vibrate = (pattern: number | number[] = 5) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  // ------------------- HANDLERS -------------------
  const handleBioChange = (field: keyof Biometrics, val: any) => {
    setProfile(prev => ({ ...prev, biometrics: { ...prev.biometrics!, [field]: val } }));
    if (errors[field]) setErrors(prev => { const n = {...prev}; delete n[field]; return n; });
  };

  const handleGoalReorder = (index: number, direction: 'up' | 'down') => {
    const goals = [...(profile.goals?.prioritizedGoals || [])];
    if (direction === 'up' && index > 0) {
      [goals[index], goals[index - 1]] = [goals[index - 1], goals[index]];
    } else if (direction === 'down' && index < goals.length - 1) {
      [goals[index], goals[index + 1]] = [goals[index + 1], goals[index]];
    }
    goals.forEach((g, i) => g.priority = i + 1);
    setProfile(prev => ({...prev, goals: {...prev.goals!, prioritizedGoals: goals}}));
    vibrate(10);
  };

  const handleRoutineChange = (field: keyof RoutineData, val: any) => {
    setProfile(prev => ({ ...prev, routine: { ...prev.routine!, [field]: val } }));
  };

  const handleTextListChange = (key: keyof typeof inputs, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
    const arrayVal = val.split(',').map(s => s.trim()).filter(Boolean);
    
    if (key === 'allergies') handleRoutineChange('allergies', arrayVal);
    if (key === 'dislikes') handleRoutineChange('dislikes', arrayVal);
    if (key === 'favorites') handleRoutineChange('favorites', arrayVal);
    if (key === 'taboos') {
      handleRoutineChange('taboos', arrayVal);
      handleRoutineChange('culturalRestrictions', arrayVal);
    }
    if (key === 'meds') setProfile(p => ({...p, clinical: {...p.clinical!, medications: arrayVal}}));
    if (key === 'conditions') setProfile(p => ({...p, clinical: {...p.clinical!, medicalConditions: arrayVal}}));
  };

  const toggleIdentitySelection = (field: 'dietaryProfiles' | 'regionalStyles' | 'spiritualPractices', value: DietProfileKey) => {
    setProfile(prev => {
      const current = (prev.routine?.[field] as DietProfileKey[]) || [];
      const exists = current.includes(value);
      const updated = exists ? current.filter(v => v !== value) : [...current, value];
      return { ...prev, routine: { ...prev.routine!, [field]: updated } };
    });
    vibrate(10);
  };

  const handleNarrativeChange = (val: string) => {
    setProfile(prev => ({ ...prev, routine: { ...prev.routine!, personalNarrative: val } }));
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStepId === 'bio') {
      if (!profile.name) newErrors.name = "Required";
      if (!profile.biometrics?.age) newErrors.age = "Required";
      if (!profile.biometrics?.height) newErrors.height = "Required";
      if (!profile.biometrics?.weight) newErrors.weight = "Required";
    }
    
    if (currentStepId === 'privacy') {
        if (!profile.consent?.dataProcessing) newErrors.consent = "Required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      vibrate([50, 50, 50]); // Error pattern
      isValid = false;
    } else {
      setErrors({});
      vibrate(15); // Success pattern
    }
    return isValid;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    if (stepIndex < currentSteps.length - 1) {
      setStepIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      finishSetup();
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const skipStep = () => {
      // Logic to allow skipping non-essential steps
      setStepIndex(prev => Math.min(prev + 1, currentSteps.length - 1));
      vibrate(5);
  };

  const jumpToStep = (id: string) => {
      const idx = currentSteps.findIndex(s => s.id === id);
      if (idx !== -1) setStepIndex(idx);
  };

  const finishSetup = () => {
    setLoading(true);
    setTimeout(() => {
      const finalProfile: UserProfile = {
        id: initialData?.id || crypto.randomUUID(),
        onboardingMode: mode,
        language: language,
        name: profile.name!,
        biometrics: profile.biometrics!,
        clinical: profile.clinical!,
        lifestyle: profile.lifestyle!,
        routine: profile.routine!,
        goals: profile.goals!,
        consent: profile.consent!,
        bmr: liveMetrics.bmr,
        tdee: liveMetrics.tdee
      };
      onSave(finalProfile);
      setLoading(false);
    }, 800);
  };

  const renderHeader = (title: string, sub: string, icon: React.ReactNode) => (
    <div className="text-center mb-8 animate-fade-in">
       <div className="w-16 h-16 bg-primary-50 rounded-2xl mx-auto flex items-center justify-center text-primary-600 mb-4 shadow-glow">
          {icon}
       </div>
       <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">{title}</h2>
       <p className="text-neutral-500 mt-2 text-lg">{sub}</p>
    </div>
  );

  const renderIdentityCard = (
    option: DietIdentityOption,
    selected: DietProfileKey[],
    onToggle: (value: DietProfileKey) => void
  ) => {
    const isSelected = selected.includes(option.value);
    return (
      <button
        key={option.value}
        onClick={() => onToggle(option.value)}
        className={`relative w-full text-left p-4 rounded-2xl border transition-all group overflow-hidden bg-gradient-to-r ${option.accent || 'from-white to-white'} ${
          isSelected ? 'border-primary-400 shadow-glow ring-2 ring-primary-200' : 'border-neutral-200 hover:border-primary-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{option.emoji || '✨'}</span>
          <div>
            <p className="font-semibold text-neutral-800">{option.label}</p>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{option.description}</p>
          </div>
        </div>
        {option.examples?.length ? (
          <div className="flex flex-wrap gap-2 mt-3">
            {option.examples.map((ex) => (
              <span key={ex} className="px-2 py-1 rounded-full bg-white/70 border text-[11px] text-neutral-500 border-neutral-200">
                {ex}
              </span>
            ))}
          </div>
        ) : null}
        {isSelected && (
          <span className="absolute top-3 right-3 text-xs font-semibold text-primary-600 bg-white px-2 py-1 rounded-full shadow-sm">
            {t('common.recommended')}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={`min-h-[90vh] flex flex-col items-center justify-center ${!isEditing ? 'py-12' : ''}`}>
      
      {/* PROGRESS BAR */}
      <div className="w-full max-w-2xl mb-10 px-6">
        <div className="flex justify-between mb-3 overflow-x-auto pb-2 no-scrollbar">
           {currentSteps.map((s, idx) => (
             <div key={s.id} className={`flex flex-col items-center min-w-[30px] transition-colors duration-500 ${idx <= stepIndex ? 'text-primary-600' : 'text-neutral-300'}`}>
               <div className={`w-2.5 h-2.5 rounded-full ${idx <= stepIndex ? 'bg-primary-500 scale-125' : 'bg-neutral-200'} transition-all duration-300`}/>
             </div>
           ))}
        </div>
        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden shadow-inner">
           <div 
             className="h-full bg-primary-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(32,129,146,0.5)]"
             style={{ width: `${((stepIndex + 1) / currentSteps.length) * 100}%` }}
           />
        </div>
      </div>

      {/* GLASS CARD CONTAINER */}
      <div className={`w-full max-w-3xl glass-panel rounded-[32px] shadow-glass p-6 md:p-12 transition-all duration-500 animate-slide-up relative overflow-hidden bg-white/70`}>
        
        {/* Background Decorative Blob */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>

        {/* --- M1: MODE --- */}
        {currentStepId === 'mode' && (
          <div className="space-y-8 text-center relative z-10">
            {renderHeader(t('setup.title'), t('setup.subtitle'), <Sparkles size={32}/>)}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <button onClick={() => { setMode('express'); setStepIndex(1); vibrate(); }} className="group p-8 border-2 border-white bg-white/50 backdrop-blur rounded-3xl hover:border-primary-400 hover:shadow-glow text-left transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-primary-100 w-12 h-12 flex items-center justify-center rounded-xl text-primary-600 mb-4 group-hover:scale-110 transition-transform"><Zap size={24} /></div>
                  <h3 className="font-bold text-xl text-neutral-900 mb-2">{t('setup.express')}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{t('setup.express.desc')}</p>
               </button>
               <button onClick={() => { setMode('complete'); setStepIndex(1); vibrate(); }} className="group p-8 border-2 border-primary-500 bg-primary-50/30 backdrop-blur rounded-3xl shadow-glow text-left relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
                  <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">{t('common.recommended')}</div>
                  <div className="bg-primary-600 w-12 h-12 flex items-center justify-center rounded-xl text-white mb-4 group-hover:scale-110 transition-transform"><CheckCircle2 size={24} /></div>
                  <h3 className="font-bold text-xl text-neutral-900 mb-2">{t('setup.complete')}</h3>
                  <p className="text-sm text-neutral-700 leading-relaxed">{t('setup.complete.desc')}</p>
               </button>
            </div>
          </div>
        )}

        {/* --- M1: BIO --- */}
        {currentStepId === 'bio' && (
           <div className="space-y-8 relative z-10 animate-fade-in">
              {renderHeader(t('setup.bio'), t('setup.bio.desc'), <User size={32}/>)}
              <div className="space-y-6">
                <NutriInput label={t('label.name')} value={profile.name} onChange={e => {setProfile({...profile, name: e.target.value}); if(errors.name) setErrors({...errors, name: ''})}} error={errors.name} autoFocus />
                <div className="grid grid-cols-2 gap-6">
                   <NutriInput label={t('label.age')} type="number" value={profile.biometrics?.age} onChange={e => handleBioChange('age', Number(e.target.value))} error={errors.age} />
                   <NutriSelect label={t('label.gender')} options={[{value: 'Male', label: t('opt.male')}, {value: 'Female', label: t('opt.female')}]} value={profile.biometrics?.gender} onChange={e => handleBioChange('gender', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <NutriInput label={t('label.height')} type="number" startIcon={<Ruler size={18}/>} value={profile.biometrics?.height} onChange={e => handleBioChange('height', Number(e.target.value))} error={errors.height} />
                   <NutriInput label={t('label.weight')} type="number" startIcon={<Weight size={18}/>} value={profile.biometrics?.weight} onChange={e => handleBioChange('weight', Number(e.target.value))} error={errors.weight} />
                </div>
                {mode === 'complete' && (
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-neutral-200/50">
                     <NutriInput label="Body Fat %" type="number" value={profile.biometrics?.bodyFatPercentage || ''} onChange={e => handleBioChange('bodyFatPercentage', Number(e.target.value))} tooltip="Optional: Improves TDEE accuracy" />
                     <NutriInput label="Waist (cm)" type="number" value={profile.biometrics?.waistCircumference || ''} onChange={e => handleBioChange('waistCircumference', Number(e.target.value))} tooltip="Optional: Clinical risk indicator" />
                  </div>
                )}
              </div>
           </div>
        )}

        {/* --- M2: GOALS --- */}
        {currentStepId === 'goals' && (
          <div className="space-y-8 relative z-10 animate-fade-in">
             {renderHeader(t('setup.goals.title'), t('setup.goals.desc'), <Target size={32}/>)}
             <div className="space-y-3">
                {profile.goals?.prioritizedGoals?.map((goal, idx) => (
                  <div key={goal.id} className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-2xl shadow-sm transition-all hover:border-primary-300">
                    <div className="flex flex-col gap-1 text-neutral-400">
                       <button onClick={() => handleGoalReorder(idx, 'up')} disabled={idx === 0} className="hover:text-primary-500 disabled:opacity-30"><ChevronUp size={20}/></button>
                       <button onClick={() => handleGoalReorder(idx, 'down')} disabled={idx === (profile.goals?.prioritizedGoals?.length || 0) - 1} className="hover:text-primary-500 disabled:opacity-30"><ChevronDown size={20}/></button>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                      {goal.priority}
                    </div>
                    <div className="flex-1 font-semibold text-neutral-800">{t(`opt.${goal.id}`) || goal.type}</div>
                    <GripVertical className="text-neutral-300 cursor-grab" />
                  </div>
                ))}
             </div>
             <div className="pt-4">
               <NutriInput label={t('label.core_motivation')} value={profile.goals?.motivation || ''} onChange={e => setProfile(p => ({...p, goals: {...p.goals!, motivation: e.target.value}}))} placeholder="E.g. Wedding in 3 months" startIcon={<Heart size={18} className="text-primary-400"/>} />
             </div>
          </div>
        )}

        {/* --- M3: PREFERENCES (Diet) --- */}
        {currentStepId === 'diet' && (
          <div className="space-y-8 relative z-10 animate-fade-in">
             {renderHeader(t('setup.diet.title'), t('setup.diet.desc'), <Utensils size={32}/>)}
             
             <div className="bg-white/70 border border-neutral-200 rounded-3xl p-5 shadow-glass">
               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                 <div>
                   <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{t('setup.diet.multi_title')}</p>
                   <p className="text-neutral-600 text-sm">{t('setup.diet.multi_desc')}</p>
                 </div>
                 <span className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-full border border-primary-100 shadow-inner">{t('setup.diet.badge')}</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {dietStyleOptions.map((opt) => renderIdentityCard(opt, profile.routine?.dietaryProfiles || [], (value) => toggleIdentitySelection('dietaryProfiles', value)))}
               </div>
             </div>

             <div className="bg-white/70 border border-emerald-100 rounded-3xl p-5 shadow-glass">
               <div className="flex items-start gap-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700"><Map size={18}/></div>
                 <div>
                   <p className="text-sm font-semibold text-neutral-800">{t('setup.diet.regionals')}</p>
                   <p className="text-neutral-600 text-sm">{t('setup.diet.regionals.desc')}</p>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                 {regionalOptions.map((opt) => renderIdentityCard(opt, profile.routine?.regionalStyles || [], (value) => toggleIdentitySelection('regionalStyles', value)))}
               </div>
             </div>

             <div className="bg-white/70 border border-indigo-100 rounded-3xl p-5 shadow-glass">
               <div className="flex items-start gap-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700"><HandHeart size={18}/></div>
                 <div>
                   <p className="text-sm font-semibold text-neutral-800">{t('setup.diet.spiritual')}</p>
                   <p className="text-neutral-600 text-sm">{t('setup.diet.spiritual.desc')}</p>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                 {spiritualOptions.map((opt) => renderIdentityCard(opt, profile.routine?.spiritualPractices || [], (value) => toggleIdentitySelection('spiritualPractices', value)))}
               </div>
             </div>

             <div className="bg-white/80 border border-neutral-200 rounded-3xl p-6 shadow-glass space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NutriSelect 
                    label={t('label.diet')} 
                    options={[
                      { value: 'omnivore', label: t('opt.omnivore') || 'Onívoro flex' },
                      { value: 'vegetarian', label: t('opt.vegetarian') || 'Vegetariano' },
                      { value: 'vegan', label: t('opt.vegan') || 'Vegano' },
                      { value: 'plant_based', label: t('opt.plant_based') || 'Plant-based' },
                      { value: 'pescatarian', label: t('opt.pescatarian') || 'Pescetariana' },
                      { value: 'low_carb', label: t('opt.low_carb') || 'Low-carb' },
                      { value: 'keto', label: t('opt.keto') || 'Cetogênica' },
                      { value: 'paleo', label: t('opt.paleo') || 'Paleolítica' },
                      { value: 'dash', label: t('opt.dash') || 'DASH' },
                      { value: 'mediterranean', label: t('opt.mediterranean') || 'Mediterrânea' },
                    ]} 
                    value={profile.routine?.dietaryPreference} 
                    onChange={e => handleRoutineChange('dietaryPreference', e.target.value)} 
                  />
                  <NutriSelect 
                    label={t('label.cooking')} 
                    options={['low', 'medium', 'high'].map(v => ({value: v, label: t(`opt.${v}`)}))} 
                    value={profile.routine?.cookingTime} 
                    onChange={e => handleRoutineChange('cookingTime', e.target.value)} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NutriInput label={t('label.dislikes')} value={inputs.dislikes} onChange={e => handleTextListChange('dislikes', e.target.value)} placeholder={t('placeholder.dislikes')} />
                  <NutriInput label={t('label.taboos')} value={inputs.taboos} onChange={e => handleTextListChange('taboos', e.target.value)} placeholder={t('placeholder.taboos')} />
                </div>
             </div>

             <div className="bg-gradient-to-r from-amber-50 via-white to-primary-50 border border-primary-100 rounded-3xl p-6 shadow-glass space-y-4">
               <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700">
                    <NotebookPen size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{t('setup.story.title')}</p>
                    <p className="text-neutral-600 text-sm">{t('setup.story.subtitle')}</p>
                  </div>
               </div>
               <textarea 
                 value={profile.routine?.personalNarrative || ''}
                 onChange={e => handleNarrativeChange(e.target.value)}
                 placeholder={t('setup.story.placeholder')}
                 className="w-full min-h-[140px] rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-neutral-800 shadow-inner focus:outline-none focus:ring-4 focus:ring-primary-100"
               />
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                    <p className="text-xs uppercase tracking-wide font-semibold text-primary-600 mb-2">{t('setup.story.insights')}</p>
                    <div className="flex flex-wrap gap-2">
                      {(narrativeInsights.tags.length ? narrativeInsights.tags : [t('setup.story.empty')]).map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-full bg-primary-50 text-primary-700 text-[11px] font-semibold border border-primary-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                    <p className="text-xs uppercase tracking-wide font-semibold text-emerald-600 mb-2">{t('setup.story.adaptations')}</p>
                    <ul className="space-y-2 text-sm text-neutral-600 list-disc list-inside">
                      {(narrativeInsights.adaptations.length ? narrativeInsights.adaptations : [t('setup.story.adaptations.empty')]).map(item => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                    <p className="text-xs uppercase tracking-wide font-semibold text-indigo-600 mb-2">{t('setup.story.ritual')}</p>
                    <ul className="space-y-2 text-sm text-neutral-600 list-disc list-inside">
                      {(narrativeInsights.ritualNotices.length ? narrativeInsights.ritualNotices : [t('setup.story.ritual.empty')]).map(item => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-neutral-500">{narrativeInsights.celebration}</p>
                  </div>
               </div>
             </div>
          </div>
        )}

        {/* --- M4: ROUTINE --- */}
        {currentStepId === 'routine' && (
           <div className="space-y-8 relative z-10 animate-fade-in">
              {renderHeader(t('setup.routine.title'), t('setup.routine.desc'), <Clock size={32}/>)}
              <div className="bg-white/50 p-6 rounded-3xl border border-neutral-200">
                 <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-neutral-700">{t('label.meals_per_day')}</span>
                    <span className="text-2xl font-bold text-primary-600">{profile.routine?.mealsPerDay}</span>
                 </div>
                 <input 
                   type="range" min="2" max="6" step="1"
                   value={profile.routine?.mealsPerDay}
                   onChange={e => handleRoutineChange('mealsPerDay', Number(e.target.value))}
                   className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                 />
                 <div className="flex justify-between text-xs text-neutral-400 mt-2 font-medium">
                    <span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
                 </div>
              </div>
              <NutriInput label={t('label.preferred_times')} value={profile.routine?.preferredMealTimes} onChange={e => handleRoutineChange('preferredMealTimes', e.target.value)} helperText="Comma separated (e.g. 08:00, 12:00)" />
              <NutriSelect label={t('label.social_context')} options={[{value: 'Alone', label: t('opt.alone')}, {value: 'Family', label: t('opt.family')}, {value: 'Social', label: t('opt.social')}]} value={profile.routine?.socialContext} onChange={e => handleRoutineChange('socialContext', e.target.value)} />
           </div>
        )}

        {/* --- M5: ALLERGIES --- */}
        {currentStepId === 'allergy' && (
            <div className="space-y-8 relative z-10 animate-fade-in">
                {renderHeader(t('setup.allergy.title'), t('setup.allergy.desc'), <AlertTriangle size={32}/>)}
                <div className="space-y-4">
                    <label className="text-sm font-medium text-neutral-600 ml-1">{t('label.allergies')}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Gluten', 'Dairy', 'Nuts', 'Shellfish', 'Pork', 'Eggs'].map(item => {
                        const isSelected = inputs.allergies.includes(item);
                        return (
                        <button 
                            key={item}
                            onClick={() => {
                            const current = inputs.allergies.split(', ').filter(Boolean);
                            const next = isSelected ? current.filter(i => i !== item) : [...current, item];
                            handleTextListChange('allergies', next.join(', '));
                            }}
                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${isSelected ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-neutral-200 text-neutral-600 hover:border-primary-300'}`}
                        >
                            {item}
                        </button>
                        )
                    })}
                    </div>
                    <NutriInput label={t('label.allergies')} value={inputs.allergies} onChange={e => handleTextListChange('allergies', e.target.value)} placeholder="Type specific allergies..." />
                </div>
            </div>
        )}

        {/* --- M6: CLINICAL --- */}
        {currentStepId === 'clinical' && (
           <div className="space-y-8 relative z-10 animate-fade-in">
              {renderHeader(t('setup.health.title'), t('setup.health.desc'), <Stethoscope size={32}/>)}
              <NutriInput label={t('label.medical')} value={inputs.conditions} onChange={e => handleTextListChange('conditions', e.target.value)} startIcon={<Activity size={18}/>} placeholder="Diabetes, Hypertension, PCOS..." />
              <NutriInput label={t('label.medications')} value={inputs.meds} onChange={e => handleTextListChange('meds', e.target.value)} startIcon={<Pill size={18}/>} placeholder="Metformin 500mg, Whey Protein..." />
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 text-sm text-amber-800">
                 <Lock className="shrink-0" size={18} />
                 <p className="leading-relaxed">{t('setup.health_encrypt')}</p>
              </div>
           </div>
        )}

        {/* --- M7: ACTIVITY --- */}
        {currentStepId === 'activity' && (
           <div className="space-y-8 relative z-10 animate-fade-in">
              {renderHeader(t('setup.move.title'), t('setup.move.desc'), <Activity size={32}/>)}
              <NutriSelect label={t('label.activity')} options={Object.values(ActivityLevel).map(v => ({value: v, label: t(`opt.${v.toLowerCase().split(' ')[0]}`) || v}))} value={profile.lifestyle?.activityLevel} onChange={e => setProfile(p => ({...p, lifestyle: {...p.lifestyle!, activityLevel: e.target.value as any}}))} />
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary-100 p-2 rounded-lg text-primary-600"><Zap size={20}/></div>
                    <span className="font-bold text-neutral-800">{t('label.workouts')}</span>
                 </div>
                 <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(n => (
                       <button key={n} onClick={() => setProfile(p => ({...p, lifestyle: {...p.lifestyle!, exerciseFrequency: n}}))} className={`flex-1 py-3 rounded-xl font-bold transition-all ${profile.lifestyle?.exerciseFrequency === n ? 'bg-primary-500 text-white shadow-md scale-105' : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100'}`}>{n}</button>
                    ))}
                 </div>
              </div>
              <div className="flex items-center gap-3 text-neutral-500 text-sm p-4 bg-neutral-50 rounded-xl">
                 <Watch size={20} />
                 <span>{t('setup.wearable_unavailable')}</span>
              </div>
           </div>
        )}

        {/* --- M8: CHRONO --- */}
        {currentStepId === 'chrono' && (
           <div className="space-y-8 relative z-10 animate-fade-in">
              {renderHeader(t('setup.sleep.title'), t('setup.sleep.desc'), <Moon size={32}/>)}
              <div className="grid grid-cols-2 gap-6">
                 <NutriInput label={t('label.bed_time')} type="time" value={profile.lifestyle?.bedTime} onChange={e => setProfile(p => ({...p, lifestyle: {...p.lifestyle!, bedTime: e.target.value}}))} />
                 <NutriInput label={t('label.wake_time')} type="time" value={profile.lifestyle?.wakeTime} onChange={e => setProfile(p => ({...p, lifestyle: {...p.lifestyle!, wakeTime: e.target.value}}))} />
              </div>
              <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-4">
                 <Moon className="text-indigo-500" size={24} />
                 <div>
                    <h4 className="font-bold text-indigo-900">{t('label.sleep')}</h4>
                    <p className="text-xs text-indigo-600 mb-2">Impacts cortisol & insulin sensitivity</p>
                    <div className="flex gap-2 mt-2">
                       {['poor', 'average', 'good', 'excellent'].map(q => (
                          <button key={q} onClick={() => setProfile(p => ({...p, lifestyle: {...p.lifestyle!, sleepQuality: q as any}}))} className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-colors ${profile.lifestyle?.sleepQuality === q ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-300'}`}>{t(`opt.${q}`)}</button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* --- M9: CONSENT --- */}
        {currentStepId === 'privacy' && (
           <div className="space-y-8 relative z-10 animate-fade-in">
              {renderHeader(t('setup.consent.title'), t('setup.consent.desc'), <Lock size={32}/>)}
              <div className="space-y-4">
                 {[
                   { k: 'dataProcessing', l: t('settings.consent_processing'), req: true },
                   { k: 'camera', l: t('settings.consent_camera'), req: false },
                   { k: 'analytics', l: t('settings.consent_analytics'), req: false }
                 ].map((item) => (
                    <label key={item.k} className={`flex items-center gap-4 p-5 bg-white border rounded-2xl cursor-pointer hover:border-primary-300 hover:shadow-sm transition-all ${errors.consent && item.req ? 'border-error-500 ring-1 ring-error-500' : 'border-neutral-200'}`}>
                       <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            checked={(profile.consent as any)[item.k]} 
                            onChange={e => { vibrate(); setProfile(p => ({...p, consent: {...p.consent!, [item.k]: e.target.checked}})) }}
                            className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border border-neutral-300 transition-all checked:border-primary-500 checked:bg-primary-500"
                          />
                          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                             <CheckCircle2 size={16} />
                          </div>
                       </div>
                       <div>
                          <p className="font-bold text-neutral-800">{item.l}</p>
                          {item.req && <span className="text-xs text-primary-500 font-semibold uppercase tracking-wider">Required</span>}
                       </div>
                    </label>
                 ))}
              </div>
           </div>
        )}

        {/* --- M10: REVIEW --- */}
        {currentStepId === 'review' && (
           <div className="text-center space-y-8 relative z-10 animate-fade-in">
              <div className="w-24 h-24 bg-gradient-to-tr from-primary-400 to-primary-600 rounded-full mx-auto flex items-center justify-center text-white shadow-glow animate-scale-in">
                 <Sparkles size={48} />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-neutral-900">{t('setup.ready')}</h3>
                <p className="text-neutral-500 mt-2">{t('setup.ready.desc')}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
                 <div className="bg-white/60 backdrop-blur p-5 rounded-2xl border border-white shadow-sm hover:border-primary-300 transition-colors cursor-pointer" onClick={() => jumpToStep('bio')}>
                    <div className="flex justify-between">
                        <p className="text-xs text-neutral-400 uppercase tracking-wider font-bold mb-1">{t('setup.metabolic_rate')}</p>
                        <Edit2Icon />
                    </div>
                    <p className="text-2xl font-bold text-neutral-800">{liveMetrics.tdee} <span className="text-sm font-normal text-neutral-500">kcal</span></p>
                 </div>
                 <div className="bg-white/60 backdrop-blur p-5 rounded-2xl border border-white shadow-sm hover:border-primary-300 transition-colors cursor-pointer" onClick={() => jumpToStep('goals')}>
                    <div className="flex justify-between">
                        <p className="text-xs text-neutral-400 uppercase tracking-wider font-bold mb-1">{t('setup.primary_goal')}</p>
                        <Edit2Icon />
                    </div>
                    <p className="text-2xl font-bold text-primary-600 capitalize text-ellipsis overflow-hidden whitespace-nowrap">{t(`opt.${profile.goals?.prioritizedGoals?.[0]?.id}`) || profile.goals?.primary}</p>
                 </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                 {profile.clinical?.medicalConditions?.map(c => <span key={c} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100">{c}</span>)}
                 {profile.routine?.dietaryPreference && <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100" onClick={() => jumpToStep('diet')}>{profile.routine.dietaryPreference}</span>}
                 <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-bold border border-neutral-200" onClick={() => jumpToStep('activity')}>{t(`opt.${profile.lifestyle?.activityLevel?.toLowerCase().split(' ')[0]}`) || profile.lifestyle?.activityLevel}</span>
                 {(profile.routine?.dietaryProfiles || []).map((dp) => (
                   <span key={dp} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold border border-primary-100" onClick={() => jumpToStep('diet')}>
                     {getIdentityLabel(dp)}
                   </span>
                 ))}
                 {(profile.routine?.regionalStyles || []).map((dp) => (
                   <span key={dp} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100" onClick={() => jumpToStep('diet')}>
                     {getIdentityLabel(dp)}
                   </span>
                 ))}
                 {(profile.routine?.spiritualPractices || []).map((dp) => (
                   <span key={dp} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100" onClick={() => jumpToStep('diet')}>
                     {getIdentityLabel(dp)}
                   </span>
                 ))}
              </div>
           </div>
        )}

        {/* NAVIGATION ACTIONS */}
        <div className="pt-10 flex items-center justify-between mt-auto border-t border-neutral-100/50 relative z-20">
           {stepIndex > 0 ? (
             <button 
                onClick={() => { vibrate(); prevStep(); }}
                className="flex items-center gap-2 text-neutral-400 hover:text-neutral-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-neutral-100/50"
             >
               <ArrowLeft size={20} /> <span className="hidden sm:inline">{t('common.back')}</span>
             </button>
           ) : <div/>}

           <div className="flex gap-4">
              {/* Skip button for optional steps */}
              {['allergy', 'activity', 'chrono'].includes(currentStepId) && (
                  <button onClick={() => { vibrate(); skipStep(); }} className="text-neutral-400 hover:text-primary-500 font-medium text-sm transition-colors">
                      {t('common.skip')}
                  </button>
              )}

              <NutriButton 
                onClick={() => { vibrate(); nextStep(); }} 
                isLoading={loading} 
                size="lg"
                className="shadow-xl shadow-primary-500/20"
                icon={currentStepId === 'review' ? <Sparkles size={20}/> : <ChevronRight size={20}/>}
              >
                {currentStepId === 'review' ? t('common.generate') : t('common.next')}
              </NutriButton>
           </div>
        </div>

      </div>
    </div>
  );
};

// Helper for the small edit icon
const Edit2Icon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
);
