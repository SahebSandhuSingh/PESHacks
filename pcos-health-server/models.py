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

    # Identifier of the ESP32 device that sent the data (optional now)
    device_id = Column(String(64), nullable=True, index=True)

    # Milliseconds since boot from the ESP32
    timestamp = Column(Integer, nullable=False)

    # Sensor readings
    dht22_temp = Column(Float, nullable=True)             # Ambient air temperature °C
    dht22_humidity = Column(Float, nullable=True)         # Relative humidity %
    ds18b20_temp = Column(Float, nullable=True)           # Precise body temperature °C
    
    heart_rate = Column(Float, nullable=True)             # Heart rate (bpm)
    spo2 = Column(Integer, nullable=True)                 # Blood oxygen %
    
    accel_x = Column(Float, nullable=True)                # Acceleration X (g)
    accel_y = Column(Float, nullable=True)                # Acceleration Y (g)
    accel_z = Column(Float, nullable=True)                # Acceleration Z (g)
    
    gyro_x = Column(Float, nullable=True)                 # Angular rotation X (°/s)
    gyro_y = Column(Float, nullable=True)                 # Angular rotation Y (°/s)
    gyro_z = Column(Float, nullable=True)                 # Angular rotation Z (°/s)
    
    mpu_temp = Column(Float, nullable=True)               # Internal chip temperature °C

    # Server-side audit timestamp (set automatically on insert)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
