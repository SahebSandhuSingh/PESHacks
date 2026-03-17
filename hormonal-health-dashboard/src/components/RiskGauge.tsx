import { AlertTriangle } from 'lucide-react';

interface RiskProps {
  score: number; // 0 to 1
}

export const RiskGauge = ({ score }: RiskProps) => {
  const percentage = Math.round(score * 100);
  const rotation = -180 + (percentage / 100) * 180;
  
  const getRiskStatus = () => {
    if (score < 0.33) return { label: 'Low Risk', color: 'text-teal-500', stroke: '#14b8a6', gradient: 'from-teal-400 to-emerald-400' };
    if (score < 0.66) return { label: 'Moderate Risk', color: 'text-amber-500', stroke: '#f59e0b', gradient: 'from-amber-400 to-orange-400' };
    return { label: 'High Risk', color: 'text-rose-500', stroke: '#f43f5e', gradient: 'from-rose-400 to-red-500' };
  };

  const status = getRiskStatus();

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/60 p-6 shadow-xl shadow-amber-500/5 h-full flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-2 mb-2 w-full">
        <AlertTriangle size={20} className="text-gray-400" />
        <h3 className="font-bold text-gray-900 tracking-tight text-lg">PCOS Health Risk</h3>
      </div>

      <div className="relative w-48 h-24 mt-8 flex justify-center overflow-hidden">
        {/* SVG Half-Circle Gauge */}
        <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible drop-shadow-md">
          {/* Track */}
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
          {/* Fill Progress */}
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={status.stroke} strokeWidth="12" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset={125.6 - (percentage / 100) * 125.6} className="transition-all duration-1000 ease-out" />
        </svg>

        {/* Needle/Dial */}
        <div 
          className="absolute bottom-0 w-1 h-14 origin-bottom transition-transform duration-1000 ease-out z-10"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="w-3 h-3 bg-gray-900 rounded-full border-2 border-white absolute -top-1 -left-1 shadow-sm" />
          <div className="w-1 h-full bg-gray-900 rounded-t-full shadow-sm" />
        </div>
        
        {/* Core Dot Base */}
        <div className="absolute bottom-[-6px] w-6 h-6 bg-white border-4 border-gray-900 rounded-full z-20 shadow-md" />
      </div>

      <div className="mt-4">
        <h4 className={`text-2xl font-extrabold tracking-tight ${status.color}`}>{status.label}</h4>
        <p className="text-xs font-semibold text-gray-500 mt-2 max-w-[200px] leading-relaxed">
          Based on extreme stress tracking and unstable HRV patterns.
        </p>
      </div>
    </div>
  );
};
