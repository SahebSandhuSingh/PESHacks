import { useHealthData } from '../services/api';
import { HealthCard } from '../components/HealthCard';
import { SensorChart } from '../components/SensorChart';
import { Activity, Brain, Moon, Thermometer, Loader2 } from 'lucide-react';

export const Dashboard = () => {
  const { data, history, loading, error } = useHealthData();

  if (loading && !data) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Syncing with Dhadkan AI...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="h-full flex items-center justify-center text-red-500 font-semibold bg-red-50 rounded-3xl border border-red-100">
        Connection Error: {error}
      </div>
    );
  }

  const twin = data?.ai_predictions?.twin;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-8 mt-2">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">Log</h1>
        <p className="text-gray-500 font-semibold text-lg">Physiological Overview</p>
      </header>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HealthCard
          title="Stress Index"
          value={twin?.stress_index?.toFixed(2) || '--'}
          icon={Activity}
          trend="down"
          themeClass="red"
        />
        <HealthCard
          title="Sleep Stability"
          value={twin?.sleep_stability?.toFixed(2) || '--'}
          icon={Moon}
          trend="up"
          themeClass="purple"
        />
        <HealthCard
          title="Activity Score"
          value={twin?.activity_score?.toFixed(2) || '--'}
          icon={Brain}
          trend="stable"
          themeClass="green"
        />
        <HealthCard
          title="Temperature Rhythm"
          value={twin?.temperature_cycle_stability?.toFixed(2) || '--'}
          icon={Thermometer}
          trend="up"
          themeClass="orange"
        />
      </div>

      {/* Central Chart Area */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-6 border border-white/60 shadow-xl shadow-rose-500/5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Live Heart Rate Trends</h2>
          <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
          </span>
        </div>
        <SensorChart 
          data={history} 
          dataKey="sensor_data.heart_rate" 
          color="#ff3b30" 
          name="Heart Rate (BPM)"
        />
      </div>
    </div>
  );
};
