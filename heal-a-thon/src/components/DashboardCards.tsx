import React from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  Wind, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  Info, 
  Navigation,
  Droplets
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip,
  AreaChart,
  Area
} from 'recharts';
import { SensorData } from '../types';
import { cn } from '../lib/utils';

export const HeartRateCard = ({ data, history, theme = 'dark' }: { data: SensorData | null, history: any[], theme?: 'dark' | 'light' }) => {
  const hr = data?.heart_rate;
  
  return (
    <div className={cn(
      "backdrop-blur-xl p-5 rounded-[2rem] border shadow-2xl relative overflow-hidden group transition-all duration-500",
      theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
    )}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent-pink/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-accent-pink/10 transition-colors" />
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex items-center gap-2 text-rose">
          <Heart size={18} className={hr ? "animate-pulse fill-accent-pink text-accent-pink" : ""} />
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Heart Rate</span>
        </div>
        {hr && <span className="text-[10px] font-bold text-accent-pink bg-accent-pink/10 px-2 py-0.5 rounded-full">Live</span>}
      </div>
      
      <div className="flex items-baseline gap-2 relative z-10">
        {hr === null ? (
          <span className="text-sm font-bold text-rose/50">No finger detected</span>
        ) : (
          <>
            <span className={cn("text-5xl font-serif font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{hr}</span>
            <span className="text-rose text-xs font-bold uppercase tracking-widest">bpm</span>
          </>
        )}
      </div>

      <div className="h-20 w-full mt-4 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <Line 
              type="monotone" 
              dataKey="heart_rate" 
              stroke="#C4526E" 
              strokeWidth={3} 
              dot={false} 
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const SpO2Card = ({ value, theme = 'dark' }: { value: number | null, theme?: 'dark' | 'light' }) => {
  const color = value === null ? 'text-rose/30' : value >= 95 ? 'text-green-400' : value >= 90 ? 'text-yellow-400' : 'text-red-400';
  const percentage = value || 0;
  
  return (
    <div className={cn(
      "backdrop-blur-xl p-5 rounded-[2rem] border shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-500",
      theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
    )}>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose/5 rounded-full blur-2xl -ml-8 -mb-8 group-hover:bg-rose/10 transition-colors" />
      <div className="absolute top-4 left-4 flex items-center gap-2 text-rose z-10">
        <Wind size={18} />
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">SpO2</span>
      </div>
      
      <div className="relative w-28 h-28 flex items-center justify-center mt-4 z-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
          <circle cx="56" cy="56" r="46" fill="none" stroke={theme === 'dark' ? "rgba(236, 226, 208, 0.05)" : "rgba(109, 46, 70, 0.05)"} strokeWidth="8" />
          <circle 
            cx="56" cy="56" r="46" fill="none" stroke="currentColor" strokeWidth="8" 
            strokeDasharray={289.02} strokeDashoffset={289.02 * (1 - percentage / 100)}
            strokeLinecap="round"
            className={`${color} transition-all duration-1000`}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-3xl font-serif font-bold ${color}`}>{value !== null ? value.toFixed(0) : '--'}</span>
          <span className="text-[8px] font-bold text-rose/40 uppercase tracking-widest">%</span>
        </div>
      </div>
    </div>
  );
};

export const TemperatureCard = ({ body, ambient, theme = 'dark' }: { body: number | null, ambient: number | null, theme?: 'dark' | 'light' }) => (
  <div className={cn(
    "backdrop-blur-xl p-5 rounded-[2rem] border shadow-2xl transition-all duration-500",
    theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
  )}>
    <div className="flex items-center gap-2 text-rose mb-4">
      <Thermometer size={18} />
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Temperature</span>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className={cn("p-3 rounded-2xl border", theme === 'dark' ? "bg-white/5 border-white/5" : "bg-berry/5 border-berry/5")}>
        <p className="text-[8px] font-bold text-rose/40 uppercase tracking-widest mb-1">Body</p>
        <div className="flex items-baseline gap-1">
          <span className={cn("text-2xl font-serif font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{body?.toFixed(1) || '--'}</span>
          <span className="text-rose text-[10px] font-bold">°C</span>
        </div>
      </div>
      <div className={cn("p-3 rounded-2xl border", theme === 'dark' ? "bg-white/5 border-white/5" : "bg-berry/5 border-berry/5")}>
        <p className="text-[8px] font-bold text-rose/40 uppercase tracking-widest mb-1">Ambient</p>
        <div className="flex items-baseline gap-1">
          <span className={cn("text-2xl font-serif font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{ambient?.toFixed(1) || '--'}</span>
          <span className="text-rose text-[10px] font-bold">°C</span>
        </div>
      </div>
    </div>
    
    <div className={cn("mt-4 h-1.5 w-full rounded-full overflow-hidden", theme === 'dark' ? "bg-white/5" : "bg-berry/5")}>
      <motion.div 
        className="h-full bg-gradient-to-r from-rose to-accent-pink" 
        initial={{ width: 0 }}
        animate={{ width: `${((body || 36) - 35) * 20}%` }}
      />
    </div>
  </div>
);

export const MovementCard = ({ accel, gyro, theme = 'dark' }: { accel: {x:number, y:number, z:number}, gyro: {x:number, y:number, z:number}, theme?: 'dark' | 'light' }) => {
  const isMoving = Math.abs(accel.x) + Math.abs(accel.y) > 0.5;
  const status = isMoving ? 'Active' : 'Resting';
  
  return (
    <div className={cn(
      "backdrop-blur-xl p-5 rounded-[2rem] border shadow-2xl transition-all duration-500",
      theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
    )}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-rose">
          <Navigation size={18} />
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Movement</span>
        </div>
        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${isMoving ? 'bg-green-400/10 text-green-400' : 'bg-rose/10 text-rose'}`}>
          {status}
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-[8px] font-bold text-rose/40 uppercase tracking-widest mb-2 px-1">Accelerometer (g)</p>
          <div className="grid grid-cols-3 gap-2">
            {['x', 'y', 'z'].map(axis => (
              <div key={axis} className={cn("p-2 rounded-xl text-center border", theme === 'dark' ? "bg-white/5 border-white/5" : "bg-berry/5 border-berry/5")}>
                <span className="text-[8px] text-rose/40 block uppercase font-bold">{axis}</span>
                <span className={cn("text-xs font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{(accel as any)[axis].toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[8px] font-bold text-rose/40 uppercase tracking-widest mb-2 px-1">Gyroscope (°/s)</p>
          <div className="grid grid-cols-3 gap-2">
            {['x', 'y', 'z'].map(axis => (
              <div key={axis} className={cn("p-2 rounded-xl text-center border", theme === 'dark' ? "bg-white/5 border-white/5" : "bg-berry/5 border-berry/5")}>
                <span className="text-[8px] text-rose/40 block uppercase font-bold">{axis}</span>
                <span className={cn("text-xs font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{(gyro as any)[axis].toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const RiskScoreCard = ({ score, theme = 'dark' }: { score: number, theme?: 'dark' | 'light' }) => {
  const color = score < 30 ? 'text-green-400' : score < 70 ? 'text-yellow-400' : 'text-red-400';
  
  return (
    <div className={cn(
      "backdrop-blur-xl p-6 rounded-[2.5rem] border shadow-2xl flex flex-col items-center relative overflow-hidden transition-all duration-500",
      theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
    )}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose/20 to-transparent" />
      <h3 className="text-rose text-[10px] font-bold uppercase tracking-[0.2em] mb-6 opacity-60">PCOS Risk Analysis</h3>
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle cx="88" cy="88" r="76" fill="none" stroke={theme === 'dark' ? "rgba(236, 226, 208, 0.05)" : "rgba(109, 46, 70, 0.05)"} strokeWidth="12" />
          <circle 
            cx="88" cy="88" r="76" fill="none" stroke="currentColor" strokeWidth="12" 
            strokeDasharray={477.5} strokeDashoffset={477.5 * (1 - score / 100)}
            strokeLinecap="round"
            className={`${color} transition-all duration-1000 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]`}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-6xl font-serif font-bold ${color}`}>{score}</span>
          <span className="text-[8px] font-bold text-rose/40 uppercase tracking-[0.3em] mt-1">Percent</span>
        </div>
      </div>
    </div>
  );
};

export const RecommendationCard = ({ text, theme = 'dark' }: { text: string, theme?: 'dark' | 'light' }) => (
  <div className={cn(
    "p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group transition-all duration-500",
    theme === 'dark' ? "bg-gradient-to-br from-accent-pink to-rose" : "bg-gradient-to-br from-berry to-rose"
  )}>
    <div className="relative z-10">
      <div className="flex items-center gap-2 text-cream/80 mb-3">
        <Sparkles size={18} className="animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Daily Insight</span>
      </div>
      <p className="text-cream font-medium leading-relaxed text-sm">
        {text}
      </p>
    </div>
    <div className="absolute top-[-20%] right-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-700">
      <Sparkles size={140} />
    </div>
    <div className="absolute bottom-[-10%] left-[-5%] w-24 h-24 bg-white/10 rounded-full blur-2xl" />
  </div>
);

export const HistoricalChart = ({ history, theme = 'dark' }: { history: any[], theme?: 'dark' | 'light' }) => (
  <div className={cn(
    "backdrop-blur-xl p-6 rounded-[2rem] border shadow-2xl transition-all duration-500",
    theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
  )}>
    <div className="flex items-center gap-2 text-rose mb-6">
      <Activity size={18} />
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Historical Trends</span>
    </div>
    
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history}>
          <defs>
            <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C4526E" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#C4526E" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="timestamp" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme === 'dark' ? '#6D2E46' : '#ECE2D0', 
              border: 'none', 
              borderRadius: '16px', 
              color: theme === 'dark' ? '#ECE2D0' : '#6D2E46', 
              fontSize: '12px' 
            }}
            itemStyle={{ color: theme === 'dark' ? '#ECE2D0' : '#6D2E46' }}
          />
          <Area 
            type="monotone" 
            dataKey="heart_rate" 
            stroke="#C4526E" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorHR)" 
            name="Heart Rate"
          />
          <Area 
            type="monotone" 
            dataKey="ds18b20_temp" 
            stroke={theme === 'dark' ? "#ECE2D0" : "#6D2E46"} 
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="transparent" 
            name="Body Temp"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const Sparkles = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);
