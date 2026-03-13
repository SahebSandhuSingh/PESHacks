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
            id, device_id, timestamp, heart_rate, hrv, 
            temperature, activity_level, sleep_state
        FROM sensor_readings
        WHERE device_id = '{device_id}'
        ORDER BY timestamp DESC
        LIMIT {limit}
    """
    
    # Read directly into pandas DataFrame
    df = pd.read_sql(query, engine)
    
    return df
