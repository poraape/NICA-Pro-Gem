import React, { useState, useRef } from 'react';
import { UserProfile, WeeklyPlan, ClinicalReport } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle, Brain, Target, Info, Sparkles, Download, Share2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MOCK_WEIGHT_HISTORY } from '../constants';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import jsPDF from 'jspdf';

interface HealthStatsProps {
  profile: UserProfile;
  plan: WeeklyPlan;
  report?: ClinicalReport;
}

export const HealthStats: React.FC<HealthStatsProps> = ({ profile, plan, report }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'micros' | 'coaching'>('overview');
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const tdee = profile.tdee || 2000;
  const avgCals = plan.averageCalories;
  const deficit = tdee - avgCals;
  
  // Projections Logic
  const weeklyDeficit = deficit * 7;
  const projectedWeightChange = report?.weightProjection || (weeklyDeficit / 7700);
  const targetWeight = profile.goals.targetWeight || (profile.biometrics.weight - 5);
  const weightDiff = Math.abs(profile.biometrics.weight - targetWeight);
  const weeksToGoal = Math.abs(weightDiff / projectedWeightChange);

  // Chart Data
  const dailyCalsData = plan.days.map(d => ({
    name: d.day.substring(0,3),
    cals: d.dailyCalories,
    target: tdee
  }));

  const macroDistribution = [
    { name: 'Protein', value: plan.averageMacros.protein * 4, color: '#0ea5e9' },
    { name: 'Carbs', value: plan.averageMacros.carbs * 4, color: '#10b981' },
    { name: 'Fats', value: plan.averageMacros.fats * 9, color: '#f59e0b' }
  ];

  const microData = [
     { subject: 'Iron', A: 80, fullMark: 100 },
     { subject: 'Calcium', A: 90, fullMark: 100 },
     { subject: 'Vit C', A: 100, fullMark: 100 },
     { subject: 'Potassium', A: 60, fullMark: 100 },
     { subject: 'Sodium', A: 110, fullMark: 100 },
     { subject: 'Zinc', A: 75, fullMark: 100 },
  ];

  const overallScore = report?.overallScore || 85;

  // Alerts Mock Logic (If not in report)
  const alerts = report?.risks?.map((r, i) => ({ id: i, type: 'risk', msg: r, detail: 'Detected via nutrient-drug interaction check.' })) || [
    { id: 1, type: 'warning', msg: 'Sodium intake exceeds recommended limit for hypertension.', detail: 'Based on your profile, your daily sodium should be <2000mg. Current plan averages 2400mg.' },
    { id: 2, type: 'info', msg: 'Iron levels may be low for your activity level.', detail: 'Consider adding spinach or red meat to lunch.' }
  ];

  const handleExport = async () => {
    if (printRef.current) {
        const canvas = await html2canvas(printRef.current);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('clinical_report.pdf');
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-fade-in" ref={printRef}>
       
       {/* High Level Tabs */}
       <div className="flex justify-between items-center mb-4 px-2">
          <div className="bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-neutral-200 inline-flex">
             {[
               {id: 'overview', label: t('stats.projections'), icon: Target},
               {id: 'micros', label: 'Micronutrients', icon: Info},
               {id: 'coaching', label: 'Coaching', icon: Brain}
             ].map(tab => (
                <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-primary-500 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100'}`}
                >
                   <tab.icon size={16} />
                   <span className="hidden sm:inline">{tab.label}</span>
                </button>
             ))}
          </div>
          
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-xl shadow-lg hover:bg-neutral-700 transition-colors text-sm font-bold">
             <Download size={16} /> Export
          </button>
       </div>

       {activeTab === 'overview' && (
          <>
            {/* 1. Projections & Timeline */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-[28px] p-8 text-white shadow-xl relative overflow-hidden animate-slide-up">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                   {/* Left: Main Metrics */}
                   <div>
                       <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                          <Target className="text-indigo-300" /> {t('stats.projections')}
                       </h2>
                       <div className="flex items-end gap-4 mb-2">
                          <div>
                             <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Estimated Goal Date</p>
                             <p className="text-3xl font-bold text-white">
                                {weeksToGoal < 100 ? `${Math.ceil(weeksToGoal)} Weeks` : 'Maintenance'}
                             </p>
                          </div>
                          {deficit !== 0 && (
                            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 mb-1">
                                <span className={`text-sm font-bold ${projectedWeightChange < 0 ? 'text-green-300' : 'text-amber-300'}`}>
                                    {projectedWeightChange < 0 ? '-' : '+'}{Math.abs(projectedWeightChange).toFixed(1)}kg/wk
                                </span>
                            </div>
                          )}
                       </div>
                       
                       {/* Progress Bar */}
                       <div className="mt-6">
                          <div className="flex justify-between text-xs font-medium text-indigo-200 mb-2">
                             <span>Current: {profile.biometrics.weight}kg</span>
                             <span>Target: {targetWeight}kg</span>
                          </div>
                          <div className="h-2 w-full bg-indigo-950/50 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-1000"
                               style={{ width: `${Math.min(100, Math.max(0, ((profile.biometrics.weight - targetWeight) / (profile.biometrics.weight - (targetWeight - 5))) * 100))}%` }} 
                             />
                          </div>
                       </div>
                   </div>

                   {/* Right: Quality Score & Deficit */}
                   <div className="bg-white/10 rounded-2xl p-5 border border-white/10 backdrop-blur-md flex flex-col justify-between">
                       <div className="flex justify-between items-start">
                          <div>
                             <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Plan Quality</p>
                             <p className="text-4xl font-bold text-white mt-1">{overallScore}</p>
                          </div>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${overallScore > 80 ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                             {overallScore > 80 ? 'A' : 'B'}
                          </div>
                       </div>
                       
                       <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-indigo-100">Daily Caloric Gap</span>
                             <span className={`text-xl font-mono font-bold ${deficit > 0 ? 'text-green-300' : 'text-amber-300'}`}>
                                {deficit > 0 ? '-' : '+'}{Math.abs(deficit)}
                             </span>
                          </div>
                       </div>
                   </div>
                </div>
            </div>

            {/* 2. Alert Stack (Expandable) */}
            <div className="space-y-3">
               <h3 className="text-lg font-bold text-neutral-900 px-1">Clinical Alerts & Risks</h3>
               {alerts.map((alert, index) => (
                  <div 
                    key={index}
                    onClick={() => setExpandedAlert(expandedAlert === index ? null : index)}
                    className={`bg-white border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                        alert.type === 'risk' ? 'border-red-100 shadow-sm hover:shadow-red-100' : 
                        alert.type === 'warning' ? 'border-orange-100 shadow-sm' : 'border-blue-100'
                    }`}
                  >
                     <div className="p-4 flex items-start gap-3">
                        <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                            alert.type === 'risk' ? 'bg-red-100 text-red-600' : 
                            alert.type === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                           <AlertCircle size={14} />
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between items-center">
                              <h4 className={`font-bold text-sm ${
                                  alert.type === 'risk' ? 'text-red-900' : 
                                  alert.type === 'warning' ? 'text-orange-900' : 'text-blue-900'
                              }`}>
                                 {alert.msg}
                              </h4>
                              {expandedAlert === index ? <ChevronUp size={16} className="text-neutral-400"/> : <ChevronDown size={16} className="text-neutral-400"/>}
                           </div>
                           {expandedAlert === index && (
                              <div className="mt-3 text-sm text-neutral-600 border-t border-neutral-100 pt-3 animate-fade-in leading-relaxed">
                                 <p className="font-semibold mb-1 text-xs uppercase tracking-wider text-neutral-400">Clinical Context</p>
                                 {alert.detail}
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {/* 3. Historical Charts (ChartStack) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-glass border border-white/50">
                  <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                     <TrendingUp size={18} className="text-primary-500" /> Weight Trend
                  </h3>
                  <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_WEIGHT_HISTORY}>
                            <defs>
                              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#208192" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#208192" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="value" stroke="#208192" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                        </AreaChart>
                      </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-glass border border-white/50">
                  <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                     <CheckCircle size={18} className="text-primary-500" /> Caloric Adherence
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyCalsData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px' }} />
                          <Bar dataKey="cals" radius={[4, 4, 0, 0]} barSize={24}>
                              {dailyCalsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.cals > entry.target ? '#f59e0b' : '#208192'} />
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