"""
Digital Twin RL Agent — FastAPI Service
=======================================
POST /recommendation  →  Runs the RL agent against the Digital Twin
                          and returns the best health intervention.

Run with:
    uvicorn main:app --reload
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import HealthState, RecommendationResponse
from inference import load_agent, get_recommendation

# ── Shared agent instance (loaded once at startup) ──────────────────────────
_agent = None
WEIGHTS_PATH = "dqn_weights.pth"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the trained DQN agent into memory when the server starts."""
    global _agent

    if not os.path.exists(WEIGHTS_PATH):
        raise RuntimeError(
            f"Model weights not found at '{WEIGHTS_PATH}'. "
            "Run `python3 train.py` first to train the agent."
        )

    print(f"Loading DQN agent from {WEIGHTS_PATH}...")
    _agent = load_agent(WEIGHTS_PATH)
    print("RL Agent ready.")
    yield
    # (cleanup on shutdown if needed)


# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Digital Twin RL Agent",
    description=(
        "A Reinforcement Learning agent that experiments on a patient's "
        "Digital Twin and recommends the best lifestyle intervention."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {
        "service": "Digital Twin RL Agent",
        "status":  "running",
        "endpoints": {
            "POST /recommendation": "Get RL-driven health recommendation",
        },
    }


@app.post(
    "/recommendation",
    response_model=RecommendationResponse,
    summary="Get best health recommendation from the RL agent",
    tags=["Recommendation"],
)
def recommend(state: HealthState):
    """
    The RL agent:
    1. Receives the patient's current Digital Twin health state.
    2. Simulates all 5 possible lifestyle interventions on the Digital Twin.
    3. Uses its trained DQN to pick the action with the highest Q-value.
    4. Returns the recommended action, predicted improvement, and confidence.
    """
    if _agent is None:
        raise HTTPException(status_code=503, detail="RL agent not loaded.")

    state_vec = [
        state.stress_index,
        state.sleep_stability,
        state.activity_score,
        state.temperature_cycle_stability,
    ]

    result = get_recommendation(state_vec, _agent)
    return RecommendationResponse(**result)
