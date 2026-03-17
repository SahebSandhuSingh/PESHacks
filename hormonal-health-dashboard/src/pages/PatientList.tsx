import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, UserCircle, Activity, ChevronRight, Filter, MoreHorizontal, LayoutGrid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export const PatientList = () => {
  const { selectPatient } = useAuth();
  const navigate = useNavigate();

  const patients = [
    { id: 'DH-289', name: 'Pragya S.', risk: 'Moderate', status: 'Recent Anomaly', age: 24, lastSync: '2m ago' },
    { id: 'DH-302', name: 'Ananya R.', risk: 'Low', status: 'Stable', age: 29, lastSync: '15m ago' },
    { id: 'DH-156', name: 'Mehak G.', risk: 'High', status: 'Critical Threshold', age: 31, lastSync: 'Just now' },
    { id: 'DH-441', name: 'Ishita K.', risk: 'Low', status: 'Stable', age: 22, lastSync: '1h ago' },
  ];

  const handleSelect = (id: string) => {
    selectPatient(id);
    navigate('/doctor');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Patient Directory</h1>
          <p className="text-slate-500 font-medium">Managing {patients.length} active monitoring sessions</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl p-2 rounded-2xl border border-white shadow-sm">
          <div className="flex p-1 bg-slate-100 rounded-xl">
             <button className="p-2 bg-white rounded-lg shadow-sm text-slate-900"><List size={18} /></button>
             <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><LayoutGrid size={18} /></button>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
            <Filter size={16} /> Filter
          </button>
        </div>
      </header>

      <div className="bg-white/40 backdrop-blur-2xl rounded-[32px] border border-white overflow-hidden shadow-xl shadow-slate-200/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Risk Profile</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Activity</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {patients.map((p) => (
              <tr key={p.id} className="hover:bg-slate-100/30 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500">
                      <UserCircle size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{p.name}</h4>
                      <p className="text-xs font-semibold text-slate-400">{p.id} • {p.age}y</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className={clsx(
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ring-1",
                    p.risk === 'High' ? "bg-rose-50 text-rose-600 ring-rose-100" :
                    p.risk === 'Moderate' ? "bg-amber-50 text-amber-600 ring-amber-100" :
                    "bg-teal-50 text-teal-600 ring-teal-100"
                  )}>
                    <Activity size={12} /> {p.risk} Risk
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-bold text-slate-600">{p.status}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className="text-xs font-bold text-slate-400">Sync: {p.lastSync}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => handleSelect(p.id)}
                    className="p-2 rounded-xl text-slate-300 hover:text-teal-600 hover:bg-teal-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <button className="p-2 rounded-xl text-slate-300 hover:text-slate-600 transition-all">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
