"""
data_loader.py
--------------
Loads sensor reading data directly from the PostgreSQL database using pandas.
"""

import pandas as pd
from sqlalchemy import create_engine

from config import settings

# Create a database engine
engine = create_engine(settings.DATABASE_URL)


def load_sensor_data(device_id: str, limit: int = 2000) -> pd.DataFrame:
    """
    Fetches the most recent `limit` sensor readings for a specific `device_id`.
    Returns a pandas DataFrame.
    """
    query = f"""
        SELECT 
            id, 
            device_id, 
            timestamp, 
            COALESCE(heart_rate, 75.0) AS heart_rate, 
            COALESCE(spo2, 98.0) AS hrv, 
            COALESCE(ds18b20_temp, 36.5) AS temperature, 
            COALESCE(ABS(accel_x) + ABS(accel_y) + ABS(accel_z), 1.0) AS activity_level, 
            'awake' AS sleep_state,
            perceived_stress,
            mood_score,
            pain_level,
            flow_heaviness,
            age,
            bmi,
            amh
        FROM sensor_readings
        WHERE device_id = '{device_id}'
        ORDER BY timestamp DESC
        LIMIT {limit}
    """
    
    # Read directly into pandas DataFrame
    df = pd.read_sql(query, engine)
    
    return df
