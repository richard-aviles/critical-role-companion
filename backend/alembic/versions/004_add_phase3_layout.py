"""Add Phase 3 character layout and stats support

Revision ID: 004
Revises: 003
Create Date: 2025-11-22 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to characters table for Phase 3
    op.execute("""
        DO $$
        BEGIN
            -- Add background_image_url column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='characters' AND column_name='background_image_url') THEN
                ALTER TABLE characters ADD COLUMN background_image_url VARCHAR(500);
            END IF;

            -- Add stats JSONB column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='characters' AND column_name='stats') THEN
                ALTER TABLE characters ADD COLUMN stats JSONB DEFAULT '{}'::jsonb;
            END IF;
        END $$;
    """)

    # Create character_layouts table
    op.execute("""
        CREATE TABLE IF NOT EXISTS character_layouts (
            id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
            campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

            -- Layout metadata
            name VARCHAR(100) NOT NULL DEFAULT 'Default',
            is_default BOOLEAN DEFAULT false,

            -- Stat configuration
            stats_to_display JSONB NOT NULL DEFAULT '["str", "dex", "con", "int", "wis", "cha"]'::jsonb,

            -- Color scheme
            border_color_count INTEGER NOT NULL DEFAULT 2,
            border_colors JSONB NOT NULL DEFAULT '{}'::jsonb,
            text_color VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
            badge_interior_gradient JSONB NOT NULL DEFAULT '{}'::jsonb,

            -- HP & AC colors (fixed)
            hp_color JSONB NOT NULL DEFAULT '{}'::jsonb,
            ac_color JSONB NOT NULL DEFAULT '{}'::jsonb,

            -- Badge layout (positions & shapes)
            badge_layout JSONB NOT NULL DEFAULT '[]'::jsonb,

            -- Color preset
            color_preset VARCHAR(50),

            -- Timestamps
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Create indexes for character_layouts
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_character_layouts_campaign
        ON character_layouts(campaign_id);
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_character_layouts_is_default
        ON character_layouts(is_default);
    """)


def downgrade() -> None:
    # Drop character_layouts table and indexes
    op.execute("DROP INDEX IF EXISTS idx_character_layouts_is_default")
    op.execute("DROP INDEX IF EXISTS idx_character_layouts_campaign")
    op.execute("DROP TABLE IF EXISTS character_layouts")

    # Remove new columns from characters table
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='characters' AND column_name='stats') THEN
                ALTER TABLE characters DROP COLUMN stats;
            END IF;

            IF EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='characters' AND column_name='background_image_url') THEN
                ALTER TABLE characters DROP COLUMN background_image_url;
            END IF;
        END $$;
    """)
