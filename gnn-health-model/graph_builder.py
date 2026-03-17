import torch
from torch_geometric.data import Data
from data_interface import HealthIndicatorsIn

def build_health_graph(indicators: HealthIndicatorsIn) -> Data:
    """
    Converts Digital Twin health indicators into a PyTorch Geometric Graph (Data).
    
    Nodes represent health indicators:
    - Node 0: stress_index        - Node 1: sleep_stability
    - Node 2: activity_score      - Node 3: temperature_cycle_stability
    - Node 4: symptom_severity    - Node 5: age_norm
    - Node 6: bmi_norm            - Node 7: amh_norm

    Edges represent known biological relationships:
    - sleep → stress (1→0)       - activity → stress (2→0)
    - activity → temp (2→3)      - sleep → temp (1→3)
    - stress → temp (0→3)        - symptom → stress (4→0)
    - symptom → sleep (4→1)      - bmi → activity (6→2)
    - bmi → symptom (6→4)        - amh → symptom (7→4)
    - amh → stress (7→0)         - age → sleep (5→1)
    - age → temp (5→3)
    
    Args:
        indicators: A Pydantic model containing the 8 indicator values.
        
    Returns:
        A torch_geometric.data.Data object ready for the GNN model.
    """
    # 1. Create the node features matrix (X)
    # Shape: [num_nodes, num_features]. 8 nodes, each with 8 features (full context).
    feat = [
        indicators.stress_index,
        indicators.sleep_stability,
        indicators.activity_score,
        indicators.temperature_cycle_stability,
        indicators.symptom_severity_index,
        indicators.age_norm,
        indicators.bmi_norm,
        indicators.amh_norm,
    ]
    x = torch.tensor([feat]*8, dtype=torch.float)

    # 2. Define the Graph Edges (edge_index) using COO format
    source_nodes = [1, 2, 2, 1, 0, 4, 4, 6, 6, 7, 7, 5, 5]
    target_nodes = [0, 0, 3, 3, 3, 0, 1, 2, 4, 4, 0, 1, 3]
    edge_index = torch.tensor([source_nodes, target_nodes], dtype=torch.long)

    # 3. Create the PyTorch Geometric Data object
    data = Data(x=x, edge_index=edge_index)
    
    # Batch object is required for global pooling over single graphs.
    # Since we are processing one graph at a time for inference, all nodes belong to graph 0.
    data.batch = torch.zeros(8, dtype=torch.long)
    
    return data
