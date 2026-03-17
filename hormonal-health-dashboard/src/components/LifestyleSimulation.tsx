import { useState } from 'react';
import { Play, Activity, Moon, Candy, BrainCircuit, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export const LifestyleSimulation = () => {
  const [sleep, setSleep] = useState(7);
  const [exercise, setExercise] = useState(30);
  const [sugar, setSugar] = useState(50);
  const [meditation, setMeditation] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runSimulation = () => {
    setIsRunning(true);
    // Simulate AI prediction parsing
    setTimeout(() => {
      setResults({
        stress: { from: 0.60, to: Math.max(0.2, 0.60 - (meditation * 0.015) - (sleep > 6 ? 0.1 : -0.1)).toFixed(2) },
        sleepQuality: { from: 0.50, to: Math.min(0.95, 0.50 + (sleep * 0.05) - (sugar > 60 ? 0.1 : 0)).toFixed(2) },
        hormonalBalance: (sugar < 40 && exercise > 20) ? 'Significantly Improved' : 'Stable'
      });
      setIsRunning(false);
    }, 1200);
  };

  const Slider = ({ icon: Icon, label, value, min, max, unit, setter, color }: any) => (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Icon size={16} className={color} /> {label}
        </label>
        <span className="text-xl font-extrabold text-gray-900">{value}<span className="text-xs font-bold text-gray-400 ml-1">{unit}</span></span>
      </div>
      <input 
        type="range" min={min} max={max} value={value} 
        onChange={e => setter(Number(e.target.value))}
        className={clsx(
          "w-full h-2 rounded-full appearance-none bg-gray-200 cursor-pointer accent-current",
          color.replace('text-', 'accent-')
        )}
      />
    </div>
  );

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/60 p-6 sm:p-8 flex flex-col shadow-xl shadow-purple-500/5 relative overflow-hidden group">
      
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
      
      <div className="flex items-center gap-2 mb-8 relative z-10">
        <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
          <BrainCircuit size={20} />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">AI Lifestyle Simulator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8 relative z-10">
        <Slider icon={Moon} label="Sleep Target" value={sleep} min={4} max={12} unit="hrs" setter={setSleep} color="text-indigo-500" />
        <Slider icon={Activity} label="Daily Exercise" value={exercise} min={0} max={120} unit="min" setter={setExercise} color="text-rose-500" />
        <Slider icon={Candy} label="Sugar Intake" value={sugar} min={0} max={100} unit="g" setter={setSugar} color="text-orange-500" />
        <Slider icon={BrainCircuit} label="Meditation" value={meditation} min={0} max={60} unit="min" setter={setMeditation} color="text-teal-500" />
      </div>

      {!results ? (
        <button 
          onClick={runSimulation}
          disabled={isRunning}
          className="mt-auto w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 relative z-10"
        >
          {isRunning ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><Play size={18} fill="currentColor" /> Run Predictive Simulation</>
          )}
        </button>
      ) : (
        <div className="mt-auto bg-purple-50 rounded-2xl p-6 border border-purple-100 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2"><SparklesIcon /> 14-Day Forecast Output</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-gray-600">Stress Index</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 line-through">{results.stress.from}</span>
                <ArrowRight size={14} className="text-purple-400" />
                <span className="text-purple-700 font-extrabold text-base">{results.stress.to}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-gray-600">Sleep Quality</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 line-through">{results.sleepQuality.from}</span>
                <ArrowRight size={14} className="text-teal-400" />
                <span className="text-teal-700 font-extrabold text-base">{results.sleepQuality.to}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold pt-2 border-t border-purple-200/50">
              <span className="text-gray-600">Hormonal Balance</span>
              <span className={clsx("font-extrabold", results.hormonalBalance.includes('Improved') ? "text-teal-600" : "text-amber-600")}>
                {results.hormonalBalance}
              </span>
            </div>
          </div>
          <button onClick={() => setResults(null)} className="mt-5 w-full py-2.5 rounded-xl bg-white text-purple-600 font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors">
            Reset Simulation
          </button>
        </div>
      )}
    </div>
  );
};

const SparklesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);
