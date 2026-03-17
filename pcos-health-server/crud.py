"""
crud.py
-------
Database CRUD (Create, Read, Update, Delete) operations.
Keeps all database interaction logic separate from the API layer (main.py).
"""

from sqlalchemy.orm import Session

from models import SensorReading
from schemas import SensorDataIn


def create_sensor_reading(db: Session, data: SensorDataIn) -> SensorReading:
    """
    Persist a validated sensor reading to the database.

    Args:
        db:   Active SQLAlchemy session (provided by FastAPI's Depends).
        data: Validated Pydantic model from the request body.

    Returns:
        The newly created SensorReading ORM instance (with id populated).
    """
    # Map the Pydantic schema fields to the ORM model
    db_record = SensorReading(
        device_id=data.device_id,
        timestamp=data.timestamp,
        dht22_temp=data.dht22_temp,
        dht22_humidity=data.dht22_humidity,
        ds18b20_temp=data.ds18b20_temp,
        heart_rate=data.heart_rate,
        spo2=data.spo2,
        accel_x=data.accel_x,
        accel_y=data.accel_y,
        accel_z=data.accel_z,
        gyro_x=data.gyro_x,
        gyro_y=data.gyro_y,
        gyro_z=data.gyro_z,
        mpu_temp=data.mpu_temp,
    )

    db.add(db_record)       # stage the INSERT
    db.commit()             # execute and commit the transaction
    db.refresh(db_record)   # reload from DB to populate auto-generated fields (id, created_at)

    return db_record

def create_questionnaire_reading(db: Session, data: "schemas.QuestionnaireDataIn") -> SensorReading:
    """
    Persist validated questionnaire answers to the database as a new reading.
    """
    db_record = SensorReading(
        device_id=data.device_id,
        timestamp=data.timestamp,
        perceived_stress=data.perceived_stress,
        mood_score=data.mood_score,
        pain_level=data.pain_level,
        flow_heaviness=data.flow_heaviness,
        age=data.age,
        weight_kg=data.weight_kg,
        height_cm=data.height_cm,
        bmi=data.bmi,
        amh=data.amh,
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return db_record
