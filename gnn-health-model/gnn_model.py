import torch
import torch.nn as nn
from torch_geometric.nn import GCNConv, global_mean_pool


class HealthGNN(nn.Module):
    """
    HealthGNN v3 — High accuracy variant:
    - 5 input features per node (all indicators shared as context)
    - 3 GCN layers with 64 hidden channels
    - BatchNorm + Dropout for regularisation
    - Deep MLP head: 64 -> 32 -> num_outputs
    """
    def __init__(self, in_channels: int = 5, hidden_channels: int = 64, num_outputs: int = 2):
        super(HealthGNN, self).__init__()

        self.conv1 = GCNConv(in_channels, hidden_channels)
        self.bn1   = nn.BatchNorm1d(hidden_channels)

        self.conv2 = GCNConv(hidden_channels, hidden_channels)
        self.bn2   = nn.BatchNorm1d(hidden_channels)

        self.conv3 = GCNConv(hidden_channels, hidden_channels)
        self.bn3   = nn.BatchNorm1d(hidden_channels)

        self.dropout = nn.Dropout(p=0.15)

        self.fc1 = nn.Linear(hidden_channels, 32)
        self.fc2 = nn.Linear(32, num_outputs)

    def forward(self, x, edge_index, batch):
        x = self.conv1(x, edge_index)
        x = self.bn1(x)
        x = torch.relu(x)

        x = self.conv2(x, edge_index)
        x = self.bn2(x)
        x = torch.relu(x)

        x = self.conv3(x, edge_index)
        x = self.bn3(x)
        x = torch.relu(x)

        x = global_mean_pool(x, batch)

        x = self.dropout(x)
        x = torch.relu(self.fc1(x))
        x = torch.sigmoid(self.fc2(x))

        return x
