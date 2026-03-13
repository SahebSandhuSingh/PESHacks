"""
twin_model.py
-------------
Defines the Digital Twin baseline model.
For each device, we continuously learn their "normal" ranges based on historical data.
"""

from typing import Dict

import pandas as pd

from feature_engineering import (
    compute_activity_score,
    compute_sleep_stability,
    compute_stress_index,
    compute_temperature_cycle_stability,
)


def compute_baseline_and_current_state(df: pd.DataFrame) -> Dict[str, float]:
    """
    Simulates a Digital Hormonal Twin.
    In a true production setting, this would train a machine learning algorithm
    like IsolationForest or One-Class SVM on the historical data.

    For this implementation, we simulate the 'baseline' learning by calculating 
    the moving averages of key indicators over the user's recent history, 
    and returning the latest computed indices as their current state vector.
    """
    if df.empty:
        return {
            "stress_index": 0.0,
            "sleep_stability": 0.0,
            "activity_score": 0.0,
            "temperature_cycle_stability": 0.0,
        }

    # Generate current indicators
    return {
        "stress_index": compute_stress_index(df),
        "sleep_stability": compute_sleep_stability(df),
        "activity_score": compute_activity_score(df),
        "temperature_cycle_stability": compute_temperature_cycle_stability(df),
    }

