"""
schemas.py
----------
Pydantic models used for request validation and response serialization.
FastAPI uses these to parse incoming JSON and generate OpenAPI docs automatically.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Request schema — what the ESP32 device sends
# ---------------------------------------------------------------------------

VALID_SLEEP_STATES = {"awake", "light", "deep", "rem"}


class SensorDataIn(BaseModel):
    """
    Validates the JSON body of POST /sensor-data.
    All fields are required; extra fields are forbidden to prevent injection.
    """

    device_id: str = Field(
        ...,
        min_length=1,
        max_length=64,
        description="Unique identifier of the ESP32 device (e.g. 'device_001')",
    )
    timestamp: datetime = Field(
        ...,
        description="ISO 8601 UTC timestamp when the reading was taken",
    )
    heart_rate: int = Field(
        ...,
        ge=20,
        le=300,
        description="Heart rate in beats per minute (20–300 bpm)",
    )
    hrv: int = Field(
        ...,
        ge=0,
        le=500,
        description="Heart rate variability in milliseconds (0–500 ms)",
    )
    temperature: float = Field(
        ...,
        ge=30.0,
        le=45.0,
        description="Body temperature in °C (30.0–45.0)",
    )
    activity_level: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Normalised activity level: 0.0 = rest, 1.0 = intense activity",
    )
    sleep_state: str = Field(
        ...,
        description="Sleep state string: 'awake' | 'light' | 'deep' | 'rem'",
    )

    @field_validator("sleep_state")
    @classmethod
    def validate_sleep_state(cls, v: str) -> str:
        v_lower = v.lower().strip()
        if v_lower not in VALID_SLEEP_STATES:
            raise ValueError(
                f"Invalid sleep_state '{v}'. Must be one of: {sorted(VALID_SLEEP_STATES)}"
            )
        return v_lower

    model_config = {"extra": "forbid"}


# ---------------------------------------------------------------------------
# Response schema — what the server returns on success
# ---------------------------------------------------------------------------


class SensorDataOut(BaseModel):
    """
    Returned to the ESP32 device (and any API clients) after a successful write.
    """

    status: str
    message: str
    record_id: int = Field(description="Database ID of the newly stored record")
