from pydantic import BaseModel, Field


class HealthState(BaseModel):
    """
    Incoming request: the patient's current Digital Twin physiological state.
    All values are normalised floats in [0.0, 1.0].
    """
    stress_index: float = Field(..., ge=0.0, le=1.0, description="Current stress level (0=none, 1=extreme)")
    sleep_stability: float = Field(..., ge=0.0, le=1.0, description="Sleep quality and consistency (0=poor, 1=excellent)")
    activity_score: float = Field(..., ge=0.0, le=1.0, description="Physical activity level (0=sedentary, 1=very active)")
    temperature_cycle_stability: float = Field(..., ge=0.0, le=1.0, description="Circadian temperature rhythm stability (0=disrupted, 1=stable)")


class RecommendationResponse(BaseModel):
    """
    Outgoing response: the RL agent's best recommended intervention
    after simulating all actions on the Digital Twin.
    """
    recommended_action: str = Field(..., description="Name of the recommended lifestyle intervention")
    patient_message: str = Field(..., description="A clear, structured message explaining the recommendation to the patient")
    expected_improvement: float = Field(..., description="Predicted improvement in physiological stability score")
    confidence: float = Field(..., description="Agent's confidence in this recommendation (0-1)")
    simulated_next_state: dict = Field(..., description="Predicted physiological state after applying the action")
    all_action_q_values: dict = Field(..., description="Q-values for every possible action (for transparency)")
