"""
config.py
---------
Configuration management for the Digital Hormonal Twin module.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # PostgreSQL connection string
    # E.g., postgresql://pcos_user:pcos_pass@localhost:5432/pcos_health
    DATABASE_URL: str

    APP_NAME: str = "Digital Hormonal Twin"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# Singleton settings instance
settings = Settings()
