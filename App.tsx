import React, { useState } from 'react';
import { DashboardData, ViewState, MealItem, WeeklyPlan, UserProfile, ClinicalReport } from './types';
import { MOCK_LOGS } from './constants';
import { FoodDiary } from './components/FoodDiary';
import { Navbar } from './components/Navbar';
import { FABMenu } from './components/FABMenu';
import { ProfileSetup } from './components/ProfileSetup';
import { WeeklyPlanView } from './components/WeeklyPlanView';
import { Dashboard } from './components/Dashboard';
import { generateWeeklyPlan, generateClinicalReport } from './services/geminiService';
import { Loader2 } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const { t, language } = useLanguage();
  // Application State
  const [activeTab, setActiveTab] = useState<ViewState>('setup');
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [data, setData] = useState<DashboardData>({
    profile: {} as UserProfile,
    weeklyPlan: null,
    clinicalReport: null,
    logs: [], // Legacy mock for dashboard
  });

  // Handlers
  const handleProfileSave = async (profile: UserProfile) => {
    setIsGenerating(true);
    
    // Inject current language selection into profile for AI context
    const profileWithLang = { ...profile, language };

    // Generate the Weekly Plan immediately after profile setup
    const plan = await generateWeeklyPlan(profileWithLang);
    let report: ClinicalReport | null = null;
    
    if (plan) {
       // If plan success, generate report
       report = await generateClinicalReport(profileWithLang, plan);
    }
    
    setData(prev => ({
      ...prev,
      profile: profileWithLang,
      weeklyPlan: plan,
      clinicalReport: report,
      logs: MOCK_LOGS, // Init mocks
    }));
    
    setIsOnboarding(false);
    setIsGenerating(false);
    setActiveTab('health-stats'); // Land on stats page
  };

  const handleUpdatePlan = (updatedPlan: WeeklyPlan) => {
    setData(prev => ({ ...prev, weeklyPlan: updatedPlan }));
  };

  if (isOnboarding || isGenerating) {
    return (
      <div className="min-h-screen bg-neutral-50 font-sans text-neutral-800">
        {isGenerating ? (
           <div className="flex flex-col items-center justify-center h-screen animate-fade-in text-center px-4">
              <Loader2 size={48} className="text-primary-500 animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-neutral-900">{t('nav.loading')}</h2>
              <p className="text-neutral-500 mt-2">{t('app.generating')}</p>
           </div>
        ) : (
           <div className="max-w-4xl mx-auto px-4">
             <ProfileSetup onSave={handleProfileSave} />
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 font-sans text-neutral-800 flex flex-col">
      
      {/* Navigation */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'setup' && (
           <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-glass border border-white/50 overflow-hidden">
                <ProfileSetup 
                  initialData={data.profile} 
                  onSave={handleProfileSave} 
                  isEditing 
                />
           </div>
        )}
        
        {/* Weekly Plan View (The "Plan" tab) */}
        {activeTab === 'weekly-plan' && data.weeklyPlan && (
          <WeeklyPlanView 
            plan={data.weeklyPlan} 
            onUpdatePlan={handleUpdatePlan} 
          />
        )}
        
        {/* Health Stats / Dashboard View */}
        {activeTab === 'health-stats' && data.weeklyPlan && (
           <Dashboard data={data} />
        )}
        
        {/* Legacy Diary Tab */}
        {activeTab === 'diary' && (
          <FoodDiary 
            recentMeals={[]} 
            onAddMeal={() => {}} 
            onDeleteMeal={() => {}}
          />
        )}

      </main>

      <FABMenu onAction={(a) => console.log(a)} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;