import torch
import torch.nn as nn


class DQNNetwork(nn.Module):
    """
    Deep Q-Network (DQN) for the RL health recommendation agent.

    Architecture:
        Input  : health state vector [stress, sleep, activity, temp, symptom] → size 5
        Hidden : two fully-connected layers of 64 neurons each (ReLU)
        Output : Q-value for each possible action → size = num_actions

    The network learns to map a physiological state to Q-values,
    where Q(state, action) estimates the expected cumulative reward
    of taking that action from that state.
    """

    def __init__(self, state_dim: int = 5, num_actions: int = 5, hidden_dim: int = 64):
        super(DQNNetwork, self).__init__()

        self.network = nn.Sequential(
            # Layer 1: state features → hidden representations
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),

            # Layer 2: deeper feature mixing
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),

            # Output: one Q-value per action
            nn.Linear(hidden_dim, num_actions)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: state tensor of shape [batch_size, state_dim]
        Returns:
            Q-values of shape [batch_size, num_actions]
        """
        return self.network(x)
