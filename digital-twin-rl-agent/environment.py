import numpy as np
import gymnasium as gym
from gymnasium import spaces


# Maps action index → human-readable name
ACTION_NAMES = {
    0: "improve_sleep_routine",
    1: "stress_reduction_intervention",
    2: "increase_physical_activity",
    3: "maintain_current_habits",
    4: "recommend_medical_consultation",
}

# State vector indices (for readability)
STRESS  = 0
SLEEP   = 1
ACTIVITY = 2
TEMP    = 3
SYMPTOM = 4


class DigitalTwinEnv(gym.Env):
    """
    Custom Gymnasium environment that simulates a patient's Digital Twin.

    ──────────────────────────────────────────────────────────────────
    HOW THE DIGITAL TWIN INTERACTS WITH THE RL AGENT
    ──────────────────────────────────────────────────────────────────
    1. The agent observes the patient's current physiological STATE
       (a 4-dim vector: stress, sleep, activity, temperature stability).

    2. The agent picks an ACTION (a lifestyle intervention, 0-4).

    3. The Digital Twin's TRANSITION MODEL applies the intervention,
       simulating the expected physiological change over the next period
       (e.g., one week of following the recommendation).

    4. The Twin returns the new physiological STATE and a REWARD signal
       that measures how much the patient improved.

    5. This loop continues until the patient reaches a stable, healthy
       state (episode done) or the max episode steps are reached.
    ──────────────────────────────────────────────────────────────────

    State Space  : [stress_index, sleep_stability, activity_score, temp_cycle_stability, symptom_severity_index]
                   Each value ∈ [0.0, 1.0]

    Action Space : Discrete(5)
        0 = improve_sleep_routine
        1 = stress_reduction_intervention
        2 = increase_physical_activity
        3 = maintain_current_habits
        4 = recommend_medical_consultation
    """

    metadata = {"render_modes": []}

    def __init__(self, max_steps: int = 20):
        super().__init__()
        self.max_steps = max_steps

        # Observation: 5 continuous values in [0, 1]
        self.observation_space = spaces.Box(
            low=0.0, high=1.0, shape=(5,), dtype=np.float32
        )

        # Action: one of 5 discrete lifestyle interventions
        self.action_space = spaces.Discrete(5)

        self.state: np.ndarray = None
        self.step_count: int = 0

    # ──────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────

    def reset(self, state: np.ndarray = None, seed=None, options=None):
        """
        Reset the Digital Twin to a starting patient state.
        If `state` is provided, initialise from it (used during inference).
        Otherwise, sample a random unhealthy-leaning state for training.
        """
        super().reset(seed=seed)
        if state is not None:
            self.state = np.clip(np.array(state, dtype=np.float32), 0.0, 1.0)
        else:
            # Random starting state, biased toward suboptimal health
            self.state = np.array([
                np.random.uniform(0.4, 1.0),   # stress: medium–high
                np.random.uniform(0.0, 0.6),   # sleep: low–medium
                np.random.uniform(0.0, 0.6),   # activity: low–medium
                np.random.uniform(0.3, 0.8),   # temp: variable
                np.random.uniform(0.1, 0.7),   # symptom severity: low–high
            ], dtype=np.float32)

        self.step_count = 0
        return self.state.copy(), {}

    def step(self, action: int):
        """
        Apply an action (intervention) to the Digital Twin and observe:
        - next_state : updated physiological values
        - reward     : how much the patient's health improved
        - done       : whether a stable healthy state was reached
        """
        prev_state = self.state.copy()

        # Apply the transition model for the chosen action
        self.state = self._transition(self.state, action)

        # Compute reward based on physiological improvement
        reward = self._compute_reward(prev_state, self.state, action)

        self.step_count += 1

        # Episode ends when healthy stability is achieved or max steps hit
        stability = self._physiological_stability(self.state)
        done = bool(stability >= 0.80 or self.step_count >= self.max_steps)

        info = {
            "action_name": ACTION_NAMES[action],
            "physiological_stability": stability,
        }
        return self.state.copy(), reward, done, False, info

    def simulate_action(self, state: np.ndarray, action: int):
        """
        One-shot simulation: predict next state + reward for a single action
        without mutating the environment state.
        Used by the RL agent during inference to compare all actions.
        """
        next_state = self._transition(state.copy(), action)
        reward = self._compute_reward(state, next_state, action)
        return next_state, reward

    def action_name(self, action: int) -> str:
        return ACTION_NAMES[action]

    # ──────────────────────────────────────────────────────────────
    # Internal: Digital Twin transition model
    # ──────────────────────────────────────────────────────────────

    def _transition(self, state: np.ndarray, action: int) -> np.ndarray:
        """
        Physiological transition model — how each intervention changes
        the patient's indicators over one simulated period.

        Noise is added to reflect natural biological variability.
        """
        s = state.copy()
        noise = lambda scale=0.02: np.random.normal(0, scale)
        stress_level = float(s[STRESS])
        sleep_deficit = 1.0 - float(s[SLEEP])
        activity_gap = 1.0 - float(s[ACTIVITY])
        temp_gap = 1.0 - float(s[TEMP])
        symptom_level = float(s[SYMPTOM])

        if action == 0:
            sleep_gain = 0.05 + 0.14 * sleep_deficit
            stress_relief = 0.03 + 0.08 * sleep_deficit + 0.04 * stress_level
            temp_gain = 0.01 + 0.06 * sleep_deficit + 0.03 * temp_gap
            symptom_relief = 0.01 + 0.05 * min(1.0, sleep_deficit + symptom_level)
            s[SLEEP] = min(1.0, s[SLEEP] + sleep_gain + noise())
            s[STRESS] = max(0.0, s[STRESS] - stress_relief + noise())
            s[TEMP] = min(1.0, s[TEMP] + temp_gain + noise())
            s[SYMPTOM] = max(0.0, s[SYMPTOM] - symptom_relief + noise())

        elif action == 1:
            stress_relief = 0.05 + 0.16 * stress_level
            sleep_gain = 0.01 + 0.08 * stress_level + 0.04 * sleep_deficit
            temp_gain = 0.01 + 0.05 * stress_level + 0.03 * temp_gap
            symptom_relief = 0.02 + 0.10 * symptom_level
            s[STRESS] = max(0.0, s[STRESS] - stress_relief + noise())
            s[SLEEP] = min(1.0, s[SLEEP] + sleep_gain + noise())
            s[TEMP] = min(1.0, s[TEMP] + temp_gain + noise())
            s[SYMPTOM] = max(0.0, s[SYMPTOM] - symptom_relief + noise())

        elif action == 2:
            activity_gain = 0.04 + 0.14 * activity_gap
            temp_gain = 0.01 + 0.06 * activity_gap + 0.03 * temp_gap
            symptom_relief = 0.01 + 0.07 * symptom_level
            stress_relief = 0.02 + 0.06 * activity_gap - 0.08 * max(0.0, stress_level - 0.7) - 0.06 * max(0.0, 0.35 - s[SLEEP])
            sleep_effect = 0.01 + 0.03 * activity_gap - 0.05 * max(0.0, stress_level - 0.75)
            s[ACTIVITY] = min(1.0, s[ACTIVITY] + activity_gain + noise())
            s[STRESS] = np.clip(s[STRESS] - stress_relief + noise(0.03), 0.0, 1.0)
            s[SLEEP] = np.clip(s[SLEEP] + sleep_effect + noise(0.02), 0.0, 1.0)
            s[TEMP] = min(1.0, s[TEMP] + temp_gain + noise())
            s[SYMPTOM] = max(0.0, s[SYMPTOM] - symptom_relief + noise())

        elif action == 3:
            stable_state = (
                stress_level < 0.35 and
                s[SLEEP] > 0.70 and
                s[ACTIVITY] > 0.55 and
                s[TEMP] > 0.65 and
                symptom_level < 0.30
            )
            if stable_state:
                s[STRESS] = max(0.0, s[STRESS] - 0.01 + noise(0.012))
                s[SLEEP] = min(1.0, s[SLEEP] + 0.01 + noise(0.012))
                s[ACTIVITY] = np.clip(s[ACTIVITY] + noise(0.012), 0.0, 1.0)
                s[TEMP] = min(1.0, s[TEMP] + 0.01 + noise(0.012))
                s[SYMPTOM] = max(0.0, s[SYMPTOM] - 0.01 + noise(0.012))
            else:
                drift = 0.04
                deterioration = 0.03
                s[STRESS] = s[STRESS] + deterioration + noise(drift)
                s[SLEEP] = s[SLEEP] - deterioration + noise(drift)
                s[ACTIVITY] = s[ACTIVITY] - (deterioration * 0.5) + noise(drift)
                s[TEMP] = s[TEMP] - (deterioration * 0.5) + noise(drift)
                s[SYMPTOM] = s[SYMPTOM] + (deterioration * 0.6) + noise(drift)

        elif action == 4:
            severity = max(stress_level, symptom_level, sleep_deficit)
            stress_relief = 0.03 + 0.11 * severity
            sleep_gain = 0.02 + 0.10 * max(sleep_deficit, symptom_level)
            activity_gain = 0.01 + 0.05 * activity_gap
            temp_gain = 0.01 + 0.07 * max(temp_gap, symptom_level)
            symptom_relief = 0.03 + 0.14 * symptom_level
            s[STRESS] = max(0.0, s[STRESS] - stress_relief + noise())
            s[SLEEP] = min(1.0, s[SLEEP] + sleep_gain + noise())
            s[ACTIVITY] = min(1.0, s[ACTIVITY] + activity_gain + noise())
            s[TEMP] = min(1.0, s[TEMP] + temp_gain + noise())
            s[SYMPTOM] = max(0.0, s[SYMPTOM] - symptom_relief + noise())

        return np.clip(s, 0.0, 1.0).astype(np.float32)

    def _physiological_stability(self, state: np.ndarray) -> float:
        """
        Holistic health score: mirrors the GNN model's physiological stability logic.
        High sleep, activity, temp → healthy; high stress → penalised.
        """
        return float(
            state[SLEEP]    * 0.30 +
            state[ACTIVITY] * 0.20 +
            state[TEMP]     * 0.25 -
            state[STRESS]   * 0.20 -
            state[SYMPTOM]  * 0.15 +
            0.30  # baseline offset
        )

    def _compute_reward(self, prev: np.ndarray, curr: np.ndarray, action: int = -1) -> float:
        """
        Reward function — encourages interventions that improve the patient's
        physiological stability in a clinically meaningful direction.
        """
        prev_stability = self._physiological_stability(prev)
        curr_stability = self._physiological_stability(curr)
        stability_delta = curr_stability - prev_stability
        reward = stability_delta * 22.0
        stable_context = (
            prev_stability >= 0.72 and
            prev[STRESS] <= 0.35 and
            prev[SLEEP] >= 0.68 and
            prev[ACTIVITY] >= 0.50 and
            prev[TEMP] >= 0.62 and
            prev[SYMPTOM] <= 0.30
        )

        deltas = curr - prev
        reward += (prev[STRESS] - curr[STRESS]) * 6.0
        reward += (curr[SLEEP] - prev[SLEEP]) * 5.0
        reward += (curr[ACTIVITY] - prev[ACTIVITY]) * 3.0
        reward += (curr[TEMP] - prev[TEMP]) * 4.0
        reward += (prev[SYMPTOM] - curr[SYMPTOM]) * 6.0

        if stability_delta < 0:
            reward += stability_delta * 10.0

        if action == 0:
            reward += 2.0 * max(0.0, 0.55 - prev[SLEEP])
            reward -= 1.0 * max(0.0, prev[SLEEP] - 0.80)
        elif action == 1:
            reward += 2.0 * max(0.0, prev[STRESS] - 0.55)
            reward += 1.0 * max(0.0, prev[SYMPTOM] - 0.55)
        elif action == 2:
            reward += 2.0 * max(0.0, 0.55 - prev[ACTIVITY])
            reward -= 2.5 * max(0.0, prev[STRESS] - 0.80)
            reward -= 1.5 * max(0.0, 0.30 - prev[SLEEP])
        elif action == 3:
            if stable_context:
                reward += 3.0
                if stability_delta >= 0:
                    reward += 1.5
            elif prev_stability < 0.78:
                reward -= 4.0
            else:
                reward += 1.2
        elif action == 4:
            severity = max(prev[STRESS], prev[SYMPTOM], 1.0 - prev[SLEEP])
            reward += 2.5 * max(0.0, severity - 0.65)
            reward -= 1.5 * max(0.0, 0.45 - severity)

        if stable_context and action != 3:
            reward -= 1.5
            if action == 4:
                reward -= 1.5
            elif action in (0, 1):
                reward -= 0.5

        overshoot_penalty = 0.0
        overshoot_penalty += max(0.0, deltas[ACTIVITY] - 0.20) * 3.0
        overshoot_penalty += max(0.0, -deltas[STRESS] - 0.25) * 1.0
        reward -= overshoot_penalty

        return float(reward)
