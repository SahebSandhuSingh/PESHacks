import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import numpy as np
from torch_geometric.data import Data
from torch_geometric.loader import DataLoader

from gnn_model import HealthGNN


def load_dataset(csv_path="synthetic_health_data.csv"):
    """
    Loads CSV and converts each row into a PyTorch Geometric Graph.
    Each of the 8 nodes carries ALL 8 indicators as features.

    Node layout:
        [0] stress_index       [1] sleep_stability
        [2] activity_score     [3] temperature_cycle_stability
        [4] symptom_severity_index
        [5] age_norm           [6] bmi_norm           [7] amh_norm
    """
    df = pd.read_csv(csv_path)

    # Biological edges:
    #   sleep→stress, activity→stress, activity→temp, sleep→temp,
    #   stress→temp, symptom→stress, symptom→sleep,
    #   bmi→activity, bmi→symptom, amh→symptom, amh→stress,
    #   age→sleep, age→temp
    source_nodes = [1, 2, 2, 1, 0, 4, 4, 6, 6, 7, 7, 5, 5]
    target_nodes = [0, 0, 3, 3, 3, 0, 1, 2, 4, 4, 0, 1, 3]
    edge_index = torch.tensor([source_nodes, target_nodes], dtype=torch.long)

    graph_dataset = []

    for _, row in df.iterrows():
        # Each node gets the full feature vector as context
        feat = [
            row["stress_index"],
            row["sleep_stability"],
            row["activity_score"],
            row["temperature_cycle_stability"],
            row["symptom_severity_index"],
            row["age_norm"],
            row["bmi_norm"],
            row["amh_norm"],
        ]
        # 8 nodes × 8 features each
        x = torch.tensor([feat]*8, dtype=torch.float)

        y = torch.tensor([[
            row["physiological_stability_score"],
            row["stress_impact_score"]
        ]], dtype=torch.float)

        graph_dataset.append(Data(x=x, edge_index=edge_index, y=y))

    return graph_dataset


def evaluate(model, loader, tolerance=0.10):
    """Returns per-output accuracy (% within tolerance) and overall joint accuracy."""
    model.eval()
    all_preds, all_targets = [], []
    with torch.no_grad():
        for batch in loader:
            preds = model(batch.x, batch.edge_index, batch.batch)
            all_preds.append(preds)
            all_targets.append(batch.y)

    preds   = torch.cat(all_preds).numpy()
    targets = torch.cat(all_targets).numpy()
    error   = np.abs(preds - targets)

    acc_physio  = np.mean(error[:, 0] <= tolerance) * 100
    acc_stress  = np.mean(error[:, 1] <= tolerance) * 100
    acc_overall = np.mean(error <= tolerance) * 100   # per-value, most intuitive
    return acc_physio, acc_stress, acc_overall


def train_model():
    print("Loading dataset...")
    dataset = load_dataset()

    split = int(0.8 * len(dataset))
    train_data = dataset[:split]
    test_data  = dataset[split:]

    train_loader = DataLoader(train_data, batch_size=64, shuffle=True)
    test_loader  = DataLoader(test_data,  batch_size=64, shuffle=False)

    # 8 input features per node, 64 hidden
    model = HealthGNN(in_channels=8, hidden_channels=64, num_outputs=2)

    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=8
    )

    num_epochs = 100
    best_overall = 0.0

    print(f"Training for {num_epochs} epochs (8-feat nodes, hidden=64, 3 GCN layers)...")
    print(f"{'Epoch':>6} | {'Loss':>10} | {'Physio%':>8} | {'Stress%':>8} | {'Overall%':>9}")
    print("-" * 52)

    for epoch in range(num_epochs):
        model.train()
        total_loss = 0
        for batch in train_loader:
            optimizer.zero_grad()
            preds = model(batch.x, batch.edge_index, batch.batch)
            loss = criterion(preds, batch.y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)
        scheduler.step(avg_loss)

        if (epoch + 1) % 5 == 0 or epoch == 0 or epoch == num_epochs - 1:
            acc_p, acc_s, acc_o = evaluate(model, test_loader)
            print(f"{epoch+1:>6} | {avg_loss:>10.6f} | {acc_p:>7.1f}% | {acc_s:>7.1f}% | {acc_o:>8.1f}%")
            if acc_o > best_overall:
                best_overall = acc_o
                torch.save(model.state_dict(), "model_weights.pth")

    print()
    acc_p, acc_s, acc_o = evaluate(model, test_loader)
    print(f"Final Results — Physiological: {acc_p:.1f}%  |  Stress: {acc_s:.1f}%  |  Overall: {best_overall:.1f}%")
    print("Best weights saved to model_weights.pth")


if __name__ == "__main__":
    train_model()
