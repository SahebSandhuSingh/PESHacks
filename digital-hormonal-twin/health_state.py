"""
health_state.py
---------------
Synthesizes physiological indicators into a single structured health state vector.
Determines an overall hormonal balance categorization based on deviations from baseline.
"""

from typing import Dict, Any


def determine_hormonal_balance(state_vector: Dict[str, float]) -> str:
    """
    Evaluates the computed state vector against baseline thresholds
    to determine the overall hormonal health state.
    
    In a real module, this would use the scikit-learn anomaly detection outputs
    to classify the state more rigorously.
    """
    stress = state_vector.get("stress_index", 0.0)
    sleep = state_vector.get("sleep_stability", 0.0)
    activity = state_vector.get("activity_score", 0.0)
    temp_stability = state_vector.get("temperature_cycle_stability", 0.0)

    # Simplified heuristic rules for demo purposes:
    # High stress + low sleep = hormonal imbalance risk (high cortisol/low melatonin)
    if stress > 0.75 and sleep < 0.4:
        return "poor"
        
    # Generally good sleep, moderate stress, stable temps = normal balance
    if stress < 0.5 and sleep >= 0.6 and temp_stability > 0.6:
        return "optimal"
        
    if stress > 0.6 or sleep < 0.5 or temp_stability < 0.5:
         return "low"
         
    return "moderate"


def build_health_state_response(device_id: str, state_vector: Dict[str, float]) -> Dict[str, Any]:
    """
    Constructs the final structured dictionary to be returned as JSON.
    """
    balance = determine_hormonal_balance(state_vector)
    
    return {
        "device_id": device_id,
        "stress_index": state_vector.get("stress_index", 0.0),
        "sleep_stability": state_vector.get("sleep_stability", 0.0),
        "activity_score": state_vector.get("activity_score", 0.0),
        "temperature_cycle_stability": state_vector.get("temperature_cycle_stability", 0.0),
        "overall_hormonal_balance": balance
    }
