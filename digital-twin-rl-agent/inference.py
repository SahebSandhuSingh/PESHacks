import numpy as np

from environment import DigitalTwinEnv, ACTION_NAMES
from agent import DQNAgent


def load_agent(weights_path: str = "dqn_weights.pth") -> DQNAgent:
    """Load a pre-trained DQN agent from saved weights."""
    agent = DQNAgent(state_dim=4, num_actions=5, hidden_dim=64)
    agent.load(weights_path)
    agent.epsilon = 0.0   # pure exploitation during inference
    return agent


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

    # Best action = highest Q-value (what the RL agent has learned to prefer)
    best_action = int(np.argmax(q_values))
    best_sim    = simulations[best_action]

    # Physiological stability before and after best action
    stability_before = env._physiological_stability(state)
    stability_after  = env._physiological_stability(best_sim["next_state"])
    expected_improvement = max(0.0, round(stability_after - stability_before, 4))

    # Confidence: softmax over Q-values → probability of best action
    q_shifted   = q_values - q_values.max()   # numerical stability
    softmax     = np.exp(q_shifted) / np.exp(q_shifted).sum()
    confidence  = round(float(softmax[best_action]), 4)

    ns = best_sim["next_state"]
    simulated_next_state = {
        "stress_index":                round(float(ns[0]), 4),
        "sleep_stability":             round(float(ns[1]), 4),
        "activity_score":              round(float(ns[2]), 4),
        "temperature_cycle_stability": round(float(ns[3]), 4),
    }

    # All action Q-values for transparency
    all_q = {
        ACTION_NAMES[i]: round(float(q_values[i]), 4)
        for i in range(agent.num_actions)
    }

    # Generate a user-friendly message based on the predicted changes
    action_text = ACTION_NAMES[best_action].replace("_", " ")
    
    # Calculate key deltas for the message
    stress_drop = round(state[0] - ns[0], 2)
    sleep_gain = round(ns[1] - state[1], 2)
    activity_gain = round(ns[2] - state[2], 2)
    
    msg_parts = [f"Our AI recommends you **{action_text}**.", ""]
    msg_parts.append("*Predicted impact over the next period:*")
    
    if expected_improvement > 0.02:
        msg_parts.append(f"• Overall health stability will improve by +{expected_improvement:.2f}.")
    if stress_drop > 0.05:
        msg_parts.append(f"• Your stress index is expected to drop significantly (-{stress_drop:.2f}).")
    if sleep_gain > 0.05:
        msg_parts.append(f"• Your sleep stability will increase (+{sleep_gain:.2f}).")
    if activity_gain > 0.05:
        msg_parts.append(f"• Your physical activity levels will rise (+{activity_gain:.2f}).")
        
    if len(msg_parts) == 2:
        msg_parts.append("• This action will help stabilise your current health trajectory.")

    patient_message = "\n".join(msg_parts)

    return {
        "recommended_action":   ACTION_NAMES[best_action],
        "patient_message":      patient_message,
        "expected_improvement": expected_improvement,
        "confidence":           confidence,
        "simulated_next_state": simulated_next_state,
        "all_action_q_values":  all_q,
    }
