"""
Database configuration and session management
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
import os
from dotenv import load_dotenv
from models import Base

# Load .env file
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("ENV") == "development",  # Log SQL in dev mode
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,
    max_overflow=10,
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """
    Create all tables in the database
    Call this on app startup
    """
    Base.metadata.create_all(bind=engine)


def get_db() -> Session:
    """
    Dependency for FastAPI routes to get database session
    Usage: def my_route(db: Session = Depends(get_db)):
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    """
    Context manager for getting a database session
    Usage: with get_db_context() as db:
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
