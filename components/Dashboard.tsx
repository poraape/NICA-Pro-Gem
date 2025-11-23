import React from 'react';
import { DashboardData } from '../types';
import { HealthStats } from './HealthStats';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldCheck } from 'lucide-react';

interface DashboardProps {
  data: DashboardData;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6 animate-fade-in">
       {/* Dashboard Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              {t('nav.projections')}
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
               Clinical Intelligence Hub for <span className="font-semibold text-neutral-700">{data.profile.name}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-neutral-100">
             <div className="bg-green-100 p-1.5 rounded-full text-green-600">
                <ShieldCheck size={16} />
             </div>
             <div>
                <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Status</p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-bold text-neutral-700">Protocol Active</span>
                </div>
             </div>
          </div>
       </div>

       {/* AI Clinical Analysis Module */}
       {data.weeklyPlan ? (
         <HealthStats 
           profile={data.profile} 
           plan={data.weeklyPlan} 
           report={data.clinicalReport || undefined}
         />
       ) : (
         <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200 border-dashed">
            <p className="text-neutral-400">No active plan data available.</p>
         </div>
       )}
    </div>
  );
};