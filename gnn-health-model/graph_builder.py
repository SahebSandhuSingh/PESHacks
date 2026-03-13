import torch
from torch_geometric.data import Data
from data_interface import HealthIndicatorsIn

def build_health_graph(indicators: HealthIndicatorsIn) -> Data:
    """
    Converts Digital Twin health indicators into a PyTorch Geometric Graph (Data).
    
    Nodes represent physiological indicators:
    - Node 0: stress_index
    - Node 1: sleep_stability
    - Node 2: activity_score
    - Node 3: temperature_cycle_stability

    Edges represent known biological relationships between indicators:
    - sleep → stress (1 → 0)
    - activity → stress (2 → 0)
    - activity → temperature cycle stability (representing metabolic balance) (2 → 3)
    - sleep → temperature rhythm (1 → 3)
    - stress → temperature rhythm (0 → 3)
    
    Args:
        indicators: A Pydantic model containing the 4 indicator values.
        
    Returns:
        A torch_geometric.data.Data object ready for the GNN model.
    """
    # 1. Create the node features matrix (X)
    # Shape: [num_nodes, num_features]. We have 4 nodes, each with 1 scalar feature.
    x = torch.tensor([
        [indicators.stress_index],
        [indicators.sleep_stability],
        [indicators.activity_score],
        [indicators.temperature_cycle_stability],
    ], dtype=torch.float)

    # 2. Define the Graph Edges (edge_index) using COO format
    # Shape: [2, num_edges]
    # Relationships: [(1,0), (2,0), (2,3), (1,3), (0,3)]
    source_nodes = [1, 2, 2, 1, 0]
    target_nodes = [0, 0, 3, 3, 3]
    edge_index = torch.tensor([source_nodes, target_nodes], dtype=torch.long)

    # 3. Create the PyTorch Geometric Data object
    data = Data(x=x, edge_index=edge_index)
    
    # Batch object is required for global pooling over single graphs.
    # Since we are processing one graph at a time for inference, all nodes belong to graph 0.
    data.batch = torch.zeros(x.size(0), dtype=torch.long)
    
    return data
