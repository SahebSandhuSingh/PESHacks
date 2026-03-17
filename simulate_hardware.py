import time
import requests
import random
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

API_URL = "http://127.0.0.1:8000/sensor-data"
DEVICE_ID = "unknown_device"

def generate_sensor_data():
    """Generates realistic, fluctuating sensor data."""
    return {
        "device_id": DEVICE_ID,
        "timestamp": int(time.time() * 1000),
        "ambient_temp": round(random.uniform(22.0, 26.0), 2),
        "humidity": round(random.uniform(40.0, 60.0), 2),
        "body_temp": round(random.uniform(36.1, 37.2), 2),
        "heart_rate": round(random.uniform(65.0, 85.0), 2),
        "spo2": round(random.uniform(97.0, 99.0), 2),
        "accel_x": round(random.uniform(-0.1, 0.1), 3),
        "accel_y": round(random.uniform(-0.1, 0.1), 3),
        "accel_z": round(random.uniform(0.9, 1.1), 3),
        "gyro_x": round(random.uniform(-1.0, 1.0), 2),
        "gyro_y": round(random.uniform(-1.0, 1.0), 2),
        "gyro_z": round(random.uniform(-1.0, 1.0), 2),
        "mpu_temp": round(random.uniform(30.0, 35.0), 2)
    }

def run_simulation():
    """Sends simulated data to the backend indefinitely."""
    logger.info(f"Starting hardware simulation for {DEVICE_ID}...")
    logger.info(f"Targeting: {API_URL}")
    
    while True:
        try:
            data = generate_sensor_data()
            response = requests.post(API_URL, json=data, timeout=5)
            
            if response.status_code == 201:
                logger.info(f"Sent success: HR={data['heart_rate']}, SpO2={data['spo2']}, Temp={data['body_temp']}")
            else:
                logger.error(f"Failed to send data: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.error(f"Error connecting to backend: {e}")
            
        time.sleep(5)  # Send data every 5 seconds

if __name__ == "__main__":
    run_simulation()
