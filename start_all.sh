#!/bin/bash

echo "Starting all PESHacks Backend Services..."

# 1. Main Server (Accepts the raw Arduino values)
echo "Starting pcos-health-server on port 8000..."
cd /Users/sahebsandhu/PESHacks/pcos-health-server && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &

# 2. Digital Hormonal Twin
echo "Starting digital-hormonal-twin on port 8001..."
cd /Users/sahebsandhu/PESHacks/digital-hormonal-twin && python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload &

# 3. GNN Health Model
echo "Starting gnn-health-model on port 8002..."
cd /Users/sahebsandhu/PESHacks/gnn-health-model && python3 -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload &

# 4. Digital Twin RL Agent
echo "Starting digital-twin-rl-agent on port 8003..."
cd /Users/sahebsandhu/PESHacks/digital-twin-rl-agent && python3 -m uvicorn main:app --host 0.0.0.0 --port 8003 --reload &

echo "All services are running in the background."
echo "Press Ctrl+C to stop all services."

# Wait for all background processes to finish
wait
