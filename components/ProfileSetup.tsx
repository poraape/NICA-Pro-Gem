
import React, { useState, useEffect } from 'react';
import { UserProfile, Gender, ActivityLevel, OnboardingMode, Biometrics, ClinicalData, LifestyleData, RoutineData, GoalsData, UserConsent } from '../types';
import { NutriInput } from './NutriInput';
import { NutriSelect } from './NutriSelect';
import { NutriButton } from './Button';
import { 
  User, Ruler, Weight, Target, ChevronRight, Sparkles, Brain, Clock, Moon, Leaf, 
  Stethoscope, AlarmClock, Zap, CheckCircle2, ArrowLeft, ShieldCheck, Activity,
  Lock, Utensils, HeartPulse, Wine
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileSetupProps {
  initialData?: Partial<UserProfile>;
  onSave: (profile: UserProfile) => void;
  isEditing?: boolean;
}

const STEPS_COMPLETE = [
  { id: 'mode', icon: Zap },
  { id: 'bio', icon: User },      // A. Antropometria
  { id: 'clinical', icon: Stethoscope }, // E. Saúde
  { id: 'lifestyle', icon: Activity },   // D, F, G, J. Rotina/Sono/Social
  { id: 'diet', icon: Utensils },        // B. Preferências
  { id: 'goals', icon: Target },         // C. Objetivos
  { id: 'privacy', icon: Lock },         // H, I, M. Privacidade
  { id: 'review', icon: CheckCircle2 }
];

const STEPS_EXPRESS = [
  { id: 'mode', icon: Zap },
  { id: 'bio', icon: User },
  { id: 'goals', icon: Target },
  { id: 'review', icon: CheckCircle2 }
];

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ initialData, onSave, isEditing = false }) => {
  const { t, language } = useLanguage();
  const [stepIndex, setStepIndex] = useState(isEditing ? 1 : 0);
  const [mode, setMode] = useState<OnboardingMode>('complete');
  
  // Initialize Complex State with Defaults
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    onboardingMode: 'complete',
    language: language,
    name: '',
    biometrics: { age: 30, gender: Gender.MALE, height: 170, weight: 70 },
    clinical: { medicalConditions: [], medications: [] },
    lifestyle: { 
      activityLevel: ActivityLevel.MODERATE, exerciseFrequency: 3, exerciseTypes: [], 
      sleepQuality: 'average', stressLevel: 'moderate', smoking: false, alcoholIntake: 'Socially', caffeineIntake: 'Moderate' 
    },
    routine: { 
      dietaryPreference: 'omnivore', mealsPerDay: 3, preferredMealTimes: '08:00, 13:00, 20:00', 
      cookingTime: 'medium', allergies: [], intolerances: [], dislikes: [], favorites: [], culturalRestrictions: [], socialContext: 'Family' 
    },
    goals: { primary: 'loss', secondary: [] },
    consent: { dataProcessing: true, analytics: true, camera: true, notifications: true },
    ...initialData
  });

  // Local state for comma-separated inputs
  const [inputs, setInputs] = useState({
    allergies: initialData?.routine?.allergies?.join(', ') || '',
    meds: initialData?.clinical?.medications?.join(', ') || '',
    conditions: initialData?.clinical?.medicalConditions?.join(', ') || '',
    dislikes: initialData?.routine?.dislikes?.join(', ') || '',
    favorites: initialData?.routine?.favorites?.join(', ') || '',
    secondaryGoals: initialData?.goals?.secondary?.join(', ') || '',
  });

  const [loading, setLoading] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState({ bmr: 0, tdee: 0 });

  const currentSteps = mode === 'express' ? STEPS_EXPRESS : STEPS_COMPLETE;
  const currentStepId = currentSteps[stepIndex].id;

  // Calculators
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

  // Handlers
  const handleBioChange = (field: keyof Biometrics, val: any) => {
    setProfile(prev => ({ ...prev, biometrics: { ...prev.biometrics!, [field]: val } }));
  };

  const handleLifestyleChange = (field: keyof LifestyleData, val: any) => {
    setProfile(prev => ({ ...prev, lifestyle: { ...prev.lifestyle!, [field]: val } }));
  };

  const handleRoutineChange = (field: keyof RoutineData, val: any) => {
    setProfile(prev => ({ ...prev, routine: { ...prev.routine!, [field]: val } }));
  };
  
  const handleGoalsChange = (field: keyof GoalsData, val: any) => {
    setProfile(prev => ({ ...prev, goals: { ...prev.goals!, [field]: val } }));
  };

  const handleTextListChange = (key: keyof typeof inputs, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
    // Update profile based on key
    if (key === 'allergies') handleRoutineChange('allergies', val.split(',').map(s => s.trim()).filter(Boolean));
    if (key === 'dislikes') handleRoutineChange('dislikes', val.split(',').map(s => s.trim()).filter(Boolean));
    if (key === 'favorites') handleRoutineChange('favorites', val.split(',').map(s => s.trim()).filter(Boolean));
    if (key === 'meds') setProfile(p => ({...p, clinical: {...p.clinical!, medications: val.split(',').map(s => s.trim()).filter(Boolean)}}));
    if (key === 'conditions') setProfile(p => ({...p, clinical: {...p.clinical!, medicalConditions: val.split(',').map(s => s.trim()).filter(Boolean)}}));
    if (key === 'secondaryGoals') setProfile(p => ({...p, goals: {...p.goals!, secondary: val.split(',').map(s => s.trim()).filter(Boolean)}}));
  };

  const nextStep = () => {
    if (stepIndex < currentSteps.length - 1) setStepIndex(prev => prev + 1);
    else finishSetup();
  };

  const prevStep = () => {
    if (stepIndex > 0) setStepIndex(prev => prev - 1);
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

  // Render Logic
  return (
    <div className={`min-h-[80vh] flex flex-col items-center justify-center ${!isEditing ? 'py-12' : ''}`}>
      
      {/* Progress */}
      <div className="w-full max-w-3xl mb-8">
        <div className="flex justify-between mb-2">
           {currentSteps.map((s, idx) => (
             <div key={s.id} className={`flex flex-col items-center ${idx <= stepIndex ? 'text-primary-600' : 'text-neutral-300'}`}>
               <s.icon size={20} />
             </div>
           ))}
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
           <div 
             className="h-full bg-primary-500 transition-all duration-500 ease-out"
             style={{ width: `${((stepIndex + 1) / currentSteps.length) * 100}%` }}
           />
        </div>
      </div>

      <div className={`w-full max-w-3xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-glass border border-white/60 p-8 md:p-10 transition-all duration-500 animate-slide-up`}>
        
        {/* STEP: MODE SELECTION */}
        {currentStepId === 'mode' && (
          <div className="space-y-8 text-center">
            <h2 className="text-3xl font-bold text-neutral-900">{t('setup.title')}</h2>
            <p className="text-neutral-500">{t('setup.subtitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <button onClick={() => { setMode('express'); setStepIndex(1); }} className="p-6 border-2 border-neutral-100 rounded-2xl hover:border-primary-500 hover:bg-primary-50/20 text-left transition-all">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="bg-primary-100 p-3 rounded-xl text-primary-600"><Zap size={24} /></div>
                     <h3 className="font-bold text-lg">{t('setup.express')}</h3>
                  </div>
                  <p className="text-sm text-neutral-500">{t('setup.express.desc')}</p>
               </button>
               <button onClick={() => { setMode('complete'); setStepIndex(1); }} className="p-6 border-2 border-primary-500 bg-primary-50/10 rounded-2xl shadow-lg shadow-primary-500/10 text-left relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="bg-primary-600 p-3 rounded-xl text-white"><CheckCircle2 size={24} /></div>
                     <h3 className="font-bold text-lg">{t('setup.complete')}</h3>
                  </div>
                  <p className="text-sm text-neutral-700">{t('setup.complete.desc')}</p>
               </button>
            </div>
          </div>
        )}

        {/* STEP: BIOMETRICS (A) */}
        {currentStepId === 'bio' && (
           <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><User className="text-primary-500" /> {t('setup.bio')}</h3>
              <NutriInput label={t('label.name')} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                 <NutriInput label={t('label.age')} type="number" value={profile.biometrics?.age} onChange={e => handleBioChange('age', Number(e.target.value))} />
                 <NutriSelect label={t('label.gender')} options={[{value: 'Male', label: t('opt.male')}, {value: 'Female', label: t('opt.female')}]} value={profile.biometrics?.gender} onChange={e => handleBioChange('gender', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <NutriInput label={t('label.height')} type="number" startIcon={<Ruler size={16}/>} value={profile.biometrics?.height} onChange={e => handleBioChange('height', Number(e.target.value))} />
                 <NutriInput label={t('label.weight')} type="number" startIcon={<Weight size={16}/>} value={profile.biometrics?.weight} onChange={e => handleBioChange('weight', Number(e.target.value))} />
              </div>
              {mode === 'complete' && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
                   <NutriInput label="Body Fat % (Optional)" type="number" value={profile.biometrics?.bodyFatPercentage || ''} onChange={e => handleBioChange('bodyFatPercentage', Number(e.target.value))} tooltip="Helps calculate lean mass" />
                   <NutriInput label="Waist (cm) (Optional)" type="number" value={profile.biometrics?.waistCircumference || ''} onChange={e => handleBioChange('waistCircumference', Number(e.target.value))} tooltip="Risk indicator" />
                </div>
              )}
           </div>
        )}

        {/* STEP: CLINICAL (E) */}
        {currentStepId === 'clinical' && (
           <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><Stethoscope className="text-primary-500" /> Clinical History</h3>
              <NutriInput label="Medical Conditions" value={inputs.conditions} onChange={e => handleTextListChange('conditions', e.target.value)} helperText="e.g. Diabetes, Hypertension" />
              <NutriInput label="Medications" value={inputs.meds} onChange={e => handleTextListChange('meds', e.target.value)} helperText="Name and dosage" />
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 text-sm text-amber-800">
                 <ShieldCheck className="shrink-0" />
                 <p>Your health data is encrypted and used solely to prevent contraindications in your meal plan.</p>
              </div>
           </div>
        )}

        {/* STEP: LIFESTYLE (D, F, G, J) */}
        {currentStepId === 'lifestyle' && (
           <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><Activity className="text-primary-500" /> Lifestyle & Routine</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <NutriSelect label={t('label.activity')} options={Object.values(ActivityLevel).map(v => ({value: v, label: v}))} value={profile.lifestyle?.activityLevel} onChange={e => handleLifestyleChange('activityLevel', e.target.value)} />
                <NutriSelect label="Social Context" options={[{value: 'Alone', label: 'Mostly Alone'}, {value: 'Family', label: 'With Family'}, {value: 'Social', label: 'Frequent Events'}]} value={profile.routine?.socialContext} onChange={e => handleRoutineChange('socialContext', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <NutriSelect label={t('label.sleep')} options={['poor', 'average', 'good', 'excellent'].map(v => ({value: v, label: v}))} value={profile.lifestyle?.sleepQuality} onChange={e => handleLifestyleChange('sleepQuality', e.target.value)} />
                 <NutriSelect label={t('label.stress')} options={['low', 'moderate', 'high'].map(v => ({value: v, label: v}))} value={profile.lifestyle?.stressLevel} onChange={e => handleLifestyleChange('stressLevel', e.target.value)} />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                 <NutriSelect label="Alcohol" options={['None', 'Socially', 'Weekly', 'Daily'].map(v => ({value: v, label: v}))} value={profile.lifestyle?.alcoholIntake} onChange={e => handleLifestyleChange('alcoholIntake', e.target.value)} />
                 <NutriSelect label="Caffeine" options={['None', 'Low', 'Moderate', 'High'].map(v => ({value: v, label: v}))} value={profile.lifestyle?.caffeineIntake} onChange={e => handleLifestyleChange('caffeineIntake', e.target.value)} />
                 <div className="flex items-center justify-center border border-neutral-200 rounded-xl bg-white">
                    <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                       <input type="checkbox" checked={profile.lifestyle?.smoking} onChange={e => handleLifestyleChange('smoking', e.target.checked)} className="rounded text-primary-500 focus:ring-primary-500" />
                       Smoker?
                    </label>
                 </div>
              </div>
           </div>
        )}

        {/* STEP: DIET (B) */}
        {currentStepId === 'diet' && (
           <div className="space-y-6">
               <h3 className="text-xl font-bold flex items-center gap-2"><Utensils className="text-primary-500" /> Dietary Preferences</h3>
               <div className="grid grid-cols-2 gap-4">
                  <NutriSelect label={t('label.diet')} options={['omnivore', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean'].map(v => ({value: v, label: v}))} value={profile.routine?.dietaryPreference} onChange={e => handleRoutineChange('dietaryPreference', e.target.value)} />
                  <NutriSelect label={t('label.cooking')} options={['low', 'medium', 'high'].map(v => ({value: v, label: v}))} value={profile.routine?.cookingTime} onChange={e => handleRoutineChange('cookingTime', e.target.value)} />
               </div>
               
               <div className="space-y-3">
                 <p className="text-sm font-semibold text-neutral-700">Meal Frequency & Timing</p>
                 <div className="flex gap-4">
                    <div className="flex gap-1">
                      {[3, 4, 5, 6].map(n => (
                        <button key={n} type="button" onClick={() => handleRoutineChange('mealsPerDay', n)} className={`w-10 h-10 rounded-lg border ${profile.routine?.mealsPerDay === n ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-white text-neutral-600'}`}>{n}</button>
                      ))}
                    </div>
                    <NutriInput label="" placeholder="Times (e.g. 08:00, 12:00)" value={profile.routine?.preferredMealTimes} onChange={e => handleRoutineChange('preferredMealTimes', e.target.value)} className="flex-1" />
                 </div>
               </div>

               <NutriInput label={t('label.allergies')} value={inputs.allergies} onChange={e => handleTextListChange('allergies', e.target.value)} multiline placeholder="Peanuts, Shellfish..." />
               <NutriInput label="Dislikes / Restrictions" value={inputs.dislikes} onChange={e => handleTextListChange('dislikes', e.target.value)} placeholder="Okra, Liver, Pork (Halal)..." />
           </div>
        )}

        {/* STEP: GOALS (C) */}
        {currentStepId === 'goals' && (
           <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><Target className="text-primary-500" /> Objectives</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['loss', 'maintain', 'gain', 'longevity', 'performance'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleGoalsChange('primary', g)}
                      className={`p-4 rounded-xl border-2 text-left capitalize ${profile.goals?.primary === g ? 'border-primary-500 bg-primary-50' : 'border-neutral-100'}`}
                    >
                      <span className="font-bold text-neutral-800">{g}</span>
                    </button>
                  ))}
              </div>
              
              <NutriInput label="Motivation" value={profile.goals?.motivation || ''} onChange={e => handleGoalsChange('motivation', e.target.value)} placeholder="Why now? e.g. Wedding in 3 months" />
              <NutriInput label="Secondary Goals" value={inputs.secondaryGoals} onChange={e => handleTextListChange('secondaryGoals', e.target.value)} placeholder="Better sleep, Lower cholesterol..." />
           </div>
        )}

        {/* STEP: PRIVACY (H, I, M) */}
        {currentStepId === 'privacy' && (
           <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><Lock className="text-primary-500" /> Privacy & Consent</h3>
              <div className="space-y-4">
                 {[
                   { k: 'dataProcessing', l: 'I consent to processing my health data for meal planning (GDPR/LGPD)' },
                   { k: 'camera', l: 'Allow camera access for food logging (OCR)' },
                   { k: 'analytics', l: 'Allow anonymous analytics to improve the AI' }
                 ].map((item) => (
                    <label key={item.k} className="flex items-start gap-3 p-4 border border-neutral-100 rounded-xl cursor-pointer hover:bg-neutral-50">
                       <input 
                         type="checkbox" 
                         checked={(profile.consent as any)[item.k]} 
                         onChange={e => setProfile(p => ({...p, consent: {...p.consent!, [item.k]: e.target.checked}}))}
                         className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                       />
                       <span className="text-sm text-neutral-700">{item.l}</span>
                    </label>
                 ))}
              </div>
           </div>
        )}

        {/* STEP: REVIEW */}
        {currentStepId === 'review' && (
           <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary-50 rounded-full mx-auto flex items-center justify-center text-primary-600 animate-scale-in">
                 <Sparkles size={40} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">{t('setup.ready')}</h3>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
                 <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">TDEE</p>
                    <p className="text-xl font-bold text-neutral-900">{liveMetrics.tdee} kcal</p>
                 </div>
                 <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">Goal</p>
                    <p className="text-xl font-bold text-primary-600 capitalize">{profile.goals?.primary}</p>
                 </div>
              </div>
              
              <p className="text-neutral-500 text-sm max-w-sm mx-auto">
                 We have collected {Object.keys(profile).length} data points to build your hyper-personalized protocol.
              </p>
           </div>
        )}

        {/* Navigation */}
        <div className="pt-8 flex gap-4 mt-auto">
           {stepIndex > 0 && (
             <NutriButton variant="ghost" onClick={prevStep} icon={<ArrowLeft size={18} />}>Back</NutriButton>
           )}
           <NutriButton 
             onClick={nextStep} 
             fullWidth 
             isLoading={loading} 
             className="shadow-glow"
             icon={currentStepId === 'review' ? <Sparkles size={18}/> : <ChevronRight size={18}/>}
           >
             {currentStepId === 'review' ? t('setup.generate') : t('setup.next')}
           </NutriButton>
        </div>

      </div>
    </div>
  );
};
