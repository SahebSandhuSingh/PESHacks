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

from typing import Optional

class SensorDataIn(BaseModel):
    """
    Validates the JSON body of POST /sensor-data.
    All fields are required; extra fields are forbidden to prevent injection.
    """

    device_id: Optional[str] = Field(
        default="unknown_device",
        max_length=64,
        description="Unique identifier of the ESP32 device (optional)",
    )
    timestamp: int = Field(
        ...,
        description="Milliseconds since boot from the ESP32",
    )
    dht22_temp: Optional[float] = Field(None, alias="ambient_temp", description="Ambient air temperature in °C")
    dht22_humidity: Optional[float] = Field(None, alias="humidity", description="Relative humidity in %")
    ds18b20_temp: Optional[float] = Field(None, alias="body_temp", description="Precise body/surface temperature in °C")
    heart_rate: Optional[float] = Field(None, description="Heart rate in bpm")
    spo2: Optional[float] = Field(None, description="Blood oxygen percentage")
    
    accel_x: Optional[float] = Field(None, description="Acceleration X axis (g)")
    accel_y: Optional[float] = Field(None, description="Acceleration Y axis (g)")
    accel_z: Optional[float] = Field(None, description="Acceleration Z axis (g)")
    
    gyro_x: Optional[float] = Field(None, description="Angular rotation X (°/s)")
    gyro_y: Optional[float] = Field(None, description="Angular rotation Y (°/s)")
    gyro_z: Optional[float] = Field(None, description="Angular rotation Z (°/s)")
    
    mpu_temp: Optional[float] = Field(None, description="Internal chip temperature °C")

    # Allow population by alias (Arduino keys) or field name (internal keys)
    model_config = {
        "populate_by_name": True,
        "extra": "ignore"  # Don't crash if Arduino sends extra fields
    }


# ---------------------------------------------------------------------------
# Response schema — what the server returns on success
# ---------------------------------------------------------------------------

class QuestionnaireDataIn(BaseModel):
    """
    Validates the JSON body of POST /questionnaire.
    """
    device_id: str = Field(
        ...,
        max_length=64,
        description="Unique identifier of the user/device",
    )
    timestamp: int = Field(
        ...,
        description="Milliseconds since epoch",
    )
    perceived_stress: Optional[int] = Field(None, ge=1, le=10, description="1-10")
    mood_score: Optional[int] = Field(None, ge=1, le=10, description="1-10")
    pain_level: Optional[int] = Field(None, ge=1, le=10, description="1-10")
    flow_heaviness: Optional[Literal["none", "light", "medium", "heavy"]] = Field(None, description="Flow heaviness")
    age: Optional[float] = Field(None, description="Patient age in years")
    weight_kg: Optional[float] = Field(None, description="Weight in kilograms")
    height_cm: Optional[float] = Field(None, description="Height in centimeters")
    bmi: Optional[float] = Field(None, description="Body Mass Index")
    amh: Optional[float] = Field(None, description="Anti-Müllerian Hormone in ng/mL")




class SensorDataOut(BaseModel):
    """
    Returned to the ESP32 device (and any API clients) after a successful write.
    """

    status: str
    message: str
    record_id: int = Field(description="Database ID of the newly stored record")
