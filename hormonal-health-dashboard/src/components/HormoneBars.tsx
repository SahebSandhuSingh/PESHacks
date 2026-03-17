import clsx from 'clsx';
import { Activity } from 'lucide-react';

interface HormoneProps {
  estrogen: number;
  progesterone: number;
  androgen: number;
}

export const HormoneBars = ({ estrogen, progesterone, androgen }: HormoneProps) => {

  const bars = [
    { label: 'Estrogen', val: estrogen, color: 'bg-rose-400', risk: estrogen < 0.3 ? 'Low' : estrogen > 0.8 ? 'High' : 'Optimal' },
    { label: 'Progesterone', val: progesterone, color: 'bg-purple-400', risk: progesterone < 0.2 ? 'Low Risk' : 'Optimal' },
    { label: 'Androgen', val: androgen, color: 'bg-amber-400', risk: androgen > 0.7 ? 'Risk Level' : 'Stable' }
  ];

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/60 p-6 shadow-xl shadow-rose-500/5 h-full flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-6">
        <Activity size={20} className="text-gray-400" />
        <h3 className="font-bold text-gray-900 tracking-tight text-lg">Hormone Prediction</h3>
      </div>
      
      <div className="space-y-6">
        {bars.map(b => (
          <div key={b.label}>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-bold text-gray-600">{b.label}</span>
              <span className={clsx(
                "text-xs font-bold uppercase tracking-widest",
                b.risk === 'Optimal' || b.risk === 'Stable' ? "text-teal-500" : "text-rose-500"
              )}>{b.risk}</span>
            </div>
            {/* Background Track */}
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              {/* Animated Progress */}
              <div 
                className={clsx("h-full rounded-full transition-all duration-1000", b.color)} 
                style={{ width: `${b.val * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
