import { Activity } from 'lucide-react';
import clsx from 'clsx';

export const ConnectedDevices = () => {
  const devices = [
    { name: 'PESHacks Sensor Hub', type: 'DHT22 • DS18B20 • MAX30100 • MPU6050', icon: Activity, status: 'Streaming Live data', connected: true, battery: 98 },
  ];

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/60 p-6 shadow-xl shadow-teal-500/5 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900 tracking-tight text-lg">Connected Ecosystem</h3>
        <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full">1 Connected</span>
      </div>

      <div className="space-y-4 flex-1">
        {devices.map(d => (
          <div key={d.name} className="flex flex-col gap-4 p-5 bg-white/50 border border-white rounded-2xl shadow-sm hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div className={clsx("p-2.5 rounded-xl text-white", d.connected ? "bg-teal-500" : "bg-gray-300")}>
                <d.icon size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-tight">{d.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-gray-400">{d.type}</span>
                  <span className="text-gray-300">&bull;</span>
                  <span className={clsx("text-xs font-semibold", d.connected ? "text-teal-600" : "text-gray-400")}>{d.status}</span>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-white rounded-xl p-3 border border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-widest flex justify-between">
              <span>Sensor Status</span>
              <span className="text-teal-500 font-bold tracking-tight">NOMINAL</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
