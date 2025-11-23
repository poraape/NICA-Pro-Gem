import React, { useState } from 'react';
import { UserProfile, NutritionalPlan } from '../types';
import { generateNutritionPlan } from '../services/geminiService';
import { NutriButton } from './Button';
import { Sparkles, FileText, CheckCircle2, Utensils, AlertCircle } from 'lucide-react';

interface PlanGeneratorProps {
  profile: UserProfile;
  currentPlan: NutritionalPlan | null;
  onPlanGenerated: (plan: NutritionalPlan) => void;
}

export const PlanGenerator: React.FC<PlanGeneratorProps> = ({ profile, currentPlan, onPlanGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const plan = await generateNutritionPlan(profile);
      if (plan) {
        onPlanGenerated(plan);
      } else {
        setError("Could not generate plan. Please check API configuration.");
      }
    } catch (e) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up pb-20">
      
      {/* Hero / Action Section */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-10 translate-x-10 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <Sparkles className="text-primary-400" size={24} />
              Clinical AI Nutritionist
            </h3>
            <p className="text-neutral-300 mt-2 max-w-lg leading-relaxed">
              Generate a precision nutrition protocol based on your biometrics (Age: {profile.age}, Weight: {profile.weight}kg) and clinical goals.
            </p>
          </div>
          <NutriButton 
            onClick={handleGenerate} 
            isLoading={loading} 
            size="lg"
            className="shadow-glow"
          >
            {currentPlan ? "Regenerate Protocol" : "Generate Plan"}
          </NutriButton>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </div>

      {currentPlan ? (
        <div className="bg-white/80 backdrop-blur-sm shadow-glass border border-white/50 rounded-2xl overflow-hidden animate-scale-in">
          {/* Plan Header */}
          <div className="px-8 py-6 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
            <div>
              <h4 className="text-lg font-bold text-neutral-900">Active Protocol</h4>
              <p className="text-xs text-neutral-500 mt-0.5">Generated {new Date(currentPlan.generatedAt).toLocaleDateString()}</p>
            </div>
            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full uppercase tracking-wider">
              {profile.goal} Phase
            </span>
          </div>
          
          {/* Targets Grid */}
          <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
             {[
               { label: 'Daily Target', val: currentPlan.targetCalories, unit: 'kcal', color: 'text-neutral-900' },
               { label: 'Protein', val: currentPlan.targetMacros.protein, unit: 'g', color: 'text-secondary-600' },
               { label: 'Carbs', val: currentPlan.targetMacros.carbs, unit: 'g', color: 'text-green-600' },
               { label: 'Fats', val: currentPlan.targetMacros.fats, unit: 'g', color: 'text-yellow-600' }
             ].map((stat, idx) => (
               <div key={idx} className="text-center p-5 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs text-neutral-400 uppercase tracking-wide font-semibold mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.val}<span className="text-sm text-neutral-400 ml-0.5 font-normal">{stat.unit}</span></p>
               </div>
             ))}
          </div>

          <div className="px-8 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Menu Column */}
            <div>
              <h5 className="font-semibold text-neutral-900 mb-5 flex items-center gap-2">
                <Utensils size={18} className="text-primary-500" /> Suggested Daily Menu
              </h5>
              <div className="space-y-4">
                {currentPlan.sampleMenu.map((item, idx) => (
                  <div key={idx} className="group p-4 bg-white border border-neutral-100 rounded-xl hover:border-primary-200 hover:shadow-sm transition-all">
                    <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-1">{item.meal}</span>
                    <p className="text-sm text-neutral-700 leading-relaxed group-hover:text-neutral-900">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recommendations Column */}
            <div>
              <h5 className="font-semibold text-neutral-900 mb-5 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-primary-500" /> Clinical Guidelines
              </h5>
              <ul className="space-y-3">
                {currentPlan.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                    <div className="min-w-[6px] h-[6px] rounded-full bg-primary-500 mt-2 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="text-sm text-neutral-600 leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white/50 border-2 border-dashed border-neutral-200 rounded-3xl">
          <FileText className="mx-auto text-neutral-300 mb-4" size={56} />
          <h4 className="text-lg font-medium text-neutral-600">No Active Plan</h4>
          <p className="text-neutral-400 max-w-md mx-auto mt-2">Use the generator above to create your personalized clinical nutrition protocol.</p>
        </div>
      )}
    </div>
  );
};