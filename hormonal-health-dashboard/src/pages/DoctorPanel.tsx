import { useHealthData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, AlertTriangle, FileText, Activity, Clock, ShieldCheck, FileSearch, User, MapPin, Calendar, Heart } from 'lucide-react';
import { SparklineCard } from '../components/SparklineCard';
import clsx from 'clsx';

export const DoctorPanel = () => {
  const { userRole } = useAuth();
  const { data, history, loading } = useHealthData();
  const sensor = data?.sensor_data;
  const twin = data?.ai_predictions?.twin;

  const anomalies = [
    { type: 'Temperature Spike', time: '14:32 (2h ago)', severity: 'high', metric: 'DS18B20' },
    { type: 'HRV Drop > 15%', time: '08:15 (8h ago)', severity: 'medium', metric: 'MAX30100' },
    { type: 'Irregular SpO2', time: '03:44 (12h ago)', severity: 'low', metric: 'MAX30100' },
  ];

  const isDoctor = userRole === 'doctor';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      {/* Clinical Header */}
      <header className="mb-8 mt-2 flex justify-between items-end border-b-2 border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope size={32} className="text-slate-800" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {isDoctor ? 'Clinical Diagnostics' : 'Consultation Hub'}
            </h1>
          </div>
          <p className="text-slate-500 font-bold tracking-wide uppercase text-[10px] pl-11 flex items-center gap-2">
            {isDoctor ? (
              <>Practitioner View <span className="text-slate-300">•</span> Patient ID: DH-289</>
            ) : (
              <>Patient View <span className="text-slate-300">•</span> Dr. Sarah Wilson's Office</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
          <ShieldCheck size={18} className="text-emerald-600" />
          <span className="text-emerald-700 font-bold text-xs uppercase tracking-tighter">
            {isDoctor ? 'HIPAA Compliant Session' : 'Secured Care Channel'}
          </span>
        </div>
      </header>

      {/* Row 1: Key Metrics (DOCTOR Sees Raw, PATIENT sees Care Team) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isDoctor ? (
          <>
            <MetricBox title="Body Temp" val={sensor?.ds18b20_temp?.toFixed(1) || '--'} unit="°C" norm="36.5 - 37.2" status="normal" />
            <MetricBox title="Heart Rate" val={sensor?.heart_rate || '--'} unit="BPM" norm="60 - 100" status={(sensor?.heart_rate ?? 0) > 100 ? 'elevated' : 'normal'} />
            <MetricBox title="SpO2 Level" val={sensor?.spo2 || '--'} unit="%" norm="> 95%" status="normal" />
            <MetricBox title="Activity" val={sensor?.accel_x?.toFixed(2) || '--'} unit="m/s²" norm="Active" status="normal" />
          </>
        ) : (
          <>
            <CareInfoBox title="Care Plan" val="Active" sub="PCOS Mgmt Phase 2" icon={ShieldCheck} color="text-emerald-600" />
            <CareInfoBox title="Next Review" val="Mar 24" sub="Follow-up Appointment" icon={Calendar} color="text-indigo-600" />
            <CareInfoBox title="Recent Notes" val="03" sub="Practitioner Updates" icon={FileText} color="text-amber-600" />
            <CareInfoBox title="Clinic Status" val="Online" sub="Telehealth Available" icon={Heart} color="text-rose-500" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Col 1 & 2: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/60 backdrop-blur-2xl rounded-[32px] shadow-sm border border-slate-200 p-8">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-blue-500" />
              {isDoctor ? 'Continuous Telemetry Analysis' : 'Your Physiological Trends'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SparklineCard 
                title={isDoctor ? "Clinical Stress Vector" : "Neural Stress Levels"} 
                value={twin?.stress_index?.toFixed(2) || '0.00'} trend="up" colorTheme="purple" 
                data={history} dataKey="ai_predictions.twin.stress_index" 
                tooltipText=""
              />
              <SparklineCard 
                title={isDoctor ? "Basal Temp Variance" : "Sleep Cycle Stability"} 
                value={twin?.temperature_cycle_stability?.toFixed(2) || '0.00'} trend="down" colorTheme="rose" 
                data={history} dataKey="ai_predictions.twin.temperature_cycle_stability" 
                tooltipText=""
              />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-2xl rounded-[32px] shadow-sm border border-slate-200 p-8">
             <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <FileSearch size={22} className="text-indigo-500" />
              {isDoctor ? 'Automated DHT Pathology Report' : 'Doctor\'s Observations'}
            </h3>
            <div className="prose prose-sm text-slate-600 max-w-none bg-slate-50 p-6 rounded-2xl border border-slate-100 italic font-medium leading-relaxed">
              "{isDoctor 
                ? "Patient exhibits strong correlation between elevated afternoon cortisol markers (GSR proxy) and subsequent suppression of REM sleep stability. Current trajectory indicates a 68% probability of delayed ovulation in the current cycle. Continuous SpO2 and Heart Rate metrics remain within nominal bounds."
                : "Your recent data shows that higher stress levels in the afternoon are affecting your sleep quality. This pattern might delay your next cycle by a few days. Don't worry, your heart rate and oxygen levels look great. Focus on the breathing exercises we discussed in our last session."
              }"
            </div>
          </div>
        </div>

        {/* Col 3: Side Panel */}
        <div className="space-y-6">
          {/* Anomalies section - Filtered for Doctor only or simplified for patient */}
          {isDoctor ? (
            <div className="bg-rose-500 rounded-[32px] shadow-xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                <AlertTriangle size={20} className="text-rose-200" />
                Detected Anomalies
              </h3>
              <div className="space-y-4">
                {anomalies.map((a, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/20">
                    <div className={clsx("w-2 h-2 mt-2 rounded-full shrink-0", 
                      a.severity === 'high' ? 'bg-rose-100 animate-pulse' : 'bg-white/40'
                    )} />
                    <div>
                      <h4 className="text-sm font-bold text-white">{a.type}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-rose-100 font-bold mt-1 uppercase tracking-wider">
                        <Clock size={12} /> {a.time} • <span className="opacity-60">{a.metric}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-[32px] shadow-xl p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
               <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                <User size={20} className="text-indigo-400" />
                Your Care Team
              </h3>
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Doctor" className="w-12 h-12 rounded-full bg-white/10" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Dr. Sarah Wilson</h4>
                      <p className="text-xs font-semibold text-indigo-300">Lead Endocrinologist</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <MapPin size={18} className="text-indigo-400" />
                    <span className="text-xs font-bold">PES University Health Center</span>
                 </div>
              </div>
              <button className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-lg text-sm tracking-tight">
                Schedule Consultation
              </button>
            </div>
          )}

          <div className="bg-white rounded-[32px] shadow-sm p-8 border border-slate-200">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <FileText size={20} className="text-blue-500" />
              {isDoctor ? 'Clinical Interventions' : 'Recommended Actions'}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span>{isDoctor ? 'Order Adrenal Panel (Blood)' : 'Increase morning hydration'}</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span>{isDoctor ? 'Adjust Metformin Dosage (+500mg)' : 'Log meditation completion'}</span>
              </li>
            </ul>
            <button className="w-full mt-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-lg text-sm tracking-tight">
              {isDoctor ? 'Update Clinical Record' : 'Submit Today\'s Progress'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const MetricBox = ({ title, val, unit, norm, status }: any) => {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm transition-all hover:border-slate-300">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex justify-between items-center">
        {title}
        {status === 'elevated' && <AlertTriangle size={14} className="text-rose-500 animate-pulse" />}
        {status === 'investigate' && <AlertTriangle size={14} className="text-amber-500" />}
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className={clsx("text-4xl font-black tracking-tighter", 
          status === 'elevated' ? 'text-rose-600' : status === 'investigate' ? 'text-amber-600' : 'text-slate-800'
        )}>{val}</span>
        <span className="text-sm font-black text-slate-400">{unit}</span>
      </div>
      <div className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full inline-block uppercase tracking-wider">
        Norm: {norm}
      </div>
    </div>
  );
}

const CareInfoBox = ({ title, val, sub, icon: Icon, color }: any) => {
  return (
    <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[40px] border border-white flex flex-col items-center text-center transition-all hover:scale-[1.02] shadow-sm">
      <div className={clsx("p-3 rounded-2xl bg-white mb-4 shadow-sm border border-slate-50", color)}>
        <Icon size={24} />
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</span>
      <h4 className="text-2xl font-black text-slate-900 tracking-tighter mb-1">{val}</h4>
      <p className="text-[10px] font-bold text-slate-500 uppercase">{sub}</p>
    </div>
  );
}

