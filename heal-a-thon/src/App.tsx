import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Bell, 
  Heart, 
  Thermometer, 
  Home, 
  FileText, 
  User, 
  Target, 
  Settings, 
  ArrowLeft, 
  Share2, 
  Sparkles, 
  Lock, 
  LogOut,
  ChevronRight,
  ChevronLeft,
  Plus,
  Mail,
  Eye,
  Activity,
  AlertCircle,
  X,
  ShieldCheck,
  Stethoscope,
  Fingerprint,
  Moon,
  Info,
  Droplets,
  Calendar,
  Users,
  Clock,
  Sun,
  Wind,
  HelpCircle,
  Phone,
  Dna,
  FileSearch
} from 'lucide-react';
import { cn } from './lib/utils';
import { View, UserRole, SensorData } from './types';
import { useSensorData } from './hooks/useSensorData';
import { 
  HeartRateCard, 
  SpO2Card, 
  TemperatureCard, 
  MovementCard, 
  RiskScoreCard, 
  RecommendationCard, 
  HistoricalChart 
} from './components/DashboardCards';

// --- Components ---

const Header = ({ 
  title, 
  showBack, 
  showMenu = true,
  onBack, 
  onMenu, 
  onLogout,
  theme = 'dark'
}: { 
  title: string, 
  showBack?: boolean, 
  showMenu?: boolean,
  onBack?: () => void,
  onMenu?: () => void,
  onLogout?: () => void,
  theme?: 'dark' | 'light'
}) => (
  <header className={cn(
    "flex items-center justify-between p-4 backdrop-blur-md sticky top-0 z-40 border-b transition-colors duration-500",
    theme === 'dark' ? "bg-berry/20 border-rose/10" : "bg-cream/80 border-berry/10"
  )}>
    <div className="flex items-center gap-3">
      {showBack ? (
        <button onClick={onBack} className={cn(
          "p-2 rounded-full transition-colors",
          theme === 'dark' ? "hover:bg-rose/10 text-cream" : "hover:bg-berry/10 text-berry"
        )}>
          <ArrowLeft size={24} />
        </button>
      ) : showMenu ? (
        <button onClick={onMenu} className={cn(
          "p-2 rounded-full transition-colors",
          theme === 'dark' ? "hover:bg-rose/10 text-cream" : "hover:bg-berry/10 text-berry"
        )}>
          <Menu size={24} />
        </button>
      ) : (
        <div className="w-10" /> // Spacer
      )}
      <h2 className={cn("text-xl font-serif font-bold tracking-tight", theme === 'dark' ? "text-cream" : "text-berry")}>{title}</h2>
    </div>
    <div className="flex items-center gap-1">
      <button className={cn(
        "p-2 rounded-full transition-colors relative",
        theme === 'dark' ? "hover:bg-rose/10 text-cream" : "hover:bg-berry/10 text-berry"
      )}>
        <Bell size={22} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-accent-pink rounded-full border border-berry"></span>
      </button>
      <button onClick={onLogout} className="p-2 rounded-full hover:bg-rose/10 text-rose transition-colors" title="Logout">
        <LogOut size={22} />
      </button>
    </div>
  </header>
);

const BottomNav = ({ activeView, setView, theme = 'dark' }: { activeView: View, setView: (v: View) => void, theme?: 'dark' | 'light' }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'insights', label: 'Twin', icon: Activity },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'quests', label: 'Cycles', icon: Droplets },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t px-4 pb-8 pt-4 flex justify-between items-center z-50 max-w-2xl mx-auto shadow-[0_-10px_40px_rgba(0,0,0,0.3)] transition-all duration-500",
      theme === 'dark' ? "bg-berry border-rose/20" : "bg-white border-berry/20"
    )}>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id as View)}
          className={cn(
            "flex flex-col items-center gap-1.5 transition-all flex-1 py-1",
            activeView === item.id 
              ? "text-accent-pink scale-110" 
              : (theme === 'dark' ? "text-rose/80" : "text-berry/60")
          )}
        >
          <item.icon size={24} fill={activeView === item.id ? "currentColor" : "none"} className="transition-transform duration-300" />
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            activeView === item.id ? "opacity-100" : "opacity-70"
          )}>{item.label}</span>
          {activeView === item.id && (
            <motion.div layoutId="nav-indicator" className="w-1.5 h-1.5 bg-accent-pink rounded-full mt-0.5" />
          )}
        </button>
      ))}
    </nav>
  );
};

// --- Views ---

const LoginView = ({ onLogin }: { onLogin: (role: UserRole) => void }) => {
  const [role, setRole] = useState<UserRole>('Patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex flex-col min-h-screen bg-berry text-cream p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col justify-center"
      >
        <div className="mb-12">
          <h1 className="text-6xl font-serif font-bold text-cream mb-2">Dhadkan</h1>
          <p className="text-2xl font-serif text-rose mb-4">धड़कन</p>
          <div className="h-1 w-20 bg-accent-pink rounded-full"></div>
          <p className="text-rose font-medium mt-4 tracking-wide">
            Her heartbeat. Her story. Her health.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex p-1 bg-rose/10 rounded-2xl border border-rose/20">
            {(['Patient', 'Doctor'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                  role === r ? "bg-accent-pink text-cream shadow-lg" : "text-rose/60"
                )}
              >
                {r} Login
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-rose uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-rose/40" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'Patient' ? "patient@dhadkan.com" : "doctor@dhadkan.com"}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-rose/20 bg-rose/5 focus:ring-2 focus:ring-accent-pink outline-none transition-all text-cream placeholder:text-rose/30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-rose uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-rose/40" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl border border-rose/20 bg-rose/5 focus:ring-2 focus:ring-accent-pink outline-none transition-all text-cream placeholder:text-rose/30"
                />
                <Eye className="absolute right-4 top-1/2 -translate-y-1/2 text-rose/40 cursor-pointer" size={20} />
              </div>
            </div>
          </div>

          <button 
            onClick={() => onLogin(role)}
            className="w-full py-5 bg-accent-pink text-cream font-bold rounded-2xl shadow-xl shadow-black/20 hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest mt-4"
          >
            Enter Dashboard
          </button>
        </div>
      </motion.div>
      
      <div className="py-8 text-center">
        <p className="text-rose/40 text-xs italic">
          Empowering women through real-time data.
        </p>
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose, role, sensorData, theme = 'dark' }: { isOpen: boolean, onClose: () => void, role: UserRole, sensorData: SensorData | null, theme?: 'dark' | 'light' }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] max-w-md mx-auto"
        />
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={cn(
            "fixed top-0 left-0 bottom-0 w-4/5 z-[70] max-w-md border-r p-6 flex flex-col transition-colors duration-500",
            theme === 'dark' ? "bg-gradient-to-b from-berry to-[#1A0F14] border-rose/10" : "bg-gradient-to-b from-cream to-[#F5F5F5] border-berry/10"
          )}
        >
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className={cn("text-3xl font-serif font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>Dhadkan</h2>
              <p className="text-[10px] text-rose font-bold uppercase tracking-[0.2em] mt-1">धड़कन • Monitoring</p>
            </div>
            <button onClick={onClose} className="p-2 text-rose hover:bg-rose/10 rounded-full transition-colors"><X size={24} /></button>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
            <section>
              <p className="text-[10px] font-bold text-rose/40 uppercase tracking-widest mb-4 px-2">Live Status</p>
              <div className="grid grid-cols-2 gap-3 px-2">
                <div className={cn("p-3 rounded-2xl border", theme === 'dark' ? "bg-white/5 border-white/5" : "bg-berry/5 border-berry/5")}>
                  <p className="text-[9px] text-rose/60 uppercase font-bold">Risk Level</p>
                  <p className={cn(
                    "text-lg font-bold",
                    (sensorData?.risk_score || 0) < 30 ? "text-green-400" : (sensorData?.risk_score || 0) < 70 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {sensorData?.risk_score || 0}%
                  </p>
                </div>
                <div className={cn("p-3 rounded-2xl border", theme === 'dark' ? "bg-white/5 border-white/5" : "bg-berry/5 border-berry/5")}>
                  <p className="text-[9px] text-rose/60 uppercase font-bold">Anomalies</p>
                  <p className={cn(
                    "text-lg font-bold",
                    theme === 'dark' ? "text-cream" : "text-berry"
                  )}>
                    {sensorData?.anomaly_detected ? '1 Active' : 'None'}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <p className="text-[10px] font-bold text-rose/40 uppercase tracking-widest mb-4 px-2">Navigation</p>
              <div className="space-y-1">
                {[
                  { icon: Home, label: 'Dashboard' },
                  { icon: Activity, label: 'Live Vitals' },
                  { icon: ShieldCheck, label: 'Risk Analysis' },
                  { icon: Stethoscope, label: 'Consultations' },
                  { icon: Settings, label: 'System Config' },
                ].map((item, i) => (
                  <button key={i} className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group",
                    theme === 'dark' ? "hover:bg-rose/10 text-cream" : "hover:bg-berry/10 text-berry"
                  )}>
                    <item.icon size={20} className="text-rose group-hover:text-accent-pink transition-colors" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className={cn(
            "mt-auto p-5 rounded-3xl border backdrop-blur-md",
            theme === 'dark' ? "bg-rose/5 border-rose/10" : "bg-berry/5 border-berry/10"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-pink to-rose flex items-center justify-center text-cream font-bold shadow-lg">
                {role[0]}
              </div>
              <div>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{role} Account</p>
                <p className="text-[10px] text-rose/60 font-medium">Device: ESP32-Dhadkan-v1</p>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const SettingsView = ({ onBack, theme, setTheme }: { onBack: () => void, theme: 'dark' | 'light', setTheme: (t: 'dark' | 'light') => void }) => {
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-transparent p-6 pb-32">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className={cn(
          "p-2 rounded-2xl border transition-all",
          theme === 'dark' ? "bg-white/5 text-rose border-white/10" : "bg-berry/5 text-berry border-berry/10"
        )}>
          <ChevronLeft size={24} />
        </button>
        <h1 className={cn("text-3xl font-serif font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>Settings</h1>
      </div>

      <div className="space-y-8">
        <section>
          <p className="text-[10px] font-bold text-rose/40 uppercase tracking-widest mb-4 px-2">Preferences</p>
          <div className={cn(
            "rounded-[2rem] border overflow-hidden",
            theme === 'dark' ? "bg-white/5 border-white/10" : "bg-berry/5 border-berry/10"
          )}>
            {[
              { icon: Bell, label: 'Push Notifications', state: notifications, setState: setNotifications },
              { icon: Fingerprint, label: 'Biometric Login', state: biometrics, setState: setBiometrics },
              { icon: theme === 'dark' ? Moon : Sun, label: theme === 'dark' ? 'Dark Mode' : 'Light Mode', state: theme === 'dark', setState: (val: boolean) => setTheme(val ? 'dark' : 'light') },
            ].map((item, i) => (
              <div key={i} className={cn(
                "flex items-center justify-between p-5 border-b last:border-0",
                theme === 'dark' ? "border-white/5" : "border-berry/5"
              )}>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-rose/10 rounded-xl text-rose">
                    <item.icon size={20} />
                  </div>
                  <span className={cn("font-medium", theme === 'dark' ? "text-cream" : "text-berry")}>{item.label}</span>
                </div>
                <button 
                  onClick={() => item.setState(!item.state)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    item.state ? "bg-accent-pink" : (theme === 'dark' ? "bg-white/10" : "bg-berry/10")
                  )}
                >
                  <motion.div 
                    animate={{ x: item.state ? 26 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-cream rounded-full shadow-sm"
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="text-[10px] font-bold text-rose/40 uppercase tracking-widest mb-4 px-2">Account</p>
          <div className={cn(
            "rounded-[2rem] border overflow-hidden",
            theme === 'dark' ? "bg-white/5 border-white/10" : "bg-berry/5 border-berry/10"
          )}>
            {[
              { icon: User, label: 'Edit Profile' },
              { icon: ShieldCheck, label: 'Privacy Policy' },
              { icon: Info, label: 'About Dhadkan' },
            ].map((item, i) => (
              <button key={i} className={cn(
                "w-full flex items-center justify-between p-5 border-b last:border-0 hover:bg-white/5 transition-colors",
                theme === 'dark' ? "border-white/5" : "border-berry/5"
              )}>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-rose/10 rounded-xl text-rose">
                    <item.icon size={20} />
                  </div>
                  <span className={cn("font-medium", theme === 'dark' ? "text-cream" : "text-berry")}>{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-rose/40" />
              </button>
            ))}
          </div>
        </section>

        <button className="w-full p-5 bg-red-500/10 text-red-400 font-bold rounded-[2rem] border border-red-500/20 hover:bg-red-500/20 transition-all">
          Delete Account
        </button>
      </div>
    </div>
  );
};

const DigitalTwin = ({ theme, sensorData }: { theme: 'dark' | 'light', sensorData?: any }) => {
  return (
    <div className={cn(
      "relative w-full aspect-[3/4] rounded-[3rem] border overflow-hidden flex items-center justify-center p-8",
      theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5 shadow-xl"
    )}>
      {/* Stylized Female Silhouette */}
      <div className="relative h-full aspect-[1/2] opacity-20">
        <svg viewBox="0 0 100 200" className={theme === 'dark' ? "fill-cream" : "fill-berry"}>
          <path d="M50,10 C40,10 35,20 35,30 C35,40 40,50 50,50 C60,50 65,40 65,30 C65,20 60,10 50,10 Z M35,55 C25,55 15,65 15,80 L15,130 C15,140 20,145 30,145 L35,145 L35,190 C35,195 40,200 45,200 L55,200 C60,200 65,195 65,190 L65,145 L70,145 C80,145 85,140 85,130 L85,80 C85,65 75,55 65,55 L35,55 Z" />
        </svg>
      </div>

      {/* Hotspots */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Heart */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="absolute top-[25%] left-[48%] w-4 h-4 bg-accent-pink rounded-full blur-sm"
        />
        
        {/* Vitals Overlay */}
        <div className="absolute top-10 left-10 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-pink animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Heart Rate</span>
            <span className={cn("text-sm font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{sensorData?.heartRate || 78} BPM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">SpO2</span>
            <span className={cn("text-sm font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{sensorData?.spo2 || 98}%</span>
          </div>
        </div>

        <div className="absolute bottom-10 right-10 space-y-4 text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className={cn("text-sm font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{sensorData?.temp || 36.5}°C</span>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Body Temp</span>
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className={cn("text-sm font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>Normal</span>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Activity</span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <p className="text-[10px] font-bold text-rose uppercase tracking-[0.3em]">Digital Twin Active</p>
        <div className="flex gap-1 justify-center mt-1">
          {[1, 2, 3].map(i => (
            <motion.div 
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
              className="w-1 h-1 bg-accent-pink rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const PatientDetailView = ({ patient, onBack, theme }: { patient: any, onBack: () => void, theme: 'dark' | 'light' }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'reports' | 'cycles' | 'personal'>('summary');

  const tabs = [
    { id: 'summary', label: 'Summary', icon: Activity },
    { id: 'reports', label: 'Reports', icon: FileSearch },
    { id: 'cycles', label: 'Cycles', icon: Droplets },
    { id: 'personal', label: 'Personal', icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-transparent overflow-x-hidden">
      {/* Patient Header */}
      <div className={cn(
        "p-6 pt-8 border-b sticky top-0 z-30 backdrop-blur-xl",
        theme === 'dark' ? "bg-berry/80 border-white/10" : "bg-cream/80 border-berry/10"
      )}>
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className={cn(
            "p-2 rounded-2xl border transition-all",
            theme === 'dark' ? "bg-white/5 text-rose border-white/10" : "bg-berry/5 text-berry border-berry/10"
          )}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className={cn("text-2xl font-serif font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{patient.name}</h1>
            <p className="text-rose text-xs font-bold uppercase tracking-widest">Patient ID: DH-{patient.id}2024</p>
          </div>
        </div>

        {/* Mini Navbar */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-accent-pink text-cream shadow-lg" 
                  : (theme === 'dark' ? "bg-white/5 text-rose/60" : "bg-berry/5 text-berry/60")
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {activeTab === 'summary' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <DigitalTwin theme={theme} sensorData={{ heartRate: patient.heartRate, spo2: patient.spo2 }} />
            
            <div className="grid grid-cols-2 gap-4">
              <div className={cn(
                "p-5 rounded-[2rem] border shadow-xl",
                theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
              )}>
                <p className="text-[10px] font-bold text-rose/40 uppercase tracking-widest mb-2">Risk Status</p>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    patient.risk === 'High' ? 'bg-red-500' : patient.risk === 'Moderate' ? 'bg-yellow-400' : 'bg-green-400'
                  )} />
                  <span className={cn("text-lg font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{patient.risk}</span>
                </div>
              </div>
              <div className={cn(
                "p-5 rounded-[2rem] border shadow-xl",
                theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
              )}>
                <p className="text-[10px] font-bold text-rose/40 uppercase tracking-widest mb-2">Last Sync</p>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-rose" />
                  <span className={cn("text-lg font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>2m ago</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {patient.reports?.map((report: any) => (
              <div key={report.id} className={cn(
                "p-5 rounded-[2rem] border shadow-xl flex items-center justify-between",
                theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
              )}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose/10 rounded-2xl text-rose">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className={cn("font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{report.title}</h4>
                    <p className="text-rose/60 text-[10px] font-bold uppercase tracking-widest">{report.date}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest",
                  report.status === 'Normal' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'
                )}>
                  {report.status}
                </span>
              </div>
            ))}
            <button className="w-full py-4 border-2 border-dashed border-rose/20 rounded-[2rem] text-rose/60 font-bold text-sm hover:bg-rose/5 transition-all">
              + Upload New Report
            </button>
          </motion.div>
        )}

        {activeTab === 'cycles' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className={cn(
              "p-6 rounded-[2.5rem] border shadow-xl",
              theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
            )}>
              <h3 className={cn("text-xl font-serif font-bold mb-6", theme === 'dark' ? "text-cream" : "text-berry")}>Cycle Summary</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose/10 rounded-xl text-rose"><Calendar size={18} /></div>
                    <span className={cn("font-medium", theme === 'dark' ? "text-cream/80" : "text-berry/80")}>Last Period</span>
                  </div>
                  <span className={cn("font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{patient.lastPeriod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-pink/10 rounded-xl text-accent-pink"><Droplets size={18} /></div>
                    <span className={cn("font-medium", theme === 'dark' ? "text-cream/80" : "text-berry/80")}>Next Predicted</span>
                  </div>
                  <span className={cn("font-bold text-accent-pink")}>{patient.nextPeriod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-400/10 rounded-xl text-blue-400"><Sparkles size={18} /></div>
                    <span className={cn("font-medium", theme === 'dark' ? "text-cream/80" : "text-berry/80")}>Cycle Length</span>
                  </div>
                  <span className={cn("font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>28 Days</span>
                </div>
              </div>
            </div>
            
            <div className={cn(
              "p-6 rounded-[2.5rem] border shadow-xl",
              theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
            )}>
              <h3 className={cn("text-xl font-serif font-bold mb-4", theme === 'dark' ? "text-cream" : "text-berry")}>Symptom Trends</h3>
              <div className="flex flex-wrap gap-2">
                {['Cramps', 'Mood Swings', 'Fatigue', 'Bloating'].map(s => (
                  <span key={s} className="px-4 py-2 rounded-full bg-rose/10 text-rose text-xs font-bold uppercase tracking-widest">{s}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'personal' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className={cn(
              "p-6 rounded-[2.5rem] border shadow-xl space-y-6",
              theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
            )}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose/10 rounded-2xl text-rose"><Mail size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold text-rose/40 uppercase tracking-widest">Email Address</p>
                  <p className={cn("font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{patient.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose/10 rounded-2xl text-rose"><Phone size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold text-rose/40 uppercase tracking-widest">Phone Number</p>
                  <p className={cn("font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{patient.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose/10 rounded-2xl text-rose"><Dna size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold text-rose/40 uppercase tracking-widest">Blood Group</p>
                  <p className={cn("font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{patient.bloodGroup || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-rose/10">
                <div>
                  <p className="text-[10px] font-bold text-rose/40 uppercase tracking-widest">Height</p>
                  <p className={cn("font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{patient.height || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-rose/40 uppercase tracking-widest">Weight</p>
                  <p className={cn("font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{patient.weight || 'N/A'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const DoctorDashboardView = ({ theme }: { theme: 'dark' | 'light' }) => {
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const patients = [
    { 
      id: '1', 
      name: 'Pragya', 
      age: 24, 
      lastPeriod: '2026-02-15', 
      nextPeriod: '2026-03-15', 
      lastVisit: '2026-02-28', 
      risk: 'Moderate', 
      heartRate: 78, 
      spo2: 98,
      email: 'pragya@example.com',
      phone: '+91 98765 43210',
      bloodGroup: 'O+',
      weight: '54 kg',
      height: '162 cm',
      reports: [
        { id: 'r1', title: 'Blood Test - Hormone Panel', date: '2026-02-28', status: 'Normal' },
        { id: 'r2', title: 'Pelvic Ultrasound', date: '2026-02-15', status: 'Follow-up required' },
        { id: 'r3', title: 'Glucose Tolerance Test', date: '2026-01-10', status: 'Normal' },
      ]
    },
    { id: '2', name: 'Priya Patel', age: 28, lastPeriod: '2026-02-10', nextPeriod: '2026-03-10', lastVisit: '2026-03-05', risk: 'Low', heartRate: 72, spo2: 99 },
    { id: '3', name: 'Anjali Gupta', age: 22, lastPeriod: '2026-02-20', nextPeriod: '2026-03-20', lastVisit: '2026-03-10', risk: 'High', heartRate: 92, spo2: 94 },
  ];

  if (selectedPatient) {
    return <PatientDetailView patient={selectedPatient} onBack={() => setSelectedPatient(null)} theme={theme} />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-transparent overflow-x-hidden p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn("text-3xl font-serif font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>Doctor Panel</h1>
          <p className="text-rose text-sm font-medium">Welcome back, Dr. Aditi</p>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-2xl border flex items-center justify-center text-rose",
          theme === 'dark' ? "bg-white/5 border-white/10" : "bg-berry/5 border-berry/10"
        )}>
          <Stethoscope size={24} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={cn(
          "p-5 rounded-[2rem] border shadow-xl",
          theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
        )}>
          <div className="flex items-center gap-2 text-rose mb-2">
            <Users size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Patients</span>
          </div>
          <p className={cn("text-4xl font-serif font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>124</p>
        </div>
        <div className={cn(
          "p-5 rounded-[2rem] border shadow-xl",
          theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
        )}>
          <div className="flex items-center gap-2 text-accent-pink mb-2">
            <AlertCircle size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">High Risk</span>
          </div>
          <p className={cn("text-4xl font-serif font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>8</p>
        </div>
      </div>

      <section className="space-y-4">
        <p className="text-[10px] font-bold text-rose/40 uppercase tracking-widest px-2">Patient Records</p>
        <div className="space-y-4">
          {patients.map(patient => (
            <motion.div 
              key={patient.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedPatient(patient)}
              className={cn(
                "p-5 rounded-[2rem] border shadow-xl relative overflow-hidden cursor-pointer",
                theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={cn("text-lg font-serif font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{patient.name}</h3>
                  <p className="text-rose/60 text-[10px] font-bold uppercase tracking-widest">Age: {patient.age} • ID: #{patient.id}</p>
                </div>
                <span className={cn(
                  "text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                  patient.risk === 'High' ? 'bg-red-500/10 text-red-400' : 
                  patient.risk === 'Moderate' ? 'bg-yellow-400/10 text-yellow-400' : 
                  'bg-green-400/10 text-green-400'
                )}>
                  {patient.risk} Risk
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-rose/40">
                    <Calendar size={12} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Last Period</span>
                  </div>
                  <p className={cn("text-xs font-bold", theme === 'dark' ? "text-cream/80" : "text-berry/80")}>{patient.lastPeriod}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-rose/40">
                    <Clock size={12} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Last Visit</span>
                  </div>
                  <p className={cn("text-xs font-bold", theme === 'dark' ? "text-cream/80" : "text-berry/80")}>{patient.lastVisit}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Heart size={14} className="text-accent-pink" />
                  <span className={cn("text-xs font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{patient.heartRate} <span className="text-[8px] opacity-40">BPM</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind size={14} className="text-rose" />
                  <span className={cn("text-xs font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{patient.spo2}% <span className="text-[8px] opacity-40">SPO2</span></span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

const DashboardView = ({ role, sensorData, isOffline, isSimulated, history, theme }: { role: UserRole, sensorData: SensorData | null, isOffline: boolean, isSimulated: boolean, history: any[], theme: 'dark' | 'light' }) => {
  return (
    <div className="flex flex-col min-h-screen pb-32 bg-transparent overflow-x-hidden">
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest py-2 text-center sticky top-0 z-30 shadow-lg"
          >
            Device Offline - No data for 10s
          </motion.div>
        )}
        {isSimulated && !isOffline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest py-2 text-center sticky top-0 z-30 shadow-lg flex items-center justify-center gap-2"
          >
            <Info size={12} />
            ML Server Unreachable - Using Simulated Data
          </motion.div>
        )}
        {sensorData?.anomaly_detected && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="bg-gradient-to-r from-accent-pink to-rose text-cream p-4 flex items-center gap-3 sticky top-0 z-30 shadow-xl border-b border-white/10"
          >
            <div className="bg-white/20 p-2 rounded-full">
              <AlertCircle className="shrink-0" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Anomaly Detected</p>
              <p className="text-sm font-bold">{sensorData.anomaly_type}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={cn("text-3xl font-serif font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>Hello, Pragya</h1>
            <p className="text-rose text-sm font-medium">Your health is our priority.</p>
          </div>
          <div className={cn(
            "w-12 h-12 rounded-2xl border flex items-center justify-center text-rose",
            theme === 'dark' ? "bg-white/5 border-white/10" : "bg-berry/5 border-berry/10"
          )}>
            <Sparkles size={24} />
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <HeartRateCard data={sensorData} history={history} theme={theme} />
          <SpO2Card value={sensorData?.spo2 || null} theme={theme} />
        </div>

        <RecommendationCard text={sensorData?.recommendation || "Analyzing your data for personalized insights..."} theme={theme} />

        <div className="grid grid-cols-2 gap-4">
          <TemperatureCard body={sensorData?.ds18b20_temp || null} ambient={sensorData?.dht22_temp || null} theme={theme} />
          <div className={cn(
            "backdrop-blur-xl p-5 rounded-[2rem] border shadow-2xl flex flex-col justify-center group overflow-hidden relative",
            theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
          )}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose/5 rounded-full blur-xl -mr-4 -mt-4" />
            <div className="flex items-center gap-2 text-rose mb-2 relative z-10">
              <Droplets size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Humidity</span>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className={cn("text-4xl font-serif font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{sensorData?.dht22_humidity?.toFixed(0) || '--'}</span>
              <span className="text-rose text-xs font-bold uppercase tracking-widest">%</span>
            </div>
          </div>
        </div>

        <RiskScoreCard score={sensorData?.risk_score || 0} theme={theme} />
        
        <MovementCard 
          accel={{ x: sensorData?.accel_x || 0, y: sensorData?.accel_y || 0, z: sensorData?.accel_z || 0 }} 
          gyro={{ x: sensorData?.gyro_x || 0, y: sensorData?.gyro_y || 0, z: sensorData?.gyro_z || 0 }} 
          theme={theme}
        />

        <HistoricalChart history={history} theme={theme} />
      </div>
    </div>
  );
};

const PeriodTrackerView = ({ theme }: { theme: 'dark' | 'light' }) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentDay = 14;
  const periodDays = [1, 2, 3, 4, 5];
  const ovulationDays = [13, 14, 15, 16, 17];

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-transparent overflow-x-hidden p-6 space-y-8">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-48 h-48 rounded-full border-8 border-accent-pink/20 flex flex-col items-center justify-center relative">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-4 border-accent-pink border-t-transparent animate-spin-slow"
          />
          <p className="text-rose text-xs font-bold uppercase tracking-widest">Day</p>
          <h2 className={cn("text-6xl font-serif font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>{currentDay}</h2>
          <p className="text-accent-pink text-sm font-bold">Follicular Phase</p>
        </div>
        <p className={cn("text-sm font-medium", theme === 'dark' ? "text-cream/60" : "text-berry/60")}>High chance of getting pregnant</p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={cn("text-xl font-serif font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>March 2026</h3>
          <div className="flex gap-2">
            <button className="p-2 rounded-xl bg-rose/10 text-rose"><ChevronLeft size={20} /></button>
            <button className="p-2 rounded-xl bg-rose/10 text-rose"><ChevronRight size={20} /></button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-rose/40 py-2">{d}</div>
          ))}
          {days.map(d => {
            const isPeriod = periodDays.includes(d);
            const isOvulation = ovulationDays.includes(d);
            const isToday = d === currentDay;

            return (
              <div 
                key={d} 
                className={cn(
                  "aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all relative",
                  isToday ? "bg-accent-pink text-cream shadow-lg scale-110 z-10" : 
                  isPeriod ? "bg-rose/20 text-rose" :
                  isOvulation ? "bg-blue-400/10 text-blue-400" :
                  theme === 'dark' ? "text-cream/40" : "text-berry/40"
                )}
              >
                {d}
                {isPeriod && <div className="absolute bottom-1 w-1 h-1 bg-rose rounded-full" />}
                {isOvulation && <div className="absolute bottom-1 w-1 h-1 bg-blue-400 rounded-full" />}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className={cn(
          "p-5 rounded-[2rem] border shadow-xl",
          theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
        )}>
          <div className="flex items-center gap-2 text-rose mb-2">
            <Droplets size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Period</span>
          </div>
          <p className={cn("text-lg font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>In 14 Days</p>
        </div>
        <div className={cn(
          "p-5 rounded-[2rem] border shadow-xl",
          theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-berry/5"
        )}>
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Sparkles size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Ovulation</span>
          </div>
          <p className={cn("text-lg font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>Tomorrow</p>
        </div>
      </div>

      <button className="w-full py-5 bg-accent-pink text-cream font-bold rounded-[2rem] shadow-xl shadow-black/20 flex items-center justify-center gap-3 uppercase tracking-widest">
        <Plus size={20} />
        Log Symptoms
      </button>
    </div>
  );
};

const ProfileView = ({ theme, onLogout, onSettings, handleLogout }: { theme: 'dark' | 'light', onLogout: () => void, onSettings: () => void, handleLogout: () => void }) => (
  <div className="flex flex-col min-h-screen bg-transparent pb-32 p-6">
    <div className="flex flex-col items-center mt-4">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mb-6"
      >
        <div className={cn(
          "w-32 h-32 rounded-[2.5rem] border-4 p-1.5 backdrop-blur-xl shadow-2xl overflow-hidden",
          theme === 'dark' ? "border-accent-pink/20 bg-white/5" : "border-berry/20 bg-berry/5"
        )}>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pragya&gender=female" className="w-full h-full rounded-[2rem] object-cover" alt="User" referrerPolicy="no-referrer" />
        </div>
        <div className={cn(
          "absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 flex items-center justify-center text-cream shadow-lg",
          "bg-accent-pink",
          theme === 'dark' ? "border-berry" : "border-cream"
        )}>
          <Sparkles size={16} />
        </div>
      </motion.div>

      <div className="text-center mb-10">
        <h2 className={cn("text-3xl font-serif font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>Pragya</h2>
        <p className="text-rose font-medium tracking-wide">Patient ID: DH-2024-089</p>
      </div>

      <div className="w-full space-y-3">
        {[
          { icon: Settings, label: 'Preferences', action: onSettings },
          { icon: ShieldCheck, label: 'Privacy & Security' },
          { icon: Bell, label: 'Notifications' },
          { icon: HelpCircle, label: 'Support Center' },
          { icon: LogOut, label: 'Sign Out', action: onLogout, danger: true },
        ].map((item, i) => (
          <button 
            key={i} 
            onClick={item.action}
            className={cn(
              "w-full flex items-center justify-between p-5 rounded-3xl border transition-all active:scale-[0.98]",
              theme === 'dark' 
                ? "bg-white/5 border-white/5 hover:bg-white/10" 
                : "bg-white border-berry/5 hover:bg-berry/5 shadow-sm"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center",
                item.danger ? "bg-red-500/10 text-red-400" : "bg-rose/10 text-rose"
              )}>
                <item.icon size={20} />
              </div>
              <span className={cn("font-bold", theme === 'dark' ? "text-cream/90" : "text-berry/80")}>{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-rose/40" />
          </button>
        ))}
      </div>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('login');
  const [role, setRole] = useState<UserRole>('Patient');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data, isOffline, isSimulated, history } = useSensorData();

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setView('dashboard');
  };

  const handleLogout = () => {
    setView('login');
    setIsSidebarOpen(false);
  };

  const renderView = () => {
    switch (view) {
      case 'login': return <LoginView onLogin={handleLogin} />;
      case 'dashboard': 
        return role === 'Doctor' 
          ? <DoctorDashboardView theme={theme} /> 
          : <DashboardView role={role} sensorData={data} isOffline={isOffline} isSimulated={isSimulated} history={history} theme={theme} />;
      case 'quests': return <PeriodTrackerView theme={theme} />;
      case 'insights': 
        return (
          <div className="p-6 space-y-6">
            <h1 className={cn("text-3xl font-serif font-bold", theme === 'dark' ? "text-cream" : "text-berry")}>Digital Twin</h1>
            <DigitalTwin theme={theme} sensorData={{ heartRate: data?.heart_rate, spo2: data?.spo2, temp: data?.ds18b20_temp }} />
            <RecommendationCard text="Your digital twin is synchronized with your wearable device. All vitals are within normal range." theme={theme} />
          </div>
        );
      case 'settings': return <SettingsView onBack={() => setView('profile')} theme={theme} setTheme={setTheme} />;
      case 'profile': return <ProfileView theme={theme} onLogout={handleLogout} onSettings={() => setView('settings')} handleLogout={handleLogout} />;
      default: return (
        <div className={cn(
          "flex flex-col min-h-screen pb-24 items-center justify-center p-10 text-center",
          theme === 'dark' ? "bg-berry" : "bg-cream"
        )}>
          <div className="flex-1 flex flex-col items-center justify-center">
            <Activity size={64} className="text-rose/20 mb-4" />
            <h2 className="text-xl font-bold text-rose">View Under Construction</h2>
            <p className="text-rose/60 text-sm mt-2">We are working on bringing more PCOS insights to this section.</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-accent-pink/30 transition-colors duration-500",
      theme === 'dark' ? "bg-[#1A0F14]" : "bg-[#F5F5F5]"
    )}>
      <div className={cn(
        "max-w-2xl mx-auto min-h-screen relative shadow-2xl overflow-hidden flex flex-col transition-colors duration-500",
        theme === 'dark' ? "bg-gradient-to-b from-berry to-[#1A0F14]" : "bg-gradient-to-b from-cream to-[#F5F5F5]"
      )}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} role={role} sensorData={data} theme={theme} />
        
        {view !== 'login' && view !== 'settings' && (
          <Header 
            title={view === 'dashboard' ? "Dhadkan" : view === 'quests' ? "Cycle Tracker" : view.charAt(0).toUpperCase() + view.slice(1)} 
            onMenu={() => setIsSidebarOpen(true)} 
            showMenu={view !== 'profile'}
            onLogout={handleLogout}
            theme={theme}
          />
        )}

        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {view !== 'login' && <BottomNav activeView={view} setView={setView} theme={theme} />}
      </div>
    </div>
  );
}
