import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

export const ImprovementPreview = () => {
  const improvements = [
    { label: 'Stress', status: 'Expected to decrease', icon: TrendingDown, color: 'text-rose-500' },
    { label: 'Sleep Quality', status: 'Expected to improve', icon: TrendingUp, color: 'text-teal-500' },
    { label: 'Overall Stability', status: 'Expected to improve', icon: ArrowUpRight, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        Expected Improvement if you follow this plan
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {improvements.map((item, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-sm flex flex-col items-center text-center">
            <item.icon size={32} className={`mb-3 ${item.color}`} />
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</span>
            <span className="text-base font-extrabold text-gray-900">{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
