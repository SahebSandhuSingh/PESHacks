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
        reward = self._compute_reward(prev_state, self.state)

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
        reward = self._compute_reward(state, next_state)
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

        if action == 0:
            # Improve sleep routine:
            # Sleep consistency improves directly.
            # Better sleep lowers stress and stabilises temperature rhythm.
            s[SLEEP]    = min(1.0, s[SLEEP]    + 0.12 + noise())
            s[STRESS]   = max(0.0, s[STRESS]   - 0.08 + noise())
            s[TEMP]     = min(1.0, s[TEMP]     + 0.05 + noise())
            s[SYMPTOM]  = max(0.0, s[SYMPTOM]  - 0.04 + noise())

        elif action == 1:
            # Stress reduction intervention (meditation, therapy, etc.):
            # Stress drops significantly.
            # Indirectly improves sleep and temperature stability.
            # Yoga/meditation also reduces symptom severity.
            s[STRESS]   = max(0.0, s[STRESS]   - 0.15 + noise())
            s[SLEEP]    = min(1.0, s[SLEEP]    + 0.06 + noise())
            s[TEMP]     = min(1.0, s[TEMP]     + 0.04 + noise())
            s[SYMPTOM]  = max(0.0, s[SYMPTOM]  - 0.10 + noise())

        elif action == 2:
            # Increase physical activity:
            # Activity score rises directly.
            # Moderate activity lowers stress and improves temperature.
            # High existing stress may slightly worsen from overexertion.
            s[ACTIVITY] = min(1.0, s[ACTIVITY] + 0.12 + noise())
            s[STRESS]   = max(0.0, s[STRESS]   - 0.05 + noise(0.03))
            s[TEMP]     = min(1.0, s[TEMP]     + 0.04 + noise())
            s[SYMPTOM]  = max(0.0, s[SYMPTOM]  - 0.06 + noise())

        elif action == 3:
            # Maintain current habits:
            # Minimal change — slight natural drift toward baseline.
            s[STRESS]   = s[STRESS]   + noise(0.03)
            s[SLEEP]    = s[SLEEP]    + noise(0.03)
            s[ACTIVITY] = s[ACTIVITY] + noise(0.03)
            s[TEMP]     = s[TEMP]     + noise(0.03)
            s[SYMPTOM]  = s[SYMPTOM]  + noise(0.03)

        elif action == 4:
            # Recommend medical consultation:
            # Professional intervention — broad moderate improvement across all axes.
            s[STRESS]   = max(0.0, s[STRESS]   - 0.10 + noise())
            s[SLEEP]    = min(1.0, s[SLEEP]    + 0.08 + noise())
            s[ACTIVITY] = min(1.0, s[ACTIVITY] + 0.05 + noise())
            s[TEMP]     = min(1.0, s[TEMP]     + 0.06 + noise())
            s[SYMPTOM]  = max(0.0, s[SYMPTOM]  - 0.12 + noise())

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
        reward = 0.0

        prev_stability = self._physiological_stability(prev)
        curr_stability = self._physiological_stability(curr)
        stability_delta = curr_stability - prev_stability

        # Base reward: heavily weight stability improvements
        if stability_delta > 0:
            reward += stability_delta * 20.0  # make positive changes obvious
        else:
            reward -= 2.0  # penalty for worsening

        # Structural penalty for inaction if patient is not perfectly healthy
        if action == 3:
            if prev_stability < 0.80:
                reward -= 5.0  # massive penalty for doing nothing when sick
            else:
                reward += 1.0  # small reward for maintaining good health

        return float(reward)
