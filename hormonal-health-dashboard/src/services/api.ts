import { useState, useEffect } from 'react';
import axios from 'axios';

// TypeScript interface defining the complex AI backend payload
export interface AIHealthPayload {
  sensor_data: {
    dht22_temp: number;
    dht22_humidity: number;
    ds18b20_temp: number;
    heart_rate: number;
    spo2: number;
    accel_x: number;
    accel_y: number;
    accel_z: number;
    timestamp: number;
  };
  ai_predictions: {
    twin: {
      stress_index: number;
      sleep_stability: number;
      activity_score: number;
      temperature_cycle_stability: number;
      overall_hormonal_balance: string;
      baseline_state?: {
        stress_index: number;
        sleep_stability: number;
        activity_score: number;
        temperature_cycle_stability: number;
      };
      deviations?: {
        stress_index: number;
        sleep_stability: number;
        activity_score: number;
        temperature_cycle_stability: number;
      };
    };
    gnn: {
      physiological_stability_score: number;
      stress_impact_score: number;
    };
    rl: {
      recommended_action: string;
      patient_message: string;
      expected_improvement: number;
      all_action_q_values: Record<string, number>;
    };
  };
}

const API_URL = 'http://127.0.0.1:8000/latest/unknown_device';

export function useHealthData() {
  const [data, setData] = useState<AIHealthPayload | null>(null);
  const [history, setHistory] = useState<AIHealthPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLatest = async () => {
      try {
        const response = await axios.get<AIHealthPayload>(API_URL, { timeout: 5000 });
        if (isMounted) {
          setData(response.data);
          setHistory(prev => {
            const next = [...prev, response.data];
            // Keep last 60 readings
            return next.length > 60 ? next.slice(next.length - 60) : next;
          });
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to connect to AI Tracker');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Fetch immediately
    fetchLatest();

    // Poll strictly every 10 seconds as requested
    const intervalId = setInterval(fetchLatest, 10000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return { data, history, loading, error };
}
