import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, Brain, LayoutDashboard, Stethoscope, Bell, Search, ClipboardList, LogOut, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import { ChatWidget } from './ChatWidget';

export const Navigation = () => {
  const { userRole, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const patientLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/digital-twin', icon: Brain, label: 'Digital Twin' },
    { to: '/recommendations', icon: Stethoscope, label: 'Insights' },
    { to: '/sensors', icon: Activity, label: 'Sensors' },
    { to: '/doctor', icon: ClipboardList, label: 'Consultations' },
  ];

  const doctorLinks = [
    { to: '/patients', icon: Users, label: 'Patients' },
    { to: '/doctor', icon: ClipboardList, label: 'Diagnostics' },
    { to: '/recommendations', icon: Brain, label: 'AI Review' },
  ];

  const links = userRole === 'doctor' ? doctorLinks : patientLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-teal-50 font-sans relative overflow-hidden">
      
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-white/40 backdrop-blur-2xl border-r border-white/60 flex flex-col pt-8 pb-6 px-4 hidden md:flex shrink-0 z-20">

        <div className="space-y-2 flex-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-semibold text-sm",
                  isActive
                    ? "bg-gray-900 text-white shadow-md shadow-gray-400/20"
                    : "text-gray-500 hover:bg-white/60 hover:text-gray-900"
                )
              }
            >
              <link.icon size={20} />
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="mt-auto px-4 space-y-6">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 border border-white/60">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.name || 'User'}`} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200" 
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{userProfile?.name || 'User'}</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-tighter">{userProfile?.id || 'ID-000'}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 font-bold text-sm hover:bg-rose-50 rounded-2xl transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-20">
        {/* Top Header */}
        <header className="h-20 bg-white/30 backdrop-blur-2xl border-b border-white/60 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search health records..." 
              className="w-full bg-white/50 backdrop-blur-md border border-white/50 rounded-full py-2 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-900/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
               Role: {userRole}
            </div>
            <button className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-white/50 flex items-center justify-center text-gray-500 hover:text-purple-600 shadow-sm transition-colors">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Page Outlet */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          <Outlet />
        </div>
        
        {/* Floating Global Chat Assistant */}
        <ChatWidget />
      </main>

    </div>
  );
};
