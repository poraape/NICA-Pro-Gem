import React, { useState } from 'react';
import { UserProfile, WeeklyPlan, ClinicalReport } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle, Brain, Target, Info, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HealthStatsProps {
  profile: UserProfile;
  plan: WeeklyPlan;
  report?: ClinicalReport;
}

export const HealthStats: React.FC<HealthStatsProps> = ({ profile, plan, report }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'micros' | 'coaching'>('overview');
  
  const tdee = profile.tdee || 2000;
  const avgCals = plan.averageCalories;
  const deficit = tdee - avgCals;
  
  // Clinical Projections (Calculated locally if report is missing, otherwise use report)
  const weeklyDeficit = deficit * 7;
  const projectedWeightChange = report?.weightProjection || (weeklyDeficit / 7700);
  
  // Chart Data
  const dailyCalsData = plan.days.map(d => ({
    name: d.day.substring(0,3),
    cals: d.dailyCalories,
    target: tdee
  }));

  const macroDistribution = [
    { name: 'Protein', value: plan.averageMacros.protein * 4, color: '#0ea5e9' }, // 4 cal/g
    { name: 'Carbs', value: plan.averageMacros.carbs * 4, color: '#10b981' }, // 4 cal/g
    { name: 'Fats', value: plan.averageMacros.fats * 9, color: '#f59e0b' } // 9 cal/g
  ];

  // Mock Radar Data for Micros (In a real app, this comes from the report analysis)
  const microData = [
     { subject: 'Iron', A: 80, fullMark: 100 },
     { subject: 'Calcium', A: 90, fullMark: 100 },
     { subject: 'Vit C', A: 100, fullMark: 100 },
     { subject: 'Potassium', A: 60, fullMark: 100 },
     { subject: 'Sodium', A: 110, fullMark: 100 },
     { subject: 'Zinc', A: 75, fullMark: 100 },
  ];

  const overallScore = report?.overallScore || 85;

  return (
    <div className="space-y-8 pb-24 animate-fade-in">
       
       {/* High Level Tabs */}
       <div className="flex justify-center mb-4">
          <div className="bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-neutral-200 inline-flex">
             {[
               {id: 'overview', label: t('stats.projections'), icon: Target},
               {id: 'micros', label: 'Micronutrients', icon: Info},
               {id: 'coaching', label: 'AI Coaching', icon: Brain}
             ].map(tab => (
                <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-primary-500 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100'}`}
                >
                   <tab.icon size={16} />
                   {tab.label}
                </button>
             ))}
          </div>
       </div>

       {activeTab === 'overview' && (
          <>
            {/* Hero Stats */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden animate-slide-up">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 pointer-events-none"></div>
                <h2 className="text-2xl font-bold mb-6">{t('stats.projections')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                      <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">{t('stats.weekly_outcome')}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">
                          {projectedWeightChange < 0 ? '-' : '+'}{Math.abs(projectedWeightChange).toFixed(2)}
                        </span>
                        <span className="text-lg text-indigo-200">kg</span>
                      </div>
                      <p className="text-sm text-indigo-300 mt-2 flex items-center gap-2">
                        {projectedWeightChange < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                        {t('stats.based_on')}
                      </p>
                  </div>
                  
                  <div>
                      <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">{t('stats.daily_deficit')}</p>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-bold ${deficit > 0 ? 'text-green-300' : 'text-amber-300'}`}>
                          {deficit > 0 ? '-' : '+'}{Math.abs(deficit)}
                        </span>
                        <span className="text-sm text-indigo-200">kcal/day</span>
                      </div>
                      <p className="text-sm text-indigo-300 mt-2">{t('stats.target')}: {tdee}</p>
                  </div>

                  <div>
                      <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">{t('stats.quality_score')}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">{overallScore}</span>
                        <span className="text-sm text-indigo-200">/100</span>
                      </div>
                      <div className="w-full bg-indigo-900/50 h-2 rounded-full mt-3 overflow-hidden">
                        <div className="bg-green-400 h-full transition-all duration-1000" style={{width: `${overallScore}%`}}></div>
                      </div>
                  </div>
                </div>
            </div>

            {/* Consistency & Distribution Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Consistency Chart */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-glass border border-white/50">
                  <h3 className="text-lg font-bold text-neutral-900 mb-6">{t('stats.consistency')}</h3>
                  <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyCalsData}>
                            <defs>
                              <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                            <YAxis hide domain={['dataMin - 500', 'dataMax + 500']} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                            />
                            <Area type="monotone" dataKey="cals" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCals)" />
                        </AreaChart>
                      </ResponsiveContainer>
                  </div>
                </div>

                {/* Macro Distribution */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-glass border border-white/50">
                  <h3 className="text-lg font-bold text-neutral-900 mb-4">{t('stats.distribution')}</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={macroDistribution} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={60} axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 500}} />
                          <Tooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                              {macroDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                          </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
            </div>
          </>
       )}

       {activeTab === 'micros' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
             <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-glass border border-white/50 flex flex-col items-center justify-center">
                 <h3 className="text-xl font-bold text-neutral-900 mb-6 w-full text-left">{t('stats.micro_title')}</h3>
                 <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={microData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar name="Intake" dataKey="A" stroke="#059669" strokeWidth={3} fill="#10b981" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                 </div>
             </div>
             
             <div className="space-y-6">
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                   <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2"><AlertCircle size={20}/> {t('stats.deficiencies')}</h4>
                   <p className="text-sm text-red-700 leading-relaxed">
                      {report?.micronutrientAnalysis?.deficiencies?.join(", ") || t('stats.pending')}
                   </p>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                   <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2"><CheckCircle size={20}/> {t('stats.adequacies')}</h4>
                   <p className="text-sm text-green-700 leading-relaxed">
                      {report?.micronutrientAnalysis?.adequacies?.join(", ") || t('stats.pending')}
                   </p>
                </div>
             </div>
          </div>
       )}

       {activeTab === 'coaching' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
             {report?.behavioralInsights?.map((insight, idx) => (
                <div key={idx} className="bg-white/80 p-6 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
                   <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4">
                      <Sparkles size={20} />
                   </div>
                   <p className="text-neutral-800 font-medium leading-relaxed">"{insight}"</p>
                </div>
             ))}
             {(!report?.behavioralInsights || report.behavioralInsights.length === 0) && (
                <div className="col-span-2 text-center py-10 text-neutral-400">
                   {t('stats.generating_insights')}
                </div>
             )}
          </div>
       )}

    </div>
  );
};