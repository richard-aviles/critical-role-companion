"""Add character color theme overrides for per-character customization

Revision ID: 005
Revises: 004
Create Date: 2025-11-22 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add color_theme_override column to characters table
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='characters' AND column_name='color_theme_override') THEN
                ALTER TABLE characters ADD COLUMN color_theme_override JSONB DEFAULT NULL;
            END IF;
        END $$;
    """)


def downgrade() -> None:
    # Remove color_theme_override column from characters table
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='characters' AND column_name='color_theme_override') THEN
                ALTER TABLE characters DROP COLUMN color_theme_override;
            END IF;
        END $$;
    """)
