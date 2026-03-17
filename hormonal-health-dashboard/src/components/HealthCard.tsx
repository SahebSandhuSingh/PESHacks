import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HealthCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  status?: 'green' | 'yellow' | 'red';
  trend?: 'up' | 'down' | 'stable';
  themeClass: 'red' | 'purple' | 'green' | 'orange';
}

export const HealthCard = ({
  title, value, unit, icon: Icon, trend, themeClass
}: HealthCardProps) => {

  const themes = {
    red: { bg: 'bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-lg shadow-red-500/30', icon: 'text-rose-100', dot: 'bg-white', text: 'text-white', subText: 'text-rose-100' },
    purple: { bg: 'bg-gradient-to-br from-violet-400 to-purple-500 text-white shadow-lg shadow-purple-500/30', icon: 'text-violet-100', dot: 'bg-white', text: 'text-white', subText: 'text-violet-100' },
    green: { bg: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-teal-500/30', icon: 'text-emerald-100', dot: 'bg-white', text: 'text-white', subText: 'text-emerald-100' },
    orange: { bg: 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-500/30', icon: 'text-orange-100', dot: 'bg-white', text: 'text-white', subText: 'text-orange-100' }
  };

  const theme = themes[themeClass] || themes.red;

  return (
    <div className={clsx("rounded-[32px] p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl", theme.bg)}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
           <div className={clsx("w-2 h-2 rounded-full animate-pulse", theme.dot)} />
           <h3 className={clsx("font-bold text-lg", theme.text)}>{title}</h3>
        </div>
        <Icon size={24} className={theme.icon} />
      </div>
      
      <div className="flex items-baseline gap-2 mt-auto">
        <span className={clsx("text-4xl font-extrabold tracking-tight", theme.text)}>{value}</span>
        {unit && <span className={clsx("text-sm font-bold", theme.subText)}>{unit}</span>}
      </div>

      {trend && (
        <div className={clsx("mt-3 flex items-center gap-1.5 text-sm font-semibold", theme.subText)}>
          {trend === 'up' && <TrendingUp size={16} />}
          {trend === 'down' && <TrendingDown size={16} />}
          {trend === 'stable' && <Minus size={16} />}
          <span className="ml-0.5 opacity-80">vs yesterday</span>
        </div>
      )}
    </div>
  );
};
