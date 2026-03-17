import { Calendar } from 'lucide-react';

export const CycleTimeline = () => {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/60 p-6 shadow-xl shadow-indigo-500/5 col-span-full md:col-span-2">
      <div className="flex items-center gap-2 mb-8">
        <Calendar size={20} className="text-indigo-400" />
        <h3 className="font-bold text-gray-900 tracking-tight text-lg">Cycle Prediction Timeline</h3>
      </div>

      <div className="relative w-full h-12 flex items-center justify-between px-4 sm:px-12 mt-4">
        {/* Continuous Line Track */}
        <div className="absolute left-8 right-8 h-1 bg-gray-200 rounded-full top-1/2 -translate-y-1/2 z-0" />
        {/* Active Progress Line */}
        <div className="absolute left-8 w-1/3 h-1 bg-indigo-500 rounded-full top-1/2 -translate-y-1/2 z-0 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />

        {/* Nodes */}
        <div className="relative z-10 flex flex-col items-center group cursor-pointer">
          <div className="w-4 h-4 rounded-full border-4 border-indigo-500 bg-white group-hover:scale-150 transition-transform shadow-lg shadow-indigo-500/30" />
          <span className="absolute top-6 whitespace-nowrap text-xs font-bold text-indigo-600 uppercase tracking-wider">Current Phase</span>
          <span className="absolute -top-6 whitespace-nowrap text-sm font-extrabold text-gray-900">Day 14</span>
        </div>

        <div className="relative z-10 flex flex-col items-center group cursor-pointer">
          <div className="w-4 h-4 rounded-full border-4 border-rose-400 bg-white group-hover:scale-150 transition-transform" />
          <span className="absolute top-6 whitespace-nowrap text-xs font-bold text-gray-400 uppercase tracking-wider">Ovulation Window</span>
          <span className="absolute -top-6 whitespace-nowrap text-sm font-extrabold text-gray-900 drop-shadow-sm">Day 16-18</span>
        </div>

        <div className="relative z-10 flex flex-col items-center group cursor-pointer">
          <div className="w-4 h-4 rounded-full border-4 border-gray-300 bg-white group-hover:scale-150 transition-transform" />
          <span className="absolute top-6 whitespace-nowrap text-xs font-bold text-gray-400 uppercase tracking-wider">Next Cycle Est.</span>
          <span className="absolute -top-6 whitespace-nowrap text-sm font-extrabold text-gray-400">Day 29</span>
        </div>
      </div>
    </div>
  );
};
