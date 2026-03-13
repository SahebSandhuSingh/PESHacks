from pydantic import BaseModel, Field

class HealthIndicatorsIn(BaseModel):
    """
    Input schema defining the physiological indicators received from the Digital Twin.
    """
    stress_index: float = Field(..., description="Normalized stress level (0.0 to 1.0)")
    sleep_stability: float = Field(..., description="Consistency of sleep cycles (0.0 to 1.0)")
    activity_score: float = Field(..., description="Overall daily physical activity (0.0 to 1.0)")
    temperature_cycle_stability: float = Field(..., description="Regularity of temperature rhythms (0.0 to 1.0)")

class HealthStateOut(BaseModel):
    """
    Output schema defining the higher-level physiological states inferred by the GNN model.
    """
    physiological_stability_score: float = Field(..., description="Overall stability of the physiological system (0.0 to 1.0)")
    stress_impact_score: float = Field(..., description="Estimated impact of stress on the body (0.0 to 1.0)")
    hormonal_balance_state: str = Field(..., description="Categorical assessment (e.g., 'low', 'moderate', 'high')")
