import { Zap, Moon, Heart, Info } from 'lucide-react';

export const WhyThisRecommended = () => {
  const reasons = [
    { icon: Zap, text: 'Your stress levels have been higher than usual', color: 'bg-rose-100 text-rose-600' },
    { icon: Moon, text: 'Your sleep stability has decreased recently', color: 'bg-purple-100 text-purple-600' },
    { icon: Heart, text: 'These changes may affect hormonal balance', color: 'bg-teal-100 text-teal-600' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <Info size={20} className="text-gray-400" />
        Why this was recommended
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {reasons.map((reason, i) => (
          <div key={i} className="flex items-center gap-4 bg-white/60 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm">
            <div className={`p-2 rounded-xl ${reason.color}`}>
              <reason.icon size={20} />
            </div>
            <p className="text-sm font-semibold text-gray-700">{reason.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
