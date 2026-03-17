import { Sparkles, ArrowRight, MessageSquare, LineChart, ShieldCheck } from 'lucide-react';

interface RecProps {
  action: string;
  message: string;
  confidence?: number;
}

export const RecommendationCard = ({ action, message, confidence = 0.85 }: RecProps) => {
  const confidenceLevel = confidence > 0.8 ? 'High' : confidence > 0.5 ? 'Medium' : 'Low';
  
  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 rounded-[40px] p-8 sm:p-10 text-white shadow-2xl shadow-purple-500/20 relative overflow-hidden group">
      {/* Animated background blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400 opacity-20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
              <Sparkles size={20} className="text-white animate-pulse" />
            </div>
            <span className="text-xs font-black tracking-[0.2em] text-indigo-100 uppercase">AI Patient Guidance</span>
          </div>
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <ShieldCheck size={14} className="text-teal-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Supportive Analysis</span>
          </div>
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-black mb-4 capitalize text-white tracking-tight drop-shadow-md leading-tight">
          {action.replace(/_/g, ' ')}
        </h2>
        <p className="text-white/90 font-medium leading-relaxed text-lg mb-10 max-w-2xl">
          "{message}"
        </p>

        {/* Confidence Progress Bar */}
        <div className="mb-10 max-w-sm">
          <div className="flex justify-between items-end mb-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1">AI Confidence</span>
              <span className="text-sm font-bold text-white">{confidenceLevel} Confidence</span>
            </div>
            <span className="text-[10px] font-medium text-white/60 italic">"Based on recent health trends"</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-300 to-cyan-300 rounded-full transition-all duration-1000"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>
        
        {/* Action Grid */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex items-center justify-center gap-2 group/btn text-sm font-bold text-purple-700 bg-white px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-all shadow-xl hover:scale-[1.02] active:scale-95">
            View Detailed Plan <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
          
          <button className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl transition-all border border-white/10">
            <MessageSquare size={18} /> Talk to a Doctor
          </button>

          <button className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl transition-all border border-white/10">
            <LineChart size={18} /> Track My Progress
          </button>
        </div>
      </div>
    </div>
  );
};
