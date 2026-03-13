from fastapi import FastAPI
from data_interface import HealthIndicatorsIn, HealthStateOut
from inference import infer_health_state

app = FastAPI(
    title="GNN Health Model API",
    description="Analyzes Digital Twin physiogical states through a Graph Neural Network.",
    version="1.0.0"
)

@app.post("/gnn-health-state", response_model=HealthStateOut)
def calculate_health_state(indicators: HealthIndicatorsIn):
    """
    Ingests health indicators from the Digital Hormonal Twin and calculates a high-level 
    physiological state summary using a Graph Neural Network.
    
    The neural network processes:
     - 0 → stress_index
     - 1 → sleep_stability
     - 2 → activity_score
     - 3 → temperature_cycle_stability

    Connections allow the network to evaluate how:
     - sleep & activity directly influence stress
     - activity and sleep/stress heavily dictate metabolic and temperature balance.
    """
    # Simply trigger the inference workflow defined in `inference.py`
    return infer_health_state(indicators)

if __name__ == "__main__":
    import uvicorn
    # Allow simple local execution if ran directly via `python main.py`
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
