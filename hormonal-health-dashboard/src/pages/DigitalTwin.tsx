import { useHealthData } from '../services/api';
import { Loader2 } from 'lucide-react';
import { InteractiveBody } from '../components/InteractiveBody';
import { SparklineCard } from '../components/SparklineCard';
import { LifestyleSimulation } from '../components/LifestyleSimulation';
import { HormoneBars } from '../components/HormoneBars';
import { CycleTimeline } from '../components/CycleTimeline';
import { ConnectedDevices } from '../components/ConnectedDevices';
import { RiskGauge } from '../components/RiskGauge';

export const DigitalTwin = () => {
  const { data, history, loading, error } = useHealthData();

  if (loading && !data) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  if (error && !data) return <div className="text-red-500">{error}</div>;

  const twin = data?.ai_predictions?.twin || { stress_index: 0, sleep_stability: 0, activity_score: 0, temperature_cycle_stability: 0 };
  
  // Calculate a mock risk score from stress and sleep for the gauge
  const riskScore = ((twin.stress_index || 0) + (1 - (twin.sleep_stability || 1))) / 2;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <header className="mb-6 mt-2 flex flex-col items-start gap-1">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-purple-800 tracking-tight">Twin</h1>
        <p className="text-purple-600/80 font-bold tracking-widest uppercase text-xs">Futuristic Simulation Hub</p>
      </header>

      {/* Row 1: Sparkline Metrics (4 Cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SparklineCard 
          title="Stress Index" value={twin.stress_index?.toFixed(2)} trend="up" colorTheme="rose" 
          data={history} dataKey="ai_predictions.twin.stress_index" 
          tooltipText="Neurological stress variance over the last 24h. Higher levels impact cycle stability."
        />
        <SparklineCard 
          title="Sleep Stability" value={twin.sleep_stability?.toFixed(2)} trend="up" colorTheme="purple" 
          data={history} dataKey="ai_predictions.twin.sleep_stability" 
          tooltipText="REM sleep consistency. Crucial for metabolic regulation in PCOS."
        />
        <SparklineCard 
          title="Activity Score" value={twin.activity_score?.toFixed(2)} trend="stable" colorTheme="teal" 
          data={history} dataKey="ai_predictions.twin.activity_score" 
          tooltipText="Daily cardiovascular exertion measured against baselines."
        />
        <SparklineCard 
          title="Temp Rhythm" value={twin.temperature_cycle_stability?.toFixed(2)} trend="down" colorTheme="orange" 
          data={history} dataKey="ai_predictions.twin.temperature_cycle_stability" 
          tooltipText="Basal body temperature rhythm tracking for ovulation windows."
        />
      </div>

      {/* Row 2: Visual Analyzers (3 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ConnectedDevices />
        <InteractiveBody metrics={{
          stress: twin.stress_index,
          activity: twin.activity_score,
          metabolism: 0.8, // Mocked 
          hormones: 0.6 // Mocked
        }} />
        <RiskGauge score={riskScore} />
      </div>

      {/* Row 3: Simulation & Hormones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-full">
          <LifestyleSimulation />
        </div>
        <HormoneBars 
          estrogen={0.6} // Mocked predicted variance
          progesterone={0.3} 
          androgen={0.8}
        />
      </div>

      {/* Row 4: Timeline */}
      <div className="w-full">
        <CycleTimeline />
      </div>

    </div>
  );
};
