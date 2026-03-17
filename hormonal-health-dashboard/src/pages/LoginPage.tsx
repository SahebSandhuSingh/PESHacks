import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Stethoscope, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: 'patient' | 'doctor') => {
    login(role);
    if (role === 'doctor') {
      navigate('/patients');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-teal-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-200/40 rounded-full blur-3xl" />

      <div className="max-w-4xl w-full relative z-10 flex flex-col items-center">
        <header className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full text-purple-600 font-black tracking-widest text-[10px] uppercase">
            <Sparkles size={14} />
            Digital Hormonal Twin
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Welcome Back</h1>
          <p className="text-slate-500 font-medium text-lg">Please select your portal to continue</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
          {/* Patient Card */}
          <button 
            onClick={() => handleLogin('patient')}
            className="group relative bg-white/60 backdrop-blur-2xl p-10 rounded-[40px] border border-white focus:outline-none transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-[80px] group-hover:bg-purple-500/10 transition-colors" />
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <User className="text-purple-600" size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Login as Patient</h3>
            <p className="text-slate-500 font-medium leading-relaxed">Access your digital twin, daily insights, and personal health trends.</p>
            <div className="mt-8 flex items-center gap-2 text-purple-600 font-bold text-sm">
              Enter Dashboard →
            </div>
          </button>

          {/* Doctor Card */}
          <button 
            onClick={() => handleLogin('doctor')}
            className="group relative bg-white/60 backdrop-blur-2xl p-10 rounded-[40px] border border-white focus:outline-none transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-teal-500/10 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-[80px] group-hover:bg-teal-500/10 transition-colors" />
            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <Stethoscope className="text-teal-600" size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Login as Doctor</h3>
            <p className="text-slate-500 font-medium leading-relaxed">Manage patients, review clinical diagnostics, and track pathologies.</p>
            <div className="mt-8 flex items-center gap-2 text-teal-600 font-bold text-sm">
              Medical Portal →
            </div>
          </button>
        </div>

        <footer className="mt-20 flex items-center gap-2 text-slate-400 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise Grade Security & Privacy</span>
        </footer>
      </div>
    </div>
  );
};
