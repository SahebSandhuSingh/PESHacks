import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
from torch_geometric.data import Data, DataLoader

from gnn_model import HealthGNN

def load_dataset(csv_path="synthetic_health_data.csv"):
    """
    Loads CSV and converts each row into a PyTorch Geometric Graph containing:
    - 4 Nodes (Stress, Sleep, Activity, Temp)
    - 5 Edges (sleep->stress, activity->stress, etc.)
    - 2 Output Targets (Physiological Stability, Stress Impact)
    """
    df = pd.read_csv(csv_path)
    
    # Same edge structure defined in your project
    source_nodes = [1, 2, 2, 1, 0]
    target_nodes = [0, 0, 3, 3, 3]
    edge_index = torch.tensor([source_nodes, target_nodes], dtype=torch.long)

    graph_dataset = []
    
    for _, row in df.iterrows():
        # Node features order:
        # [0] stress_index
        # [1] sleep_stability
        # [2] activity_score
        # [3] temperature_cycle_stability
        x = torch.tensor([
            [row["stress_index"]],
            [row["sleep_stability"]],
            [row["activity_score"]],
            [row["temperature_cycle_stability"]]
        ], dtype=torch.float)

        # Targets [Physiological Stability, Stress Impact]
        y = torch.tensor([[
            row["physiological_stability_score"], 
            row["stress_impact_score"]
        ]], dtype=torch.float)
        
        data = Data(x=x, edge_index=edge_index, y=y)
        graph_dataset.append(data)
        
    return graph_dataset


def train_model():
    print("Loading dataset...")
    dataset = load_dataset()
    
    # DataLoader handles batching the isolated graphs together into super-graphs 
    # to speed up Neural Network training
    loader = DataLoader(dataset, batch_size=32, shuffle=True)
    
    # Initialize the architecture
    model = HealthGNN(in_channels=1, hidden_channels=16, num_outputs=2)
    model.train()
    
    # Using MSE Loss for numerical prediction and Adam optimizer
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.005)
    
    num_epochs = 30
    
    print(f"Beginning training for {num_epochs} epochs...")
    for epoch in range(num_epochs):
        total_loss = 0
        for batch in loader:
            optimizer.zero_grad()
            
            # Forward pass: Feed the batched graphs to the network
            predictions = model(batch.x, batch.edge_index, batch.batch)
            
            # Compute difference between predicted scores and the objective targets
            loss = criterion(predictions, batch.y)
            
            # Backpropagation (learn)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            
        print(f"Epoch {epoch+1:02d} | Loss: {total_loss / len(loader):.4f}")
        
    print("Training complete! Saving weights to model_weights.pth")
    torch.save(model.state_dict(), "model_weights.pth")


if __name__ == "__main__":
    train_model()
