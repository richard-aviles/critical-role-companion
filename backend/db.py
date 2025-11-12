from sqlalchemy import create_engine, text, MetaData, Table, Column, Integer, String, Boolean, JSON
from typing import Iterable, Dict, Any
from settings import settings

# Engine with pooling & liveness checks
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,        # drops dead connections automatically
    pool_recycle=1800,         # recycle every 30m (safe default)
)

metadata = MetaData()

# Minimal "characters" table for overlay/admin work
characters = Table(
    "characters",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("name", String(100), nullable=False, index=True),
    Column("on_screen", Boolean, nullable=False, server_default="false"),
    Column("data", JSON, nullable=True),   # flexible blob for AC/HP/etc.
)

def init_db() -> None:
    """Create tables if they don't exist (safe in staging)."""
    metadata.create_all(engine)

def fetch_all_characters() -> Iterable[Dict[str, Any]]:
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT id, name, on_screen, data
            FROM characters
            ORDER BY id ASC
        """)).mappings().all()
        return [dict(r) for r in rows]

def insert_character(name: str, on_screen: bool, data: Dict[str, Any] | None):
    with engine.begin() as conn:
        row = conn.execute(
            text("""
                INSERT INTO characters (name, on_screen, data)
                VALUES (:name, :on_screen, :data)
                RETURNING id, name, on_screen, data
            """),
            {"name": name, "on_screen": on_screen, "data": data},
        ).mappings().one()
        return dict(row)

def set_on_screen(char_id: int, on_screen: bool):
    with engine.begin() as conn:
        row = conn.execute(
            text("""
                UPDATE characters
                SET on_screen = :on_screen
                WHERE id = :id
                RETURNING id, name, on_screen, data
            """),
            {"id": char_id, "on_screen": on_screen},
        ).mappings().one_or_none()
        return dict(row) if row else None
