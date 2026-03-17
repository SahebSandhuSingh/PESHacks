import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export const PeriodCalendar = () => {
  // Mock cycle data for Pragya S.
  // Last period started Feb 22, 2026.
  // Typical cycle 28 days.
  const currentMonth = new Date(2026, 2, 1); // March 2026
  const daysInMonth = 31;
  const startDay = new Date(2026, 2, 1).getDay(); // Sunday=0, etc.

  // Date masks
  const lastPeriodDays = [1, 2, 3, 4, 5]; // Remnants of last period in late Feb? No, let's say March 22 is predicted.
  // Actually let's mock March specifically.
  // Prediction: Period starts around March 22-26.
  const predictedPeriodDays = [22, 23, 24, 25, 26];
  const ovulationDays = [8, 9, 10]; // High fertility
  const loggedDays = [28]; // Maybe she logged a symptom today

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const renderDays = () => {
    const totalSlots = 35; // 5 weeks
    const days = [];
    
    // Fill empty slots before start of month
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isPredicted = predictedPeriodDays.includes(d);
      const isOvulation = ovulationDays.includes(d);
      const isLogged = loggedDays.includes(d);
      const isToday = d === 14; // Mocking today as March 14

      days.push(
        <div 
          key={d} 
          className={clsx(
            "h-10 w-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all relative group cursor-default",
            isToday ? "bg-slate-900 text-white shadow-lg scale-110 z-10" : "text-slate-600 hover:bg-white/40",
            isPredicted && "bg-rose-100 text-rose-600 border border-rose-200",
            isOvulation && "bg-teal-50 text-teal-600 border border-teal-100",
          )}
        >
          {d}
          {isPredicted && (
            <div className="absolute inset-0 bg-rose-500/10 rounded-xl animate-pulse" />
          )}
          {isLogged && (
             <div className="absolute bottom-1 w-1 h-1 bg-purple-500 rounded-full" />
          )}
          {isPredicted && d === 22 && (
             <Sparkles size={8} className="absolute -top-1 -right-1 text-rose-500" />
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white/60 backdrop-blur-2xl rounded-[40px] p-8 border border-white shadow-xl shadow-rose-500/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <header className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon size={20} className="text-rose-500" />
            Cycle Prediction
          </h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">March 2026</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-white rounded-xl shadow-sm text-slate-400 hover:text-slate-900 transition-colors border border-slate-50">
            <ChevronLeft size={18} />
          </button>
          <button className="p-2 bg-white rounded-xl shadow-sm text-slate-400 hover:text-slate-900 transition-colors border border-slate-50">
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-y-4 mb-8">
        {weekDays.map(w => (
          <div key={w} className="text-center text-[10px] font-black text-slate-300 uppercase letter tracking-widest">{w}</div>
        ))}
        {renderDays()}
      </div>

      <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100">
        <LegendItem color="bg-rose-500" label="AI Predicted Flow" />
        <LegendItem color="bg-teal-400" label="Fertile Window" />
        <LegendItem color="bg-purple-500" label="Logged Symptom" />
        <LegendItem color="bg-slate-900" label="Today" />
      </div>

      <div className="mt-8 p-6 bg-gradient-to-br from-rose-50 to-purple-50 rounded-3xl border border-white/60">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <Sparkles className="text-rose-500" size={24} />
            </div>
            <div>
                <h4 className="text-sm font-black text-slate-900 tracking-tight">Period expected in 8 days</h4>
                <p className="text-[11px] font-bold text-slate-500">Prediction accuracy high based on last 3 cycles</p>
            </div>
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-2">
    <div className={clsx("w-2 h-2 rounded-full", color)} />
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
  </div>
);
