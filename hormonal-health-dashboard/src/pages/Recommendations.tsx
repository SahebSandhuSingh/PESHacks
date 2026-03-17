import { useHealthData } from '../services/api';
import { RecommendationCard } from '../components/RecommendationCard';
import { WhyThisRecommended } from '../components/WhyThisRecommended';
import { ImprovementPreview } from '../components/ImprovementPreview';
import { PeriodCalendar } from '../components/PeriodCalendar';
import { Sparkles, ArrowRight, ShieldCheck, Clock, Loader2 } from 'lucide-react';

export const Recommendations = () => {
  const { data, loading, error } = useHealthData();

  if (loading && !data) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  if (error && !data) return <div className="text-red-500">{error}</div>;

  const rl = data?.ai_predictions?.rl;
  const stabilityScore = data?.ai_predictions?.gnn?.physiological_stability_score || 0.85;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto pb-20">
      
      {/* Supportive Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/20 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-rose-600 border border-rose-100">
            <Sparkles size={12} />
            Hormonal Forecast Active
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Health Assistant</h1>
          <p className="text-slate-500 font-medium text-lg italic">"Focusing on the week ahead, Pragya."</p>
        </div>

        {/* Phase Progress Indicator */}
        <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[32px] border border-white shadow-sm min-w-[320px]">
           <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cycle Progress</span>
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-full">Luteal Phase</span>
           </div>
           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-rose-400 w-3/4 animate-pulse" />
              <div className="h-full bg-slate-200 w-1/4" />
           </div>
           <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
              <span>Day 21</span>
              <span>8 Days Until Flow</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Calendar & Summary (Main Focus) */}
        <div className="lg:col-span-2 space-y-8">
          <PeriodCalendar />
          
          <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-xl flex items-center justify-center border border-white/10">
                   <ShieldCheck size={40} className="text-rose-300" />
                </div>
                <div className="flex-1 text-center md:text-left">
                   <h2 className="text-2xl font-black mb-2 tracking-tight">Next Phase Preparation</h2>
                   <p className="text-slate-300 font-medium leading-relaxed max-w-md">Your body is preparing for the next cycle. We recommend increasing magnesium intake and maintaining consistent sleep patterns this week.</p>
                </div>
                <button className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-white/5 whitespace-nowrap">
                   View Full Prep Guide
                </button>
             </div>
          </div>
        </div>

        {/* Right Column: AI Insights & Improvements */}
        <div className="space-y-8">
          {rl ? (
             <RecommendationCard 
                action={rl.recommended_action || "Rest & Hydrate"} 
                message={rl.patient_message || "Your body needs some extra TLC today. Prioritize rest."} 
                confidence={stabilityScore} 
             />
          ) : (
            <div className="bg-white/60 backdrop-blur-xl rounded-[40px] border border-white/60 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <Sparkles size={32} className="text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing patterns...</h2>
                <p className="text-gray-500 font-medium">Tracking data for recommendations.</p>
            </div>
          )}

          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Clock size={16} className="text-blue-500" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Analysis Breakdown</h3>
            </div>
            <WhyThisRecommended />
            <ImprovementPreview />
          </section>

          <button className="w-full group bg-white p-6 rounded-[32px] border border-slate-100 hover:border-blue-200 transition-all text-left shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
             <div className="flex items-center justify-between">
                <div>
                   <h4 className="font-black text-slate-900">Talk to Health Coach</h4>
                   <p className="text-xs font-bold text-slate-500 mt-1">Chat available 09:00 - 18:00</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                   <ArrowRight size={20} />
                </div>
             </div>
          </button>
        </div>

      </div>
    </div>
  );
};
