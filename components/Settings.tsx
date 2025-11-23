import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAnimation } from '../contexts/AnimationContext';
import { NutriButton } from './Button';
import { Toggle } from './Toggle';
import { 
  Shield, Download, Trash2, Smartphone, 
  Moon, Bell, User, ChevronRight, Check, AlertTriangle, FileText, Zap
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface SettingsProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onDeleteAccount: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ profile, onUpdateProfile, onDeleteAccount }) => {
  const { t, setLanguage, language } = useLanguage();
  const { isReducedMotion, toggleReducedMotion } = useAnimation();
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'general' | 'privacy' | 'data'>('general');

  const handleConsentChange = (key: keyof UserProfile['consent'], val: boolean) => {
    onUpdateProfile({
      ...profile,
      consent: { ...profile.consent, [key]: val }
    });
    showToast(`Privacy setting updated`, 'success');
  };

  const handleExport = (format: 'json' | 'csv') => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `nica_pro_export_${new Date().toISOString()}.${format}`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast(`Data exported as ${format.toUpperCase()}`, 'success');
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
         <div className="bg-neutral-100 p-2 rounded-xl text-neutral-600">
            <User size={24} />
         </div>
         <h2 className="text-2xl font-bold text-neutral-900">Settings & Controls</h2>
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1 bg-neutral-100 rounded-xl overflow-x-auto no-scrollbar">
         {[
           {id: 'general', label: 'General', icon: Smartphone},
           {id: 'privacy', label: 'Privacy & Consent', icon: Shield},
           {id: 'data', label: 'Data & Export', icon: Download},
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
           >
             <tab.icon size={16} />
             {tab.label}
           </button>
         ))}
      </div>

      {/* CONTENT AREA - GLASS PANEL */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm">
        
        {/* GENERAL TAB */}
        {activeTab === 'general' && (
           <div className="space-y-6 animate-slide-up">
              <section>
                 <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Application Experience</h3>
                 <div className="space-y-1">
                    <Toggle 
                      label="Reduced Motion" 
                      description="Minimize animations for a simpler, faster feel" 
                      checked={isReducedMotion} 
                      onChange={toggleReducedMotion} 
                    />
                    <Toggle 
                      label="Haptic Feedback" 
                      description="Vibrate on success, error, and interaction" 
                      checked={true} 
                      onChange={() => {}} 
                      disabled={true} // Mock: Haptic is always on for this demo
                    />
                    <Toggle 
                      label="Smart Notifications" 
                      description="Receive AI-driven meal reminders" 
                      checked={profile.consent.notifications} 
                      onChange={(v) => handleConsentChange('notifications', v)} 
                    />
                 </div>
              </section>

              <section>
                 <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 mt-6">Language / Idioma</h3>
                 <div className="grid grid-cols-2 gap-3">
                    {['en', 'pt', 'es', 'zh'].map((code) => (
                       <button 
                         key={code}
                         onClick={() => setLanguage(code as any)}
                         className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center justify-between transition-all active:scale-95 ${language === code ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 bg-white text-neutral-600'}`}
                       >
                          <span className="uppercase">{code}</span>
                          {language === code && <Check size={16} />}
                       </button>
                    ))}
                 </div>
              </section>
           </div>
        )}

        {/* PRIVACY TAB */}
        {activeTab === 'privacy' && (
           <div className="space-y-6 animate-slide-up">
              <div className="bg-primary-50 p-4 rounded-xl flex gap-3 text-primary-800 border border-primary-100">
                 <Shield className="shrink-0" size={20} />
                 <div>
                    <p className="font-bold text-sm">Your Data is Yours</p>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">We process health data locally where possible. Consents can be revoked at any time.</p>
                 </div>
              </div>

              <section>
                 <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Granular Consent</h3>
                 <Toggle 
                    label="Health Data Processing" 
                    description="Allow algorithms to analyze your biometrics for diet generation (Required)" 
                    checked={profile.consent.dataProcessing} 
                    onChange={(v) => handleConsentChange('dataProcessing', v)} 
                 />
                 <Toggle 
                    label="Camera & OCR" 
                    description="Process images for food recognition" 
                    checked={profile.consent.camera} 
                    onChange={(v) => handleConsentChange('camera', v)} 
                 />
                 <Toggle 
                    label="Usage Analytics" 
                    description="Share anonymous logs to help improve NICA-Pro" 
                    checked={profile.consent.analytics} 
                    onChange={(v) => handleConsentChange('analytics', v)} 
                 />
              </section>
              
              <div className="mt-4 pt-4 border-t border-neutral-100">
                 <button className="text-sm font-medium text-primary-600 flex items-center gap-1 hover:underline">
                    View Privacy Policy <ChevronRight size={14} />
                 </button>
              </div>
           </div>
        )}

        {/* DATA TAB */}
        {activeTab === 'data' && (
           <div className="space-y-6 animate-slide-up">
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-5 border border-neutral-200 rounded-2xl bg-white hover:shadow-md transition-shadow cursor-pointer active:scale-95 duration-200" onClick={() => handleExport('json')}>
                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600 mb-3">
                       <FileText size={20} />
                    </div>
                    <h4 className="font-bold text-neutral-900">Export JSON</h4>
                    <p className="text-xs text-neutral-500 mt-1">Full raw data dump.</p>
                 </div>
                 <div className="p-5 border border-neutral-200 rounded-2xl bg-white hover:shadow-md transition-shadow cursor-pointer active:scale-95 duration-200" onClick={() => handleExport('csv')}>
                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600 mb-3">
                       <FileText size={20} />
                    </div>
                    <h4 className="font-bold text-neutral-900">Export CSV</h4>
                    <p className="text-xs text-neutral-500 mt-1">Spreadsheet compatible.</p>
                 </div>
              </section>

              <section className="pt-6 border-t border-neutral-200">
                 <h3 className="text-xs font-bold text-error-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <AlertTriangle size={14} /> Danger Zone
                 </h3>
                 <div className="flex items-center justify-between p-4 bg-error-50 border border-error-100 rounded-xl">
                    <div>
                       <p className="font-bold text-error-900">Delete Account</p>
                       <p className="text-xs text-error-700 mt-1">Permanently remove all data.</p>
                    </div>
                    <button 
                      onClick={onDeleteAccount}
                      className="p-2 bg-white border border-error-200 text-error-600 rounded-lg hover:bg-error-100 transition-colors"
                    >
                       <Trash2 size={18} />
                    </button>
                 </div>
              </section>
           </div>
        )}

      </div>
    </div>
  );
};