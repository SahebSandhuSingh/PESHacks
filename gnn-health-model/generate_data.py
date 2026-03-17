import os
import pandas as pd
import numpy as np


# ---------------------------------------------------------------------------
# Real-data paths (relative to project root)
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCEL_PATH = os.path.join(PROJECT_ROOT, "PCOS_data_without_infertility.xlsx")


# ---------------------------------------------------------------------------
# Normalisation helpers (min-max to 0-1)
# ---------------------------------------------------------------------------
# Clinically reasonable bounds for PCOS population
NORM_BOUNDS = {
    "age":    (18.0,  50.0),
    "bmi":    (12.0,  45.0),
    "amh":    (0.0,   70.0),
}


def _norm(values: np.ndarray, lo: float, hi: float) -> np.ndarray:
    return np.clip((values - lo) / (hi - lo), 0.0, 1.0)


def _load_real_pcos_data() -> pd.DataFrame:
    """
    Loads the 177 PCOS=1 rows from the Excel file.
    Returns a DataFrame with normalised age, bmi, amh columns (0-1).
    """
    full = pd.read_excel(EXCEL_PATH, sheet_name="Full_new")
    full.columns = full.columns.str.strip()

    pcos1 = full[full["PCOS (Y/N)"] == 1].copy()

    age_raw = pd.to_numeric(pcos1["Age (yrs)"], errors="coerce").values
    bmi_raw = pd.to_numeric(pcos1["BMI"], errors="coerce").values
    amh_raw = pd.to_numeric(pcos1["AMH(ng/mL)"], errors="coerce").values

    return pd.DataFrame({
        "age_norm":  _norm(age_raw, *NORM_BOUNDS["age"]),
        "bmi_norm":  _norm(bmi_raw, *NORM_BOUNDS["bmi"]),
        "amh_norm":  _norm(amh_raw, *NORM_BOUNDS["amh"]),
    })


def _generate_synthetic_patient_features(n: int, real_df: pd.DataFrame) -> pd.DataFrame:
    """
    Generates `n` synthetic patient rows whose age/bmi/amh distributions
    closely match the real PCOS=1 data using per-column mean+std sampling.
    """
    out = {}
    for col in ["age_norm", "bmi_norm", "amh_norm"]:
        mu = real_df[col].mean()
        sigma = real_df[col].std()
        out[col] = np.clip(np.random.normal(mu, sigma, size=n), 0.0, 1.0)
    return pd.DataFrame(out)


def _sigmoid(x: np.ndarray) -> np.ndarray:
    """Numerically stable sigmoid for smooth non-linear mapping."""
    return 1.0 / (1.0 + np.exp(-np.clip(x, -10, 10)))


def generate_synthetic_data(num_samples: int = 5000):
    """
    Generates a high-complexity health-indicator dataset that blends:
      • 177 real PCOS patient features (age, bmi, amh)
      • Synthetically extended patient features for the remaining rows
      • Non-linear & interaction-based physiological correlations
      • Menstrual cycle phase modulation
      • Heteroscedastic (state-dependent) noise
      • Clinical outlier injection (~5% of rows)
    """
    np.random.seed(42)
    N = num_samples

    # ------------------------------------------------------------------
    # A.  Patient features (age_norm, bmi_norm, amh_norm)
    # ------------------------------------------------------------------
    real_df = _load_real_pcos_data()
    n_real = len(real_df)
    n_synth = N - n_real
    print(f"Real PCOS=1 rows: {n_real}  |  Synthetic rows to generate: {n_synth}")

    synth_df = _generate_synthetic_patient_features(n_synth, real_df)
    patient_df = pd.concat([real_df, synth_df], ignore_index=True)
    patient_df = patient_df.sample(frac=1, random_state=42).reset_index(drop=True)

    age  = patient_df["age_norm"].values
    bmi  = patient_df["bmi_norm"].values
    amh  = patient_df["amh_norm"].values

    # ------------------------------------------------------------------
    # B.  Menstrual cycle phase (simulates ~28-day hormonal fluctuations)
    #     0.0 = follicular start, ~0.5 = ovulation, 1.0 = end of luteal
    # ------------------------------------------------------------------
    cycle_phase = np.random.uniform(0, 1, N)
    # Sinusoidal hormonal modulation: peaks near ovulation (~0.5)
    hormonal_wave = np.sin(cycle_phase * np.pi)          # 0→1→0 across cycle
    luteal_flag   = (cycle_phase > 0.55).astype(float)   # 1 in luteal phase

    # ------------------------------------------------------------------
    # C.  Physiological indicators with non-linear interactions
    # ------------------------------------------------------------------

    # Heteroscedastic noise: scale depends on local context
    def hn(base_std, modifier=None):
        """Heteroscedastic noise — std scales with an optional modifier."""
        if modifier is None:
            modifier = np.ones(N)
        scale = base_std * (0.7 + 1.0 * np.abs(modifier))
        return np.random.normal(0, scale)

    # Latent confounders: unobserved variables the GNN must learn around
    # Simulates genetics, diet quality, medication adherence — things we can't measure
    latent_genetics    = np.random.beta(2, 5, N)     # skewed low — most have mild genetic risk
    latent_diet        = np.random.uniform(0, 1, N)   # random diet quality
    latent_medication  = np.random.binomial(1, 0.3, N).astype(float)  # 30% on medication

    # 1. Activity score
    #    BMI has diminishing returns (quadratic penalty at high BMI)
    #    Age slightly reduces activity; cycle phase has minor effect
    #    Latent diet quality helps maintain activity
    activity_base = (0.65
                     - 0.15 * bmi
                     - 0.12 * bmi**2          # quadratic BMI penalty
                     - 0.08 * age
                     + 0.05 * hormonal_wave    # slight boost near ovulation
                     + 0.07 * latent_diet      # better diet → more energy
                     - 0.05 * latent_genetics) # genetic fatigue factor
    activity_score = np.clip(activity_base + hn(0.14, bmi), 0.0, 1.0)

    # 2. Symptom severity
    #    Multiplicative interaction: high AMH × high BMI compounds severity
    #    Luteal phase worsens symptoms (PMS effect)
    #    Age has a U-shaped relationship (worse at extremes)
    amh_bmi_interaction = amh * bmi * 0.45     # synergistic worsening
    age_u_shape = 0.15 * (2 * age - 1)**2      # worse at young & old extremes
    symptom_base = (0.10
                    + 0.25 * amh
                    + 0.15 * bmi
                    + amh_bmi_interaction
                    + age_u_shape
                    + 0.12 * luteal_flag        # PMS / luteal worsening
                    - 0.06 * activity_score)    # exercise alleviates symptoms
    # Medication reduces symptoms for those taking it
    symptom_base -= 0.15 * latent_medication
    symptom_severity_index = np.clip(symptom_base + hn(0.10, amh), 0.0, 1.0)

    # 3. Sleep stability
    #    Non-linear: severe symptoms crash sleep (sigmoid threshold)
    #    Age linearly degrades sleep; cycle disruption hurts
    symptom_sleep_penalty = _sigmoid(8 * (symptom_severity_index - 0.45))  # sharp drop past 0.45
    sleep_base = (0.85
                  - 0.35 * symptom_sleep_penalty
                  - 0.10 * age
                  - 0.08 * luteal_flag
                  + 0.06 * activity_score       # moderate exercise helps sleep
                  - 0.04 * activity_score**2)   # but over-exercise hurts
    # Genetics and diet affect sleep quality as hidden factors
    sleep_base += 0.05 * latent_diet - 0.06 * latent_genetics
    sleep_stability = np.clip(sleep_base + hn(0.11, symptom_severity_index), 0.0, 1.0)

    # 4. Stress index
    #    Complex multi-factor: poor sleep × high symptoms compounds stress
    #    AMH elevates cortisol-linked stress; activity buffers it
    sleep_symptom_cross = (1.0 - sleep_stability) * symptom_severity_index * 0.30
    stress_base = (0.35
                   - 0.20 * sleep_stability
                   - 0.12 * activity_score
                   + 0.25 * symptom_severity_index
                   + sleep_symptom_cross          # interaction term
                   + 0.08 * amh
                   + 0.06 * bmi
                   + 0.05 * luteal_flag
                   - 0.04 * hormonal_wave)        # ovulation temporarily lowers stress
    # Medication and diet buffer stress as latent factors
    stress_base -= 0.08 * latent_medication - 0.05 * latent_diet + 0.07 * latent_genetics
    stress_index = np.clip(stress_base + hn(0.11, symptom_severity_index), 0.0, 1.0)

    # 5. Temperature cycle stability
    #    Sigmoid-gated: stress above threshold destabilises temp rhythms
    #    Sleep and activity are protective; AMH disrupts cycle regularity
    stress_temp_penalty = _sigmoid(7 * (stress_index - 0.50))
    temp_base = (0.40
                 + 0.30 * sleep_stability
                 + 0.15 * activity_score
                 - 0.30 * stress_temp_penalty
                 - 0.10 * amh                    # high AMH → irregular cycles
                 + 0.08 * hormonal_wave          # ovulation → more regular
                 - 0.05 * np.abs(bmi - 0.4))     # deviation from healthy BMI hurts
    temp_cycle_stability = np.clip(temp_base + hn(0.10, stress_index), 0.0, 1.0)

    # ------------------------------------------------------------------
    # D.  Clinical outlier injection (~5% of samples)
    #     Simulates flare-ups, acute stress episodes, insomnia bouts
    # ------------------------------------------------------------------
    n_outliers = int(0.12 * N)
    outlier_idx = np.random.choice(N, n_outliers, replace=False)

    outlier_type = np.random.choice(["flare", "insomnia", "acute_stress"], n_outliers)
    for i, otype in zip(outlier_idx, outlier_type):
        if otype == "flare":
            symptom_severity_index[i] = np.clip(symptom_severity_index[i] + 0.35, 0, 1)
            stress_index[i]           = np.clip(stress_index[i] + 0.20, 0, 1)
        elif otype == "insomnia":
            sleep_stability[i]        = np.clip(sleep_stability[i] - 0.35, 0, 1)
            stress_index[i]           = np.clip(stress_index[i] + 0.15, 0, 1)
        elif otype == "acute_stress":
            stress_index[i]           = np.clip(stress_index[i] + 0.30, 0, 1)
            temp_cycle_stability[i]   = np.clip(temp_cycle_stability[i] - 0.20, 0, 1)

    # ------------------------------------------------------------------
    # E.  Target variables (complex non-linear formulas)
    # ------------------------------------------------------------------

    # Physiological stability: weighted sum + interaction terms + sigmoid gate
    # Good sleep × good activity has a synergistic bonus
    synergy_bonus = sleep_stability * activity_score * 0.15
    bmi_amh_penalty = bmi * amh * 0.10    # combined metabolic-hormonal drag

    physio_raw = (sleep_stability * 0.25
                  + activity_score * 0.18
                  + temp_cycle_stability * 0.22
                  - stress_index * 0.20
                  - symptom_severity_index * 0.12
                  + synergy_bonus
                  - bmi_amh_penalty
                  - 0.05 * age               # age-related decline
                  + 0.04 * hormonal_wave     # slight ovulation boost
                  + 0.08)
    # Sigmoid squash to keep in (0,1) smoothly instead of hard clip
    physiological_stability_score = _sigmoid(6 * (physio_raw - 0.45))
    # Add correlated noise that depends on latent confounders
    physio_latent_noise = (0.03 * latent_genetics
                           - 0.02 * latent_medication
                           + np.random.normal(0, 0.06, N))
    physiological_stability_score += physio_latent_noise
    physiological_stability_score = np.clip(physiological_stability_score, 0.0, 1.0)

    # Stress impact: how much stress is degrading the system
    # Multiplicative: high stress + poor sleep compounds the damage
    compound_factor = stress_index * (1.0 - sleep_stability) * 0.25
    stress_impact_raw = (stress_index * 0.40
                         + (1.0 - sleep_stability) * 0.25
                         + compound_factor
                         + amh * 0.08
                         + symptom_severity_index * 0.10
                         + bmi * 0.05
                         - activity_score * 0.08    # exercise buffers impact
                         - 0.05)
    stress_impact_score = _sigmoid(5 * (stress_impact_raw - 0.35))
    # Latent-dependent noise makes prediction harder
    impact_latent_noise = (0.04 * latent_genetics
                           + 0.03 * (1.0 - latent_diet)
                           + np.random.normal(0, 0.06, N))
    stress_impact_score += impact_latent_noise
    stress_impact_score = np.clip(stress_impact_score, 0.0, 1.0)

    # ------------------------------------------------------------------
    # F.  Export
    # ------------------------------------------------------------------
    df = pd.DataFrame({
        "age_norm": np.round(age, 4),
        "bmi_norm": np.round(bmi, 4),
        "amh_norm": np.round(amh, 4),
        "activity_score": np.round(activity_score, 4),
        "symptom_severity_index": np.round(symptom_severity_index, 4),
        "sleep_stability": np.round(sleep_stability, 4),
        "stress_index": np.round(stress_index, 4),
        "temperature_cycle_stability": np.round(temp_cycle_stability, 4),
        "physiological_stability_score": np.round(physiological_stability_score, 4),
        "stress_impact_score": np.round(stress_impact_score, 4),
    })

    df.to_csv("synthetic_health_data.csv", index=False)
    print(f"Generated {N} records → synthetic_health_data.csv")
    print(f"  Outliers injected: {n_outliers} ({n_outliers/N*100:.1f}%)")
    print(df.describe().round(3).to_string())


if __name__ == "__main__":
    generate_synthetic_data(5000)
