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
        heart_rate=data.heart_rate,
        hrv=data.hrv,
        temperature=data.temperature,
        activity_level=data.activity_level,
        sleep_state=data.sleep_state,
    )

    db.add(db_record)       # stage the INSERT
    db.commit()             # execute and commit the transaction
    db.refresh(db_record)   # reload from DB to populate auto-generated fields (id, created_at)

    return db_record
