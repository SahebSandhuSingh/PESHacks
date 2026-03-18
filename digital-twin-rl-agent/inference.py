import numpy as np

from environment import DigitalTwinEnv, ACTION_NAMES
from agent import DQNAgent


def load_agent(weights_path: str = "dqn_weights.pth") -> DQNAgent:
    """Load a pre-trained DQN agent from saved weights."""
    agent = DQNAgent(state_dim=5, num_actions=5, hidden_dim=64)
    agent.load(weights_path)
    agent.epsilon = 0.0   # pure exploitation during inference
    return agent


def _action_display_name(action_name: str) -> str:
    label_map = {
        "improve_sleep_routine": "improve your sleep routine",
        "stress_reduction_intervention": "start a stress-reduction intervention",
        "increase_physical_activity": "increase your physical activity gradually",
        "maintain_current_habits": "maintain your current habits",
        "recommend_medical_consultation": "seek a medical consultation",
    }
    return label_map.get(action_name, action_name.replace("_", " "))


def _build_patient_message(action_name: str, state: np.ndarray, next_state: np.ndarray, expected_improvement: float) -> str:
    stress_drop = float(state[0] - next_state[0])
    sleep_gain = float(next_state[1] - state[1])
    activity_gain = float(next_state[2] - state[2])
    temp_gain = float(next_state[3] - state[3])
    symptom_drop = float(state[4] - next_state[4])

    issue_scores = {
        "stress": float(state[0]),
        "sleep": float(1.0 - state[1]),
        "activity": float(1.0 - state[2]),
        "temperature": float(1.0 - state[3]),
        "symptoms": float(state[4]),
    }
    primary_issue = max(issue_scores, key=issue_scores.get)

    opener_map = {
        "improve_sleep_routine": "Your current pattern suggests sleep is one of the main leverage points right now.",
        "stress_reduction_intervention": "Your current state suggests stress regulation should be the first priority right now.",
        "increase_physical_activity": "Your current state suggests gradual movement is the most useful next step right now.",
        "maintain_current_habits": "Your current state looks relatively stable, so preserving consistency is the best option right now.",
        "recommend_medical_consultation": "Your current state suggests you may benefit from professional support rather than only lifestyle adjustments.",
    }

    msg_parts = [
        f"Our AI recommends that you **{_action_display_name(action_name)}**.",
        opener_map.get(action_name, "This is the best next step based on your current state."),
        "",
        f"*Main issue detected:* {primary_issue}.",
        "*Predicted short-term impact:*",
    ]

    improvements = []
    if expected_improvement > 0.01:
        improvements.append(f"- **Overall stability:** expected to improve by `+{expected_improvement:.2f}`")
    if stress_drop > 0.03:
        improvements.append(f"- **Stress:** expected to decrease by `-{stress_drop:.2f}`")
    if sleep_gain > 0.03:
        improvements.append(f"- **Sleep stability:** expected to improve by `+{sleep_gain:.2f}`")
    if activity_gain > 0.03:
        improvements.append(f"- **Activity:** expected to improve by `+{activity_gain:.2f}`")
    if temp_gain > 0.03:
        improvements.append(f"- **Temperature rhythm stability:** expected to improve by `+{temp_gain:.2f}`")
    if symptom_drop > 0.03:
        improvements.append(f"- **Symptoms:** expected to decrease by `-{symptom_drop:.2f}`")

    if not improvements:
        improvements.append("- **Expected effect:** modest stabilisation without a major immediate shift")

    msg_parts.extend(improvements)

    followup_map = {
        "improve_sleep_routine": "Focus on a fixed sleep time, lower late-night stimulation, and avoid abrupt schedule changes.",
        "stress_reduction_intervention": "Breathing work, relaxation, therapy, or meditation may help reduce the current stress burden.",
        "increase_physical_activity": "Prefer gradual, sustainable increases in movement rather than aggressive exercise jumps.",
        "maintain_current_habits": "Consistency matters more than intensity when your signals are already reasonably balanced.",
        "recommend_medical_consultation": "If symptoms persist, worsen, or interfere with daily life, professional review is the safest next step.",
    }
    msg_parts.extend(["", followup_map.get(action_name, "")])
    return "\n".join(part for part in msg_parts if part != "")


def get_recommendation(state_vec: list[float], agent: DQNAgent):
    """
    Core inference logic:

    1. Convert the patient's health state to a numpy array.
    2. Query the DQN for Q-values over all 5 actions.
    3. For each action, use the Digital Twin to simulate the predicted next state.
    4. Select the action with the highest Q-value.
    5. Compute expected improvement and agent confidence.

    Returns a dict matching RecommendationResponse schema.
    """
    env   = DigitalTwinEnv()
    state = np.array(state_vec, dtype=np.float32)

    # Get Q-values from the trained DQN for all 5 actions
    q_values = agent.get_q_values(state)    # shape: (5,)

    # Simulate each action on the Digital Twin to get predicted next states
    simulations = {}
    for action_idx in range(agent.num_actions):
        next_state, reward = env.simulate_action(state, action_idx)
        simulations[action_idx] = {
            "next_state": next_state,
            "reward":     reward,
        }

    # Blend learned long-term value (Q) with one-step simulated clinical benefit.
    q_norm = q_values - q_values.min()
    q_denom = q_norm.max()
    if q_denom > 0:
        q_norm = q_norm / q_denom
    else:
        q_norm = np.zeros_like(q_values)

    action_scores = {}
    for action_idx in range(agent.num_actions):
        sim = simulations[action_idx]
        next_state = sim["next_state"]
        stability_before = env._physiological_stability(state)
        stability_after = env._physiological_stability(next_state)
        improvement = stability_after - stability_before
        action_scores[action_idx] = (
            0.55 * float(q_norm[action_idx]) +
            0.35 * float(sim["reward"] / 10.0) +
            0.10 * float(improvement)
        )

    best_action = max(action_scores, key=action_scores.get)

    stability_now = env._physiological_stability(state)
    maintain_action = 3
    medical_action = 4
    issue_scores = {
        "stress": float(state[0]),
        "sleep": float(1.0 - state[1]),
        "activity": float(1.0 - state[2]),
        "temperature": float(1.0 - state[3]),
        "symptoms": float(state[4]),
    }
    max_issue = max(issue_scores.values())
    primary_issue = max(issue_scores, key=issue_scores.get)

    # Clinical guardrails:
    # - if already fairly stable and no major issue stands out, prefer consistency
    # - if the case is clearly severe, prefer professional support
    very_stable = (
        stability_now >= 0.78 and
        float(state[0]) <= 0.28 and
        float(state[1]) >= 0.78 and
        float(state[2]) >= 0.60 and
        float(state[3]) >= 0.70 and
        float(state[4]) <= 0.22
    )
    near_stable = (
        stability_now >= 0.72 and
        max_issue <= 0.32 and
        float(state[1]) >= 0.70 and
        float(state[2]) >= 0.50 and
        float(state[3]) >= 0.65 and
        float(state[4]) <= 0.28
    )

    if very_stable:
        best_action = maintain_action
    elif (
        near_stable and
        primary_issue not in {"sleep", "stress"} and
        action_scores[maintain_action] >= action_scores[best_action] - 0.12
    ):
        best_action = maintain_action

    severe_case = (
        float(state[0]) >= 0.85 or
        float(state[4]) >= 0.80 or
        float(state[1]) <= 0.15
    )
    if severe_case and action_scores[medical_action] >= action_scores[best_action] - 0.03:
        best_action = medical_action

    best_sim = simulations[best_action]

    # Physiological stability before and after best action
    stability_before = env._physiological_stability(state)
    stability_after  = env._physiological_stability(best_sim["next_state"])
    expected_improvement = max(0.0, round(stability_after - stability_before, 4))

    # Confidence uses blended action scores, not raw Q-values only.
    score_vec = np.array([action_scores[i] for i in range(agent.num_actions)], dtype=np.float32)
    score_shifted = score_vec - score_vec.max()
    softmax = np.exp(score_shifted) / np.exp(score_shifted).sum()
    confidence = round(float(softmax[best_action]), 4)

    ns = best_sim["next_state"]
    simulated_next_state = {
        "stress_index":                round(float(ns[0]), 4),
        "sleep_stability":             round(float(ns[1]), 4),
        "activity_score":              round(float(ns[2]), 4),
        "temperature_cycle_stability": round(float(ns[3]), 4),
        "symptom_severity_index":      round(float(ns[4]), 4),
    }

    # All action Q-values for transparency
    all_q = {
        ACTION_NAMES[i]: round(float(q_values[i]), 4)
        for i in range(agent.num_actions)
    }

    patient_message = _build_patient_message(
        ACTION_NAMES[best_action],
        state,
        ns,
        expected_improvement,
    )

    return {
        "recommended_action":   ACTION_NAMES[best_action],
        "patient_message":      patient_message,
        "expected_improvement": expected_improvement,
        "confidence":           confidence,
        "simulated_next_state": simulated_next_state,
        "all_action_q_values":  all_q,
    }
