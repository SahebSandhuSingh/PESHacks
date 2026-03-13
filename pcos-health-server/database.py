"""
database.py
-----------
Sets up the SQLAlchemy engine and session factory.
All other modules import `SessionLocal` and `Base` from here.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config import settings

# Create the SQLAlchemy engine using the connection URL from settings
engine = create_engine(
    settings.DATABASE_URL,
    # pool_pre_ping checks the connection before using it (handles dropped connections)
    pool_pre_ping=True,
)

# SessionLocal: each request gets its own database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a database session per request.
    Ensures the session is always closed after the request finishes.

    Usage in endpoint:
        db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
