import { useState, useEffect } from 'react';
import { SensorData } from '../types';

const MOCK_RECOMMENDATIONS = [
  "Today is a great day for low-impact yoga to manage cortisol levels.",
  "Consider increasing your protein intake today to support metabolic health.",
  "Your activity levels are high; ensure you're getting enough magnesium tonight.",
  "Risk score is slightly elevated. Prioritize 8 hours of sleep and hydration.",
  "Hormonal balance looks stable. Perfect for a light strength training session."
];

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
        recommendation: MOCK_RECOMMENDATIONS[Math.floor(Math.random() * MOCK_RECOMMENDATIONS.length)],
        timestamp: Date.now()
      };
    };

    const fetchData = async () => {
      try {
        const response = await fetch('http://172.20.10.3:8000/latest', {
          signal: AbortSignal.timeout(3000) // 3s timeout
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const rawData = await response.json();
        
        const risk = Math.floor(Math.random() * 100);
        
        const mappedData: SensorData = {
          dht22_temp: rawData.ambient_temp,
          dht22_humidity: rawData.humidity,
          ds18b20_temp: rawData.body_temp,
          heart_rate: rawData.heart_rate,
          spo2: rawData.spo2,
          accel_x: rawData.accel_x,
          accel_y: rawData.accel_y,
          accel_z: rawData.accel_z,
          gyro_x: rawData.gyro_x,
          gyro_y: rawData.gyro_y,
          gyro_z: rawData.gyro_z,
          mpu_temp: rawData.mpu_temp,
          anomaly_detected: (rawData.heart_rate > 100 || rawData.body_temp > 38),
          anomaly_type: rawData.heart_rate > 100 ? "High Heart Rate" : (rawData.body_temp > 38 ? "Fever Detected" : null),
          risk_score: risk,
          recommendation: MOCK_RECOMMENDATIONS[Math.floor(Math.random() * MOCK_RECOMMENDATIONS.length)],
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
