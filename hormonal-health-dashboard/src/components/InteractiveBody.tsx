import { useState } from 'react';
import clsx from 'clsx';
import { Brain, Heart, Activity, Droplets } from 'lucide-react';

interface BodyProps {
  metrics: {
    stress: number;
    activity: number;
    metabolism: number;
    hormones: number;
  };
}

export const InteractiveBody = ({ metrics }: BodyProps) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const regions = [
    { id: 'brain', label: 'Neurological (Stress)', icon: Brain, top: '10%', left: '50%', value: metrics.stress, status: metrics.stress > 0.6 ? 'red' : 'green' },
    { id: 'heart', label: 'Cardiovascular (Activity)', icon: Heart, top: '30%', left: '50%', value: metrics.activity, status: metrics.activity < 0.5 ? 'yellow' : 'green' },
    { id: 'core', label: 'Metabolic Health', icon: Activity, top: '50%', left: '50%', value: metrics.metabolism, status: 'green' },
    { id: 'pelvis', label: 'Reproductive (Hormones)', icon: Droplets, top: '70%', left: '50%', value: metrics.hormones, status: metrics.hormones < 0.8 ? 'yellow' : 'green' },
  ];

  const getStatusColor = (status: string, isHovered: boolean) => {
    if (status === 'red') return isHovered ? 'bg-rose-500 shadow-rose-500/50' : 'bg-rose-400/80 shadow-rose-400/30';
    if (status === 'yellow') return isHovered ? 'bg-amber-500 shadow-amber-500/50' : 'bg-amber-400/80 shadow-amber-400/30';
    return isHovered ? 'bg-teal-500 shadow-teal-500/50' : 'bg-teal-400/80 shadow-teal-400/30';
  };

  return (
    <div className="relative w-full h-[500px] bg-white/40 backdrop-blur-xl rounded-[32px] border border-white/60 p-6 flex flex-col items-center justify-center shadow-xl overflow-hidden group">
      
      {/* Background Stylized Body Shape (Futuristic Pill/Wireframe container) */}
      <div className="absolute inset-x-0 h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
        <div className="w-40 md:w-48 h-80 md:h-96 border-2 border-purple-300 rounded-[100px] relative mt-10">
          {/* Shoulders */}
          <div className="absolute top-16 -left-[20%] w-[140%] h-32 border border-purple-300 rounded-t-[100px]" />
        </div>
      </div>

      <h3 className="absolute top-6 left-6 text-sm font-bold text-gray-500 tracking-widest uppercase z-10">Physiological Map</h3>

      {/* Interactive Hotspots */}
      {regions.map((region) => {
        const isHovered = hoveredRegion === region.id;
        
        return (
          <div 
            key={region.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
            style={{ top: region.top, left: region.left }}
            onMouseEnter={() => setHoveredRegion(region.id)}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            {/* Glowing Pulse Underlay */}
            <div className={clsx(
              "absolute inset-0 rounded-full blur-xl transition-all duration-500",
              getStatusColor(region.status, isHovered),
              isHovered ? "scale-150 opacity-60" : "scale-100 opacity-30 animate-pulse"
            )} />
            
            {/* Interactive Node */}
            <div className={clsx(
              "relative w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-lg",
              getStatusColor(region.status, isHovered),
              "border-white/80 text-white backdrop-blur-md",
              isHovered ? "scale-110" : "scale-100"
            )}>
              <region.icon size={24} className={isHovered ? "animate-bounce" : ""} />
            </div>

            {/* Hover Data Card - Positioned adaptively */}
            <div className={clsx(
              "absolute top-full lg:left-full lg:-translate-y-1/2 mt-2 lg:mt-0 lg:ml-4 flex flex-col items-center lg:items-start w-48 bg-white/95 backdrop-blur-3xl p-4 rounded-2xl border border-white shadow-2xl transition-all duration-300 pointer-events-none z-50",
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}>
              <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 whitespace-nowrap text-center lg:text-left">{region.label}</div>
              <div className="text-xl sm:text-2xl font-extrabold text-gray-900">{region.value.toFixed(2)}</div>
              <div className={clsx(
                "text-xs font-semibold mt-1",
                region.status === 'red' ? 'text-rose-500' : region.status === 'yellow' ? 'text-amber-500' : 'text-teal-500'
              )}>
                {region.status === 'red' ? 'Risk Detected' : region.status === 'yellow' ? 'Moderate Variance' : 'Optimal Zone'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
