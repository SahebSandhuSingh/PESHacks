import torch
import torch.nn as nn
from torch_geometric.nn import GCNConv, global_mean_pool

class HealthGNN(nn.Module):
    """
    A Graph Neural Network used to predict overall health and physiological 
    stability based on interacting metrics from a Digital Twin.

    Requirements:
    1. Node features come from digital twin output (1 feature per node initially).
    2. Uses 2 graph convolution layers (GCNConv).
    3. Global pooling to produce a graph-level representation.
    4. Output: specific physiological scores.
    """
    def __init__(self, in_channels: int = 1, hidden_channels: int = 16, num_outputs: int = 2):
        super(HealthGNN, self).__init__()
        
        # 2 Graph Convolutional layers
        self.conv1 = GCNConv(in_channels, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, hidden_channels)
        
        # Linear layer for final regression to physiological outputs
        self.fc = nn.Linear(hidden_channels, num_outputs)

    def forward(self, x, edge_index, batch):
        """
        Forward pass for the model.
        Args:
            x (Tensor): Node features matrix (e.g. [4, 1] for 4 indicators)
            edge_index (Tensor): Graph connectivity (COO format)
            batch (Tensor): Assigns nodes to specific graphs, required for pooling
        Returns:
            Tensor: Predicted physiological scores [batch_size, num_outputs]
        """
        
        # First GCN Layer + ReLU Activation
        x = self.conv1(x, edge_index)
        x = torch.relu(x)
        
        # Second GCN Layer + ReLU Activation
        x = self.conv2(x, edge_index)
        x = torch.relu(x)
        
        # Global mean pool across the nodes in the graph to get a single graph vector
        x = global_mean_pool(x, batch)
        
        # Linear layer combining features into 2 score outputs
        # We apply sigmoid to bound values between 0.0 and 1.0
        x = self.fc(x)
        output_scores = torch.sigmoid(x)
        
        return output_scores
