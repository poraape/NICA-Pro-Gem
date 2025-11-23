import React, { useState } from 'react';
import { DashboardData, ViewState, MealItem, WeeklyPlan, UserProfile, ClinicalReport } from './types';
import { MOCK_LOGS } from './constants';
import { FoodDiary } from './components/FoodDiary';
import { Navbar } from './components/Navbar';
import { FABMenu } from './components/FABMenu';
import { ProfileSetup } from './components/ProfileSetup';
import { WeeklyPlanView } from './components/WeeklyPlanView';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { generateWeeklyPlan, generateClinicalReport } from './services/geminiService';
import { Loader2 } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AnimationProvider } from './contexts/AnimationContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { GestureHandler } from './components/GestureHandler';
import { LayoutWrapper } from './components/LayoutWrapper';

const AppContent: React.FC = () => {
  const { t, language } = useLanguage();
  const { showToast, unlockAchievement } = useNotification();
  
  // Application State
  const [activeTab, setActiveTab] = useState<ViewState | 'settings'>('setup');
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
       unlockAchievement('Protocol Initiated', 'Your first clinical plan is ready.');
    } else {
       showToast('Failed to generate plan. Please try again.', 'error');
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
    showToast('Weekly protocol updated', 'success');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to reset everything?')) {
        setIsOnboarding(true);
        setActiveTab('setup');
        showToast('Account reset successfully', 'info');
    }
  };

  // --- Gesture Navigation Logic ---
  const handleSwipeLeft = () => {
     // Logic to move to next tab
     const tabs = ['health-stats', 'weekly-plan', 'diary', 'settings'];
     const currIdx = tabs.indexOf(activeTab);
     if (currIdx < tabs.length - 1) setActiveTab(tabs[currIdx + 1] as any);
  };

  const handleSwipeRight = () => {
     // Logic to move to prev tab
     const tabs = ['health-stats', 'weekly-plan', 'diary', 'settings'];
     const currIdx = tabs.indexOf(activeTab);
     if (currIdx > 0) setActiveTab(tabs[currIdx - 1] as any);
  };

  if (isOnboarding || isGenerating) {
    return (
      <div className="min-h-screen bg-cream-50 font-sans text-neutral-800">
        {isGenerating ? (
           <div className="flex flex-col items-center justify-center h-screen animate-fade-in text-center px-4">
              <Loader2 size={48} className="text-primary-500 animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-neutral-900">{t('nav.loading')}</h2>
              <p className="text-neutral-500 mt-2">{t('app.generating')}</p>
           </div>
        ) : (
           <div className="max-w-4xl mx-auto px-4 py-8">
             <ProfileSetup onSave={handleProfileSave} />
           </div>
        )}
      </div>
    );
  }

  return (
    <GestureHandler onSwipeLeft={handleSwipeLeft} onSwipeRight={handleSwipeRight}>
      <div className="min-h-screen bg-cream-100 font-sans text-neutral-800 flex flex-col">
        
        {/* Navigation */}
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Area via LayoutWrapper */}
        <LayoutWrapper>
          
          {activeTab === 'setup' && (
             <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-glass border border-white/50 overflow-hidden">
                  <ProfileSetup 
                    initialData={data.profile} 
                    onSave={handleProfileSave} 
                    isEditing 
                  />
             </div>
          )}
          
          {/* Weekly Plan View */}
          {activeTab === 'weekly-plan' && data.weeklyPlan && (
            <WeeklyPlanView 
              plan={data.weeklyPlan} 
              onUpdatePlan={handleUpdatePlan} 
            />
          )}
          
          {/* Health Stats / Dashboard View */}
          {activeTab === 'health-stats' && (
             <Dashboard data={data} onTabChange={(tab) => setActiveTab(tab as any)} />
          )}
          
          {/* Diary Tab */}
          {activeTab === 'diary' && (
            <FoodDiary 
              recentMeals={data.logs.flatMap(l => l.meals)} 
              onAddMeal={(m) => {
                  // Mock adding meal logic
                  const newLogs = [...data.logs];
                  // find today log or create
                  // ... logic omitted for brevity, focusing on UI structure
                  showToast('Meal logged to timeline', 'success');
              }} 
              onDeleteMeal={(id) => showToast('Meal removed', 'info')}
            />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
             <Settings 
                profile={data.profile} 
                onUpdateProfile={(p) => setData(prev => ({...prev, profile: p}))}
                onDeleteAccount={handleDeleteAccount}
             />
          )}
        </LayoutWrapper>

        <FABMenu onAction={(a) => showToast(`Action triggered: ${a}`, 'info')} />
      </div>
    </GestureHandler>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AnimationProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AnimationProvider>
    </LanguageProvider>
  );
};

export default App;