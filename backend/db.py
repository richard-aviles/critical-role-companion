from typing import Iterable, Dict, Any, Optional

from sqlalchemy import (
    create_engine, MetaData, Table, Column,
    Integer, String, Boolean, select, update, insert
)
from sqlalchemy import text as sqltext
from sqlalchemy.dialects.postgresql import JSONB
from settings import settings

# Engine with pooling & health checks
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=1800,
)

metadata = MetaData()

characters = Table(
    "characters",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("name", String(100), nullable=False, index=True),
    Column("on_screen", Boolean, nullable=False, server_default=sqltext("false")),
    Column("data", JSONB, nullable=True),  # JSONB plays nicest on Postgres/Neon
)

def init_db() -> None:
    metadata.create_all(engine)

def fetch_all_characters() -> Iterable[Dict[str, Any]]:
    stmt = select(
        characters.c.id,
        characters.c.name,
        characters.c.on_screen,
        characters.c.data,
    ).order_by(characters.c.id.asc())
    with engine.connect() as conn:
        rows = conn.execute(stmt).mappings().all()
        return [dict(r) for r in rows]

def insert_character(name: str, on_screen: bool, data: Optional[Dict[str, Any]]):
    stmt = (
        insert(characters)
        .values(name=name, on_screen=on_screen, data=data)
        .returning(
            characters.c.id,
            characters.c.name,
            characters.c.on_screen,
            characters.c.data,
        )
    )
    with engine.begin() as conn:
        row = conn.execute(stmt).mappings().one()
        return dict(row)

def set_on_screen(char_id: int, on_screen: bool):
    stmt = (
        update(characters)
        .where(characters.c.id == char_id)
        .values(on_screen=on_screen)
        .returning(
            characters.c.id,
            characters.c.name,
            characters.c.on_screen,
            characters.c.data,
        )
    )
    with engine.begin() as conn:
        row = conn.execute(stmt).mappings().one_or_none()
        return dict(row) if row else None
