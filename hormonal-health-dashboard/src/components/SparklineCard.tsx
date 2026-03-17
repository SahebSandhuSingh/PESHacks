import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';
import clsx from 'clsx';
import { HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SparklineProps {
  title: string;
  value: string | number;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  colorTheme: 'purple' | 'rose' | 'teal' | 'orange';
  data: any[];
  dataKey: string;
  tooltipText: string;
}

export const SparklineCard = ({ title, value, unit, trend, colorTheme, data, dataKey, tooltipText }: SparklineProps) => {

  const themes = {
    purple: { bg: 'bg-purple-50', line: '#8b5cf6', text: 'text-purple-600', fill: 'from-purple-500/10 to-transparent' },
    rose: { bg: 'bg-rose-50', line: '#f43f5e', text: 'text-rose-600', fill: 'from-rose-500/10 to-transparent' },
    teal: { bg: 'bg-teal-50', line: '#14b8a6', text: 'text-teal-600', fill: 'from-teal-500/10 to-transparent' },
    orange: { bg: 'bg-orange-50', line: '#f97316', text: 'text-orange-600', fill: 'from-orange-500/10 to-transparent' },
  };

  const currentTheme = themes[colorTheme] || themes.purple;

  return (
    <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] p-5 border border-white/60 shadow-xl shadow-gray-200/50 flex flex-col relative group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      
      {/* Header with Hover Tooltip */}
      <div className="flex justify-between items-center mb-4 z-10">
        <div className="flex items-center gap-1.5 cursor-help">
          <h3 className="text-gray-500 font-bold text-sm tracking-tight">{title}</h3>
          <HelpCircle size={14} className="text-gray-300 transition-colors group-hover:text-gray-500" />
          
          {/* Tooltip Float */}
          <div className="absolute top-12 left-5 w-48 bg-gray-900 text-white text-xs font-medium p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
            {tooltipText}
            <div className="absolute -top-1 left-4 w-3 h-3 bg-gray-900 rotate-45"></div>
          </div>
        </div>

        <div className={clsx("p-1.5 rounded-full flex items-center justify-center", currentTheme.bg, currentTheme.text)}>
          {trend === 'up' && <TrendingUp size={14} strokeWidth={3} />}
          {trend === 'down' && <TrendingDown size={14} strokeWidth={3} />}
          {trend === 'stable' && <Minus size={14} strokeWidth={3} />}
        </div>
      </div>
      
      {/* Metric Value */}
      <div className="flex items-baseline gap-1 z-10">
        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</span>
        {unit && <span className="text-xs font-bold text-gray-400">{unit}</span>}
      </div>

      {/* Recharts Mini Sparkline inline at bottom */}
      <div className="h-12 w-full mt-auto -mb-2 overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <YAxis domain={['auto', 'auto']} hide />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={currentTheme.line} 
              strokeWidth={3} 
              dot={false} 
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
