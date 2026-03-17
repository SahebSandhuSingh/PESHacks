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
import httpx
import asyncio

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

import crud
from config import settings
from database import Base, engine, get_db
from schemas import SensorDataIn, SensorDataOut, QuestionnaireDataIn

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


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


async def run_ai_pipeline(device_id: str):
    """
    Background worker that queries the Twin, GNN, and RL Agent 
    using the newly ingested data.
    """
    logger.info("Starting AI Pipeline for device: %s", device_id)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # 1. Ask Digital Twin for baseline deviations
            twin_url = f"http://127.0.0.1:8001/health-state/{device_id}"
            twin_res = await client.get(twin_url)
            if twin_res.status_code != 200:
                logger.error("Twin failed: %s", twin_res.text)
                return None
            
            twin_data = twin_res.json()
            logger.info("[PIPELINE STEP 1] Twin Data Computed: %s", twin_data['overall_hormonal_balance'])

            # 2. Build payloads for downstream models
            #    GNN needs all 8 indicators (physio + patient profile)
            gnn_payload = {
                "stress_index": twin_data["stress_index"],
                "sleep_stability": twin_data["sleep_stability"],
                "activity_score": twin_data["activity_score"],
                "temperature_cycle_stability": twin_data["temperature_cycle_stability"],
                "symptom_severity_index": twin_data["symptom_severity_index"],
                "age_norm": twin_data.get("age_norm", 0.0),
                "bmi_norm": twin_data.get("bmi_norm", 0.0),
                "amh_norm": twin_data.get("amh_norm", 0.0),
            }

            #    RL agent only needs the 5 modifiable physiological state variables
            rl_payload = {
                "stress_index": twin_data["stress_index"],
                "sleep_stability": twin_data["sleep_stability"],
                "activity_score": twin_data["activity_score"],
                "temperature_cycle_stability": twin_data["temperature_cycle_stability"],
                "symptom_severity_index": twin_data["symptom_severity_index"],
            }

            # GNN Call
            gnn_res = await client.post("http://127.0.0.1:8002/gnn-health-state", json=gnn_payload)
            gnn_data = None
            if gnn_res.status_code == 200:
                gnn_data = gnn_res.json()
                logger.info("[PIPELINE STEP 2] GNN State: score=%s, impact=%s", 
                            gnn_data.get("physiological_stability_score"), 
                            gnn_data.get("stress_impact_score"))
            
            # RL Agent Call
            rl_res = await client.post("http://127.0.0.1:8003/recommendation", json=rl_payload)
            rl_data = None
            if rl_res.status_code == 200:
                rl_data = rl_res.json()
                logger.info("[PIPELINE STEP 3] RL Agent recommends: %s (confidence: %s)", 
                            rl_data.get("recommended_action"), 
                            rl_data.get("confidence"))
                logger.info("RL Message to Patient: %s", rl_data.get("patient_message", "").replace("\n", " "))
            
            return {
                "twin": twin_data,
                "gnn": gnn_data,
                "rl": rl_data
            }
    except Exception as e:
        logger.error("AI Pipeline failed: %s", str(e))
        return None


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

@app.get(
    "/latest/{device_id}",
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
async def get_latest_sensor_data(
    device_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieves the most recent sensor reading for the given device
    and synchronously runs the AI dashboard pipeline.
    """
    from models import SensorReading
    
    # 1. Fetch latest DB row
    record = (
        db.query(SensorReading)
        .filter(SensorReading.device_id == device_id)
        .order_by(SensorReading.timestamp.desc())
        .first()
    )
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No sensor data found for device: {device_id}",
        )
        
    # 2. Run the AI models
    ai_data = await run_ai_pipeline(device_id)
    
    # 3. Combine into one payload for React
    return {
        "sensor_data": {
            "dht22_temp": record.dht22_temp,
            "dht22_humidity": record.dht22_humidity,
            "ds18b20_temp": record.ds18b20_temp,
            "heart_rate": record.heart_rate,
            "spo2": record.spo2,
            "accel_x": record.accel_x,
            "accel_y": record.accel_y,
            "accel_z": record.accel_z,
            "gyro_x": record.gyro_x,
            "gyro_y": record.gyro_y,
            "gyro_z": record.gyro_z,
            "mpu_temp": record.mpu_temp,
            "timestamp": record.timestamp,
        },
        "ai_predictions": ai_data
    }


@app.post(
    "/sensor-data",
    response_model=SensorDataOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Sensor Data"],
    summary="Ingest sensor reading from an ESP32 device",
)
def receive_sensor_data(
    payload: SensorDataIn,
    background_tasks: BackgroundTasks,
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

    # Trigger the AI pipeline in the background so the ESP32 doesn't wait
    background_tasks.add_task(run_ai_pipeline, payload.device_id)

    return SensorDataOut(
        status="success",
        message="sensor data stored",
        record_id=record.id,
    )

@app.post(
    "/questionnaire",
    response_model=SensorDataOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Questionnaire Data"],
    summary="Ingest subjective questionnaire data from the user dashboard",
)
def receive_questionnaire_data(
    payload: QuestionnaireDataIn,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> SensorDataOut:
    """
    Accepts questionnaire data from the user and stores it in the database.
    """
    logger.info(
        "Received questionnaire data | device_id=%s | timestamp=%s",
        payload.device_id,
        payload.timestamp,
    )

    try:
        record = crud.create_questionnaire_reading(db=db, data=payload)
    except SQLAlchemyError as exc:
        db.rollback()
        logger.error("Database error while storing questionnaire data: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to store questionnaire data.",
        ) from exc

    logger.info("Questionnaire data stored successfully | record_id=%d", record.id)

    # Trigger the AI pipeline in the background to update predictions
    background_tasks.add_task(run_ai_pipeline, payload.device_id)

    return SensorDataOut(
        status="success",
        message="questionnaire data stored",
        record_id=record.id,
    )
