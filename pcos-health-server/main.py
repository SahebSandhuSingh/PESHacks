"""
main.py
-------
FastAPI application entry point.

How to run the server:
    1. Install dependencies:
           pip install -r requirements.txt

    2. Set up your .env file (copy the template below into a file called .env):
           DATABASE_URL=postgresql://postgres:password@localhost:5432/pcos_health

    3. Start the server with hot-reload:
           uvicorn main:app --reload

    4. The API will be available at:
           http://127.0.0.1:8000
       Interactive docs (Swagger UI):
           http://127.0.0.1:8000/docs
       OpenAPI schema:
           http://127.0.0.1:8000/openapi.json
"""

import logging

from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

import crud
from config import settings
from database import Base, engine, get_db
from schemas import SensorDataIn, SensorDataOut

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App initialisation
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Backend service that receives physiological sensor data from ESP32 "
        "wearable devices and stores it in PostgreSQL for PCOS health monitoring."
    ),
)


@app.on_event("startup")
def on_startup() -> None:
    """
    Create all database tables on first run (if they don't exist yet).
    This is equivalent to running Alembic migrations for initial setup.
    """
    logger.info("Creating database tables (if not already present)…")
    Base.metadata.create_all(bind=engine)
    logger.info("Database ready.")


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Health"])
def health_check():
    """Simple liveness probe — confirms the server is running."""
    return {"status": "ok", "service": settings.APP_NAME}


# ---------------------------------------------------------------------------
# Sensor data endpoint
# ---------------------------------------------------------------------------

@app.post(
    "/sensor-data",
    response_model=SensorDataOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Sensor Data"],
    summary="Ingest sensor reading from an ESP32 device",
)
def receive_sensor_data(
    payload: SensorDataIn,
    db: Session = Depends(get_db),
) -> SensorDataOut:
    """
    Accepts a JSON payload from an ESP32 wearable device, validates all fields,
    persists the record to PostgreSQL, and returns a confirmation response.

    **Example request body:**
    ```json
    {
      "timestamp": 126769,
      "dht22_temp": 29.5,
      "dht22_humidity": 46.7,
      "ds18b20_temp": 29.25,
      "heart_rate": 86.9,
      "spo2": 97,
      "accel_x": -0.443,
      "accel_y": 0.826,
      "accel_z": 0.472,
      "gyro_x": 4.73,
      "gyro_y": -6.99,
      "gyro_z": -1.95,
      "mpu_temp": 44.9
    }
    ```
    """
    logger.info(
        "Received sensor data | device_id=%s | timestamp=%s",
        payload.device_id,
        payload.timestamp,
    )

    try:
        record = crud.create_sensor_reading(db=db, data=payload)
    except SQLAlchemyError as exc:
        # Roll back the transaction so the session remains usable
        db.rollback()
        logger.error("Database error while storing sensor data: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to store sensor data. Please try again later.",
        ) from exc

    logger.info("Sensor data stored successfully | record_id=%d", record.id)

    return SensorDataOut(
        status="success",
        message="sensor data stored",
        record_id=record.id,
    )
