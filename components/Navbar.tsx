import React, { useState } from 'react';
import { ViewState, Language } from '../types';
import { Activity, CalendarDays, User, Utensils, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  activeTab: ViewState | string;
  onTabChange: (tab: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const navItems = [
    { id: 'health-stats', label: t('nav.projections'), icon: Activity },
    { id: 'weekly-plan', label: t('nav.weeklyPlan'), icon: CalendarDays },
    { id: 'diary', label: t('nav.diary'), icon: Utensils },
    { id: 'setup', label: t('nav.profile'), icon: User },
  ];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-neutral-200/60 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => onTabChange('health-stats')}>
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-1.5 rounded-lg shadow-glow">
              <Activity size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-neutral-900 tracking-tight">
              NICA<span className="text-primary-600">-Pro</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-1 bg-neutral-100/50 p-1 rounded-full border border-neutral-200/50">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-white text-primary-700 shadow-sm ring-1 ring-neutral-200' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'}
                  `}
                >
                  <Icon size={16} className={isActive ? 'text-primary-500' : 'text-neutral-400'} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Side: Language & Profile Placeholder */}
          <div className="flex items-center gap-3">
             {/* Language Switcher */}
             <div className="relative">
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
                >
                  <Globe size={18} />
                  <span className="text-sm font-medium uppercase">{language}</span>
                  <ChevronDown size={14} className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isLangOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsLangOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-neutral-100 py-1 z-20 overflow-hidden animate-scale-in">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-neutral-50 transition-colors ${language === lang.code ? 'text-primary-600 bg-primary-50 font-medium' : 'text-neutral-700'}`}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
             </div>

             <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary-100 to-secondary-100 border border-white shadow-sm flex items-center justify-center text-primary-700 font-bold text-sm">
                AS
             </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="md:hidden border-t border-neutral-100 flex justify-around p-2 bg-white/95 backdrop-blur">
          {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-primary-600' : 'text-neutral-400'}`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-medium mt-1">{item.label}</span>
                </button>
              );
            })}
      </div>
    </nav>
  );
};