"""
models.py
---------
SQLAlchemy ORM models — defines the database table schema.
Run `Base.metadata.create_all(bind=engine)` once on startup to create tables.
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String

from database import Base


class SensorReading(Base):
    """
    Represents a single physiological sensor reading from an ESP32 device.
    Mapped to the 'sensor_readings' table in PostgreSQL.
    """

    __tablename__ = "sensor_readings"

    # Primary key — auto-incremented by the database
    id = Column(Integer, primary_key=True, index=True)

    # Identifier of the ESP32 device that sent the data
    device_id = Column(String(64), nullable=False, index=True)

    # ISO 8601 timestamp from the device (stored as UTC)
    timestamp = Column(DateTime(timezone=True), nullable=False)

    # Physiological metrics
    heart_rate = Column(Integer, nullable=False)          # beats per minute
    hrv = Column(Integer, nullable=False)                 # heart rate variability (ms)
    temperature = Column(Float, nullable=False)           # body temperature in °C
    activity_level = Column(Float, nullable=False)        # 0.0 (rest) → 1.0 (intense)
    sleep_state = Column(String(32), nullable=False)      # e.g. "awake", "light", "deep", "rem"

    # Server-side audit timestamp (set automatically on insert)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
