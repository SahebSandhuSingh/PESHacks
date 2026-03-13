"""
config.py
---------
Application configuration via environment variables.
Copy .env.example to .env and fill in values before running.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # PostgreSQL connection string
    # Format: postgresql://user:password@host:port/dbname
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/pcos_health"

    # Application metadata
    APP_NAME: str = "PCOS Health Server"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# Singleton settings instance used throughout the app
settings = Settings()
