import torch
from data_interface import HealthIndicatorsIn, HealthStateOut
from graph_builder import build_health_graph
from gnn_model import HealthGNN

# Initialize model
# For a live service, we would load weights here: `model.load_state_dict(...)`
# Right now, it's randomly initialized, meaning it outputs deterministic random numbers per user until trained.
model = HealthGNN(in_channels=1, hidden_channels=16, num_outputs=2)
model.eval()

def infer_health_state(indicators: HealthIndicatorsIn) -> HealthStateOut:
    """
    Takes digital twin indicators, converts them to a graph, 
    evaluates using the GNN, and formats the output into standard scores.
    """
    
    # 1. Structure the input into PyTorch Geometric format
    data = build_health_graph(indicators)
    
    # Disable gradient tracking for inference
    with torch.no_grad():
        # 2. Run GNN inference
        # Returns a 1x2 Tensor representing physiological_stability_score and stress_impact_score
        scores = model(data.x, data.edge_index, data.batch).squeeze(0)
    
    # Extract numerical scores (clamped between 0 and 1 via the model's Sigmoid)
    stability_score = scores[0].item()
    stress_impact = scores[1].item()
    
    # Determine hormonal balance heuristically based on those GNN output scores.
    if stability_score > 0.7 and stress_impact < 0.3:
        hormonal_balance = "optimal"
    elif stability_score < 0.4 or stress_impact > 0.7:
        hormonal_balance = "poor"
    else:
        hormonal_balance = "moderate"
        
    return HealthStateOut(
        physiological_stability_score=round(stability_score, 2),
        stress_impact_score=round(stress_impact, 2),
        hormonal_balance_state=hormonal_balance
    )
