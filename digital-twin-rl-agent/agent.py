import random
from collections import deque

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from model import DQNNetwork


class ReplayBuffer:
    """
    Experience Replay Buffer — stores past (state, action, reward, next_state, done)
    transitions so the DQN can learn from shuffled, decorrelated experiences
    rather than highly-correlated sequential transitions.
    """

    def __init__(self, capacity: int = 10_000):
        self.buffer = deque(maxlen=capacity)

    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size: int):
        batch = random.sample(self.buffer, batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)
        return (
            torch.FloatTensor(np.array(states)),
            torch.LongTensor(actions),
            torch.FloatTensor(rewards),
            torch.FloatTensor(np.array(next_states)),
            torch.FloatTensor(dones),
        )

    def __len__(self):
        return len(self.buffer)


class DQNAgent:
    """
    Deep Q-Network (DQN) agent with:
    - Online network  : updated at every training step
    - Target network  : periodically synced copy of online network, used for
                        stable Bellman target computation
    - Epsilon-greedy  : balances exploration vs. exploitation
    - Experience replay: decorrelates training samples

    HOW IT INTERACTS WITH THE DIGITAL TWIN:
    1. Agent receives patient health state from the Digital Twin env.
    2. Agent picks action via epsilon-greedy policy (Q-network or random).
    3. Digital Twin applies action → returns (next_state, reward, done).
    4. Transition stored in replay buffer.
    5. Agent samples a random mini-batch and updates Q-network via
       Bellman equation: Q(s,a) ← r + γ * max_a' Q_target(s', a')
    """

    def __init__(
        self,
        state_dim:     int   = 5,
        num_actions:   int   = 5,
        hidden_dim:    int   = 64,
        lr:            float = 1e-3,
        gamma:         float = 0.95,
        epsilon_start: float = 1.0,
        epsilon_end:   float = 0.05,
        epsilon_decay: float = 0.995,
        buffer_size:   int   = 10_000,
        batch_size:    int   = 64,
        target_update_freq: int = 50,
    ):
        self.num_actions        = num_actions
        self.gamma              = gamma
        self.epsilon            = epsilon_start
        self.epsilon_end        = epsilon_end
        self.epsilon_decay      = epsilon_decay
        self.batch_size         = batch_size
        self.target_update_freq = target_update_freq
        self.train_step_count   = 0

        # Online network: learns via gradient descent
        self.online_net = DQNNetwork(state_dim, num_actions, hidden_dim)

        # Target network: frozen copy for stable Q-target computation
        self.target_net = DQNNetwork(state_dim, num_actions, hidden_dim)
        self.target_net.load_state_dict(self.online_net.state_dict())
        self.target_net.eval()

        self.optimizer = optim.Adam(self.online_net.parameters(), lr=lr)
        self.loss_fn   = nn.MSELoss()
        self.replay    = ReplayBuffer(buffer_size)

    # ──────────────────────────────────────────────────────────────
    # Action Selection
    # ──────────────────────────────────────────────────────────────

    def select_action(self, state: np.ndarray) -> int:
        """
        Epsilon-greedy action selection:
        - With probability epsilon: pick a random action (exploration)
        - Otherwise: pick the action with the highest Q-value (exploitation)
        """
        if random.random() < self.epsilon:
            return random.randint(0, self.num_actions - 1)

        with torch.no_grad():
            state_t = torch.FloatTensor(state).unsqueeze(0)
            q_values = self.online_net(state_t)
            return int(q_values.argmax(dim=1).item())

    def get_q_values(self, state: np.ndarray) -> np.ndarray:
        """Return Q-values for all actions from the current state (no grad, for inference)."""
        with torch.no_grad():
            state_t = torch.FloatTensor(state).unsqueeze(0)
            return self.online_net(state_t).squeeze(0).numpy()

    # ──────────────────────────────────────────────────────────────
    # Learning
    # ──────────────────────────────────────────────────────────────

    def store(self, state, action, reward, next_state, done):
        self.replay.push(state, action, reward, next_state, done)

    def learn(self) -> float | None:
        """
        Sample a mini-batch from replay buffer and perform one gradient step.
        Bellman target: y = r + γ * max_a' Q_target(s', a')  (if not done)
        Returns loss value or None if buffer not yet large enough.
        """
        if len(self.replay) < self.batch_size:
            return None

        states, actions, rewards, next_states, dones = self.replay.sample(self.batch_size)

        # Current Q-values for taken actions
        current_q = self.online_net(states).gather(1, actions.unsqueeze(1)).squeeze(1)

        # Bellman target using frozen target network
        with torch.no_grad():
            max_next_q = self.target_net(next_states).max(dim=1).values
            target_q   = rewards + self.gamma * max_next_q * (1 - dones)

        loss = self.loss_fn(current_q, target_q)

        self.optimizer.zero_grad()
        loss.backward()
        # Gradient clipping for stability
        torch.nn.utils.clip_grad_norm_(self.online_net.parameters(), max_norm=1.0)
        self.optimizer.step()

        self.train_step_count += 1

        # Periodically sync target network
        if self.train_step_count % self.target_update_freq == 0:
            self.target_net.load_state_dict(self.online_net.state_dict())

        # Decay exploration rate
        self.epsilon = max(self.epsilon_end, self.epsilon * self.epsilon_decay)

        return float(loss.item())

    # ──────────────────────────────────────────────────────────────
    # Persistence
    # ──────────────────────────────────────────────────────────────

    def save(self, path: str = "dqn_weights.pth"):
        torch.save(self.online_net.state_dict(), path)
        print(f"Agent weights saved → {path}")

    def load(self, path: str = "dqn_weights.pth"):
        self.online_net.load_state_dict(torch.load(path, weights_only=True))
        self.online_net.eval()
        self.target_net.load_state_dict(self.online_net.state_dict())
