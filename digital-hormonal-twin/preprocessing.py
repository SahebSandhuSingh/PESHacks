"""
preprocessing.py
----------------
Cleans and prepares raw time-series sensor data for feature extraction.
"""

import pandas as pd


def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess the raw DataFrame:
    1. Sorts chronologically (oldest to newest) since the query returns DESC.
    2. Converts timestamp to datetime format.
    3. Handles potential missing/null values.
    """
    if df.empty:
        return df

    # Convert timestamp to pandas datetime object
    df['timestamp'] = pd.to_datetime(df['timestamp'])

    # Sort chronological so time-series rolling averages work correctly
    df = df.sort_values(by='timestamp').reset_index(drop=True)

    # For physiological sensor data, forward-fill missing values, then drop any remaining
    # numerical columns only
    num_cols = ['heart_rate', 'hrv', 'temperature', 'activity_level']
    df[num_cols] = df[num_cols].ffill().bfill()
    
    # Categorical string types missing value fill
    if 'sleep_state' in df.columns:
        df['sleep_state'] = df['sleep_state'].fillna('unknown')

    return df
