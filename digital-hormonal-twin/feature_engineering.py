"""
feature_engineering.py
----------------------
Computes specific physiological indicators from the preprocessed time-series data.
These single-value metrics summarize recent trends.
"""

import pandas as pd


def compute_stress_index(df: pd.DataFrame) -> float:
    """
    Calculate stress index (0.0 to 1.0) derived from HRV and heart rate.
    Higher HR and lower HRV typically correlate with higher physiological stress.
    For demonstration, we normalize typical bounds: HR(60-120), HRV(20-100).
    """
    if df.empty:
        return 0.0
    
    # Use the most recent rolling window (e.g., last 10 readings)
    recent = df.tail(10)
    avg_hr = recent['heart_rate'].mean()
    avg_hrv = recent['hrv'].mean()

    # Normalize HR (higher = more stress)
    hr_norm = (avg_hr - 60) / (120 - 60)
    hr_norm = max(0.0, min(1.0, hr_norm))
    
    # Normalize HRV (lower = more stress, so we invert)
    hrv_norm = 1.0 - ((avg_hrv - 20) / (100 - 20))
    hrv_norm = max(0.0, min(1.0, hrv_norm))
    
    # Weighted combination of physiological stress
    physio_stress = (0.6 * hrv_norm) + (0.4 * hr_norm)

    # Incorporate subjective perceived stress if available (1-10 -> 0.1-1.0)
    if 'perceived_stress' in df.columns and not df['perceived_stress'].isna().all():
        latest_perceived = df['perceived_stress'].dropna().iloc[-1]
        subj_stress = latest_perceived / 10.0
        # Blend 60% physiological, 40% subjective
        stress = (0.6 * physio_stress) + (0.4 * subj_stress)
    else:
        stress = physio_stress

    return round(stress, 2)


def compute_sleep_stability(df: pd.DataFrame) -> float:
    """
    Calculate sleep stability (0.0 to 1.0) based on transition frequency and deep/rem proportions.
    Fewer transitions during sleep hours = higher stability.
    """
    if df.empty or 'sleep_state' not in df.columns:
        return 0.0

    sleep_data = df[df['sleep_state'].isin(['light', 'deep', 'rem'])]
    if len(sleep_data) < 5:
        # Not enough sleep data to evaluate stability
        return 0.5 

    # Count state transitions
    transitions = (sleep_data['sleep_state'] != sleep_data['sleep_state'].shift()).sum()
    total_sleep_records = len(sleep_data)
    
    # Calculate transition ratio (lower ratio = fewer wake/shift phases = higher stability)
    transition_ratio = transitions / total_sleep_records
    stability = 1.0 - min(1.0, transition_ratio * 3) # Exaggerate penalty for demo
    
    return round(max(0.1, stability), 2)


def compute_activity_score(df: pd.DataFrame) -> float:
    """
    Calculates moving average of activity levels (0.0 to 1.0).
    Captures recent movement patterns.
    """
    if df.empty:
        return 0.0
    
    # Average of last 20 readings
    recent_activity = df.tail(20)['activity_level'].mean()
    return round(max(0.0, min(1.0, recent_activity)), 2)


def compute_temperature_cycle_stability(df: pd.DataFrame) -> float:
    """
    Evaluates how stable the body temperature baseline is (0.0 to 1.0).
    Drastic, irregular variations indicate low stability.
    """
    if df.empty or len(df) < 10:
        return 0.0
    
    recent_temps = df.tail(50)['temperature']
    temp_std_dev = recent_temps.std()
    
    # Standard deviation typically around 0.2 - 0.5 for normal human temp variance over a day
    # > 1.0 implies significant instability
    stability = 1.0 - min(1.0, temp_std_dev / 1.5)
    
    if pd.isna(stability):
        return 0.5
        
    return round(max(0.0, stability), 2)


def compute_symptom_severity_index(df: pd.DataFrame) -> float:
    """
    Evaluates the user's subjective symptom severity (0.0 to 1.0).
    Aggregates mood, pain, and flow heaviness from the questionnaire data.
    """
    if df.empty:
        return 0.0

    severity_score = 0.0
    components = 0

    # 1. Pain Level (1-10 -> 0.1-1.0)
    if 'pain_level' in df.columns and not df['pain_level'].isna().all():
        latest_pain = df['pain_level'].dropna().iloc[-1]
        severity_score += latest_pain / 10.0
        components += 1

    # 2. Mood Score (1-10 -> 0.1-1.0, inverted so lower mood = higher severity)
    if 'mood_score' in df.columns and not df['mood_score'].isna().all():
        latest_mood = df['mood_score'].dropna().iloc[-1]
        severity_score += (11 - latest_mood) / 10.0
        components += 1

    # 3. Flow Heaviness
    if 'flow_heaviness' in df.columns and not df['flow_heaviness'].isna().all():
        latest_flow = df['flow_heaviness'].dropna().iloc[-1]
        flow_map = {'none': 0.0, 'light': 0.3, 'medium': 0.6, 'heavy': 1.0}
        severity_score += flow_map.get(latest_flow, 0.0)
        components += 1

    if components == 0:
        return 0.0
        
    # Average the available components for the final index
    return round(max(0.0, min(1.0, severity_score / components)), 2)


def compute_patient_profile_norms(df: pd.DataFrame) -> dict:
    """
    Extracts and normalises patient profile data (age, bmi, amh) to 0.0-1.0.
    Uses the latest non-null value from the DataFrame.
    Normalisation bounds match those used in training data generation.
    """
    BOUNDS = {"age": (18.0, 50.0), "bmi": (12.0, 45.0), "amh": (0.0, 70.0)}

    def _latest(col: str) -> float | None:
        if col in df.columns and not df[col].isna().all():
            return float(df[col].dropna().iloc[-1])
        return None

    def _norm(val, lo, hi):
        if val is None:
            return 0.0
        return round(max(0.0, min(1.0, (val - lo) / (hi - lo))), 4)

    age_raw = _latest("age")
    bmi_raw = _latest("bmi")
    amh_raw = _latest("amh")

    return {
        "age_norm": _norm(age_raw, *BOUNDS["age"]),
        "bmi_norm": _norm(bmi_raw, *BOUNDS["bmi"]),
        "amh_norm": _norm(amh_raw, *BOUNDS["amh"]),
    }
