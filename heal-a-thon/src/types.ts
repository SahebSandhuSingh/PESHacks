export type View = 'login' | 'dashboard' | 'insights' | 'quests' | 'reports' | 'profile' | 'settings';

export type UserRole = 'Patient' | 'Doctor' | 'Admin';

export interface SensorData {
  dht22_temp: number | null;
  dht22_humidity: number | null;
  ds18b20_temp: number | null;
  heart_rate: number | null;
  spo2: number | null;
  accel_x: number | null;
  accel_y: number | null;
  accel_z: number | null;
  gyro_x: number | null;
  gyro_y: number | null;
  gyro_z: number | null;
  mpu_temp: number | null;
  anomaly_detected: boolean;
  anomaly_type: string | null;
  risk_score: number;
  recommendation: string;
  timestamp: number;
}

export interface VitalStat {
  label: string;
  value: string | number;
  unit: string;
  status?: string;
  icon: string;
  color: string;
  progress?: number;
}

export interface Quest {
  id: string;
  title: string;
  duration: string;
  category: string;
  icon: string;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  locked?: boolean;
}
