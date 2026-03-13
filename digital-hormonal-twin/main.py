"""
main.py
-------
FastAPI entrypoint for the Digital Hormonal Twin module.
Exposes a GET endpoint to retrieve the current health state for a device.

Run with:
    uvicorn main:app --reload
"""

import logging

from fastapi import FastAPI, HTTPException

from data_loader import load_sensor_data
from preprocessing import preprocess_data
from twin_model import compute_baseline_and_current_state
from health_state import build_health_state_response
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Analyzes physiological sensor data to learn personalized baseline models and provide hormonal health states.",
)


@app.get("/health", tags=["Health"])
def system_health_check():
    return {"status": "ok", "service": settings.APP_NAME}


@app.get(
    "/health-state/{device_id}",
    tags=["Digital Twin"],
    summary="Compute and return the current health state for a user's device",
)
def get_health_state(device_id: str):
    """
    1. Loads the recent historical sensor data for the specified device.
    2. Preprocesses the time-series data.
    3. Runs the Digital Twin logic to compute the personal baseline deviations.
    4. Generates and returns a comprehensive health state vector.
    """
    logger.info("Computing standard health state for device: %s", device_id)
    
    try:
        # Step 1: Load Raw Data
        raw_df = load_sensor_data(device_id=device_id, limit=2000)
        
        if raw_df.empty:
            raise HTTPException(
                status_code=404, 
                detail=f"No sensor data found for device '{device_id}'. Cannot compute health state."
            )

        # Step 2: Clean and Preprocess
        clean_df = preprocess_data(raw_df)

        # Step 3: Compute Model Baseline Indicators
        current_state_vector = compute_baseline_and_current_state(clean_df)

        # Step 4: Build Structured Output
        response_payload = build_health_state_response(device_id, current_state_vector)

        logger.info("Health state computed successfully for \%s: \%s", device_id, response_payload["overall_hormonal_balance"])
        return response_payload

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error processing health state for %s: %s", device_id, str(e))
        raise HTTPException(
            status_code=500,
            detail="An internal error occurred while processing the digital twin data."
        )
