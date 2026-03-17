import { useHealthData } from '../services/api';
import { SensorChart } from '../components/SensorChart';
import { Heart, Wind, Thermometer, Activity, Loader2 } from 'lucide-react';

export const Sensors = () => {
  const { data, history, loading, error } = useHealthData();

  if (loading && !data) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;
  if (error && !data) return <div className="text-red-500">{error}</div>;

  const sensor = data?.sensor_data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="mb-8 mt-2">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">Hardware</h1>
        <p className="text-gray-500 font-semibold text-lg">Raw ESP32 Streams</p>
      </header>

      {/* Raw Values Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RawCard icon={Heart} label="Heart Rate" value={sensor?.heart_rate} unit="bpm" />
        <RawCard icon={Wind} label="SpO2" value={sensor?.spo2} unit="%" />
        <RawCard icon={Thermometer} label="Body Temp" value={sensor?.ds18b20_temp} unit="°C" />
        <RawCard icon={Activity} label="Ambient Temp" value={sensor?.dht22_temp} unit="°C" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-6 border border-white/50 shadow-xl shadow-blue-500/10">
           <h3 className="text-sm font-bold text-blue-900 mb-4 uppercase tracking-wider opacity-80">SpO2 History</h3>
           <SensorChart data={history} dataKey="sensor_data.spo2" color="#007aff" name="Blood Oxygen %" />
        </div>
        
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-6 border border-white/50 shadow-xl shadow-orange-500/10">
           <h3 className="text-sm font-bold text-orange-900 mb-4 uppercase tracking-wider opacity-80">Body Temp History</h3>
           <SensorChart data={history} dataKey="sensor_data.ds18b20_temp" color="#ff9500" name="Temperature °C" />
        </div>
      </div>
    </div>
  );
};

const RawCard = ({ icon: Icon, label, value, unit }: any) => (
  <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/50 shadow-lg shadow-purple-500/5 flex flex-col items-start transition-all hover:-translate-y-1 hover:shadow-purple-500/10">
    <Icon size={24} className="text-purple-400 mb-3" />
    <span className="text-2xl font-extrabold text-gray-900 tracking-tight">{value?.toFixed(1) || '--'}</span>
    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{label} {unit}</span>
  </div>
);
