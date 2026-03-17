import { useState, useEffect } from 'react';
import { SensorData } from '../types';



export function useSensorData() {
  const [data, setData] = useState<SensorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [history, setHistory] = useState<{ heart_rate: number; ds18b20_temp: number; timestamp: number }[]>([]);

  useEffect(() => {
    let lastUpdate = Date.now();

    const simulateData = (): SensorData => {
      const hr = Math.random() > 0.1 ? Math.floor(Math.random() * (90 - 65) + 65) : null;
      const temp = 36.5 + (Math.random() * 1.5);
      const risk = Math.floor(Math.random() * 100);
      
      return {
        dht22_temp: 24 + Math.random() * 2,
        dht22_humidity: 45 + Math.random() * 10,
        ds18b20_temp: temp,
        heart_rate: hr,
        spo2: 94 + Math.random() * 6,
        accel_x: (Math.random() - 0.5) * 2,
        accel_y: (Math.random() - 0.5) * 2,
        accel_z: 9.8 + (Math.random() - 0.5),
        gyro_x: (Math.random() - 0.5) * 10,
        gyro_y: (Math.random() - 0.5) * 10,
        gyro_z: (Math.random() - 0.5) * 10,
        mpu_temp: 32 + Math.random() * 2,
        anomaly_detected: risk > 85,
        anomaly_type: risk > 85 ? "Irregular Heart Rate Pattern" : null,
        risk_score: risk,
        recommendation: "Maintain your current habits.",
        timestamp: Date.now()
      };
    };

    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/latest/unknown_device', {
          signal: AbortSignal.timeout(3000) // 3s timeout
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const rawData = await response.json();
        
        const sensor = rawData.sensor_data;
        const ai = rawData.ai_predictions;
        
        // Convert the 0.0-1.0 stability score into a 0-100% "Risk Score" natively
        const stability = ai?.gnn?.physiological_stability_score ?? 0.5;
        const risk = Math.floor((1.0 - stability) * 100);
        
        const mappedData: SensorData = {
          dht22_temp: sensor.dht22_temp,
          dht22_humidity: sensor.dht22_humidity,
          ds18b20_temp: sensor.ds18b20_temp,
          heart_rate: sensor.heart_rate,
          spo2: sensor.spo2,
          accel_x: sensor.accel_x,
          accel_y: sensor.accel_y,
          accel_z: sensor.accel_z,
          gyro_x: sensor.gyro_x,
          gyro_y: sensor.gyro_y,
          gyro_z: sensor.gyro_z,
          mpu_temp: sensor.mpu_temp,
          anomaly_detected: (sensor.heart_rate > 100 || sensor.ds18b20_temp > 38),
          anomaly_type: sensor.heart_rate > 100 ? "High Heart Rate" : (sensor.ds18b20_temp > 38 ? "Fever Detected" : null),
          risk_score: risk,
          recommendation: ai?.rl?.patient_message || "No recommendation at this time.",
          timestamp: Date.now()
        };

        setData(mappedData);
        setIsOffline(false);
        setIsSimulated(false);
        lastUpdate = Date.now();

        setHistory(prev => {
          const newEntry = { 
            heart_rate: mappedData.heart_rate || 0, 
            ds18b20_temp: mappedData.ds18b20_temp || 0,
            timestamp: mappedData.timestamp 
          };
          const updated = [...prev, newEntry].slice(-30);
          return updated;
        });

      } catch (err) {
        console.warn("Fetch error, falling back to simulation:", err);
        setError("Failed to connect to ML server. Using simulated data.");
        setIsSimulated(true);
        
        const simulated = simulateData();
        setData(simulated);
        setIsOffline(false);
        lastUpdate = Date.now();

        setHistory(prev => {
          const newEntry = { 
            heart_rate: simulated.heart_rate || 0, 
            ds18b20_temp: simulated.ds18b20_temp || 0,
            timestamp: simulated.timestamp 
          };
          return [...prev, newEntry].slice(-30);
        });
      }
    };

    const interval = setInterval(fetchData, 4000);
    
    const offlineCheck = setInterval(() => {
      if (Date.now() - lastUpdate > 10000) {
        setIsOffline(true);
      }
    }, 1000);

    fetchData();

    return () => {
      clearInterval(interval);
      clearInterval(offlineCheck);
    };
  }, []);

  return { data, error, isOffline, isSimulated, history };
}
