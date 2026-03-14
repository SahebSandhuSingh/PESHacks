import numpy as np

from environment import DigitalTwinEnv, ACTION_NAMES
from agent import DQNAgent


def train(
    num_episodes:   int   = 800,
    max_steps:      int   = 20,
    print_every:    int   = 50,
):
    """
    DQN Training Loop.

    Each episode:
    1. The Digital Twin is reset to a random unhealthy patient state.
    2. The RL agent interacts with the twin for up to `max_steps`.
    3. At each step the agent:
       a. Picks an action (epsilon-greedy)
       b. The Digital Twin applies it and returns next_state + reward
       c. Transition is stored in the replay buffer
       d. Agent samples a mini-batch and updates the Q-network
    4. Episode ends when the patient reaches stability ≥ 0.80 or max steps.
    """

    env   = DigitalTwinEnv(max_steps=max_steps)
    agent = DQNAgent(
        state_dim=4,
        num_actions=5,
        hidden_dim=64,
        lr=1e-3,
        gamma=0.95,
        epsilon_start=1.0,
        epsilon_end=0.05,
        epsilon_decay=0.995,
        buffer_size=10_000,
        batch_size=64,
        target_update_freq=50,
    )

    episode_rewards = []
    best_avg_reward = -np.inf

    print(f"Starting DQN training for {num_episodes} episodes...")
    print(f"{'Episode':>8} | {'Avg Reward':>12} | {'Epsilon':>8} | {'Best Avg':>10}")
    print("-" * 50)

    for ep in range(1, num_episodes + 1):
        state, _ = env.reset()
        ep_reward = 0.0

        for _ in range(max_steps):
            # Agent selects action (explore or exploit)
            action = agent.select_action(state)

            # Digital Twin simulates the intervention
            next_state, reward, done, _, _ = env.step(action)

            # Store experience and learn
            agent.store(state, action, reward, next_state, float(done))
            agent.learn()

            ep_reward += reward
            state = next_state

            if done:
                break

        episode_rewards.append(ep_reward)

        if ep % print_every == 0:
            avg_reward = np.mean(episode_rewards[-print_every:])
            print(f"{ep:>8} | {avg_reward:>12.3f} | {agent.epsilon:>8.4f} | {best_avg_reward:>10.3f}")

            if avg_reward > best_avg_reward:
                best_avg_reward = avg_reward
                agent.save("dqn_weights.pth")

    # Final save
    agent.save("dqn_weights.pth")

    print()
    print(f"Training complete. Best avg reward (per {print_every} eps): {best_avg_reward:.3f}")
    print("Weights saved to dqn_weights.pth")

    # Quick sanity-check: run a greedy episode with the trained agent
    print()
    print("=== Sanity Check: Greedy Evaluation ===")
    agent.epsilon = 0.0   # pure exploitation
    state, _ = env.reset()
    print(f"  Start state: stress={state[0]:.2f}, sleep={state[1]:.2f}, "
          f"activity={state[2]:.2f}, temp={state[3]:.2f}")

    total_r = 0
    for step in range(max_steps):
        action = agent.select_action(state)
        state, reward, done, _, info = env.step(action)
        total_r += reward
        print(f"  Step {step+1:02d}: {ACTION_NAMES[action]:<38} "
              f"reward={reward:+.2f}  stability={info['physiological_stability']:.3f}")
        if done:
            break

    print(f"  Total reward: {total_r:.2f}")


if __name__ == "__main__":
    train()
