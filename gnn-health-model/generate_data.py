import pandas as pd
import numpy as np

def generate_synthetic_data(num_samples: int = 5000):
    """
    Generates realistic biological health indicators mathematically matching the
    Digital Hormonal Twin logic and relationships.
    """
    np.random.seed(42)

    # 1. Independent Variables (Activity & Sleep)
    # Most people are somewhere in the middle (0.5), bounded [0.0 - 1.0]
    activity_score = np.clip(np.random.normal(loc=0.5, scale=0.2, size=num_samples), 0.0, 1.0)
    sleep_stability = np.clip(np.random.normal(loc=0.6, scale=0.2, size=num_samples), 0.0, 1.0)

    # 2. Dependent Variable (Stress)
    # High sleep stability -> Low Stress
    # High activity -> Low Stress (usually, unless extreme overtraining)
    stress_base = 0.8 - (0.4 * sleep_stability) - (0.3 * activity_score)
    # Add noise
    stress_index = np.clip(stress_base + np.random.normal(loc=0.0, scale=0.1, size=num_samples), 0.0, 1.0)

    # 3. Dependent Variable (Temperature Cycle Stability)
    # Relies on consistent sleep and moderate activity without extreme stress
    temp_base = (0.5 * sleep_stability) + (0.3 * activity_score) - (0.4 * stress_index) + 0.3
    temp_cycle_stability = np.clip(temp_base + np.random.normal(loc=0.0, scale=0.1, size=num_samples), 0.0, 1.0)

    # 4. Target Variables (For the GNN to learn and predict)
    #
    # Physiological Stability: A holistic measure. High when sleep, activity, & temp are high, stress is low.
    physio_stability_base = (sleep_stability * 0.35) + (activity_score * 0.25) + (temp_cycle_stability * 0.3) - (stress_index * 0.2)
    physiological_stability_score = np.clip(physio_stability_base + np.random.normal(0, 0.05, num_samples), 0.0, 1.0)

    # Stress Impact: How much current stress is degrading the system
    # If stress is high and sleep is low, the impact compounds drastically
    stress_impact_base = (stress_index * 0.6) + ((1.0 - sleep_stability) * 0.4)
    stress_impact_score = np.clip(stress_impact_base + np.random.normal(0, 0.05, num_samples), 0.0, 1.0)

    # Export
    df = pd.DataFrame({
        "activity_score": activity_score,
        "sleep_stability": sleep_stability,
        "stress_index": stress_index,
        "temperature_cycle_stability": temp_cycle_stability,
        "physiological_stability_score": physiological_stability_score,
        "stress_impact_score": stress_impact_score
    })
    
    df.to_csv("synthetic_health_data.csv", index=False)
    print(f"Generated {num_samples} records of synthetic health data: synthetic_health_data.csv")

if __name__ == "__main__":
    generate_synthetic_data(5000)
