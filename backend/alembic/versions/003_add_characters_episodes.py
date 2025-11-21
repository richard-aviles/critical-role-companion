"""Add characters and episodes tables for Phase 2

Revision ID: 003
Revises: 002
Create Date: 2025-11-21 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create characters table if it doesn't exist
    op.execute("""
        CREATE TABLE IF NOT EXISTS characters (
            id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
            campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            player_name VARCHAR(255),
            class_name VARCHAR(100),
            race VARCHAR(100),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Check if characters table exists and add missing columns
    op.execute("""
        DO $$
        BEGIN
            -- Add slug column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='characters' AND column_name='slug') THEN
                ALTER TABLE characters ADD COLUMN slug VARCHAR(255);
            END IF;

            -- Add description column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='characters' AND column_name='description') THEN
                ALTER TABLE characters ADD COLUMN description TEXT;
            END IF;

            -- Add backstory column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='characters' AND column_name='backstory') THEN
                ALTER TABLE characters ADD COLUMN backstory TEXT;
            END IF;

            -- Rename portrait_url to image_url if it exists, otherwise add image_url
            IF EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='characters' AND column_name='portrait_url') THEN
                ALTER TABLE characters RENAME COLUMN portrait_url TO image_url;
            ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns
                             WHERE table_name='characters' AND column_name='image_url') THEN
                ALTER TABLE characters ADD COLUMN image_url VARCHAR(500);
            END IF;

            -- Add image_r2_key column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='characters' AND column_name='image_r2_key') THEN
                ALTER TABLE characters ADD COLUMN image_r2_key VARCHAR(255);
            END IF;

            -- Add is_active column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='characters' AND column_name='is_active') THEN
                ALTER TABLE characters ADD COLUMN is_active BOOLEAN DEFAULT true;
            END IF;

            -- Add level column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='characters' AND column_name='level') THEN
                ALTER TABLE characters ADD COLUMN level INTEGER DEFAULT 1;
            END IF;
        END $$;
    """)

    # Generate slugs for existing characters
    op.execute("""
        UPDATE characters
        SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '''', ''))
        WHERE slug IS NULL;
    """)

    # Make slug NOT NULL after populating
    op.execute("""
        ALTER TABLE characters
        ALTER COLUMN slug SET NOT NULL;
    """)

    # Create indexes for characters
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_characters_campaign ON characters(campaign_id);
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_characters_slug ON characters(slug);
    """)

    # Create episodes table if it doesn't exist
    op.execute("""
        CREATE TABLE IF NOT EXISTS episodes (
            id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
            campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
            episode_number INTEGER NOT NULL,
            title VARCHAR(255),
            date VARCHAR(50),
            summary TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Check if episodes table exists and add missing columns for Phase 2
    op.execute("""
        DO $$
        BEGIN
            -- Add name column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='episodes' AND column_name='name') THEN
                ALTER TABLE episodes ADD COLUMN name VARCHAR(255);
            END IF;

            -- Add slug column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='episodes' AND column_name='slug') THEN
                ALTER TABLE episodes ADD COLUMN slug VARCHAR(255);
            END IF;

            -- Add season column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='episodes' AND column_name='season') THEN
                ALTER TABLE episodes ADD COLUMN season INTEGER;
            END IF;

            -- Add description column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='episodes' AND column_name='description') THEN
                ALTER TABLE episodes ADD COLUMN description TEXT;
            END IF;

            -- Add air_date column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='episodes' AND column_name='air_date') THEN
                ALTER TABLE episodes ADD COLUMN air_date VARCHAR(50);
            END IF;

            -- Add runtime column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='episodes' AND column_name='runtime') THEN
                ALTER TABLE episodes ADD COLUMN runtime INTEGER;
            END IF;

            -- Add is_published column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='episodes' AND column_name='is_published') THEN
                ALTER TABLE episodes ADD COLUMN is_published BOOLEAN DEFAULT false;
            END IF;
        END $$;
    """)

    # Migrate existing data: copy 'title' to 'name' and generate slug (only if title column exists)
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='episodes' AND column_name='title') THEN
                UPDATE episodes
                SET
                    name = COALESCE(title, 'Episode ' || episode_number::text),
                    slug = COALESCE(
                        LOWER(REPLACE(REPLACE(title, ' ', '-'), '''', '')),
                        'episode-' || episode_number::text
                    ),
                    season = COALESCE(season, 1)
                WHERE name IS NULL OR slug IS NULL;
            END IF;
        END $$;
    """)

    # Make name and slug NOT NULL after populating (only if they exist as columns)
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='episodes' AND column_name='name') THEN
                ALTER TABLE episodes ALTER COLUMN name SET NOT NULL;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='episodes' AND column_name='slug') THEN
                ALTER TABLE episodes ALTER COLUMN slug SET NOT NULL;
            END IF;
        END $$;
    """)

    # Create indexes for episodes
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_episodes_campaign ON episodes(campaign_id);
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_episodes_slug ON episodes(slug);
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_episodes_number ON episodes(episode_number);
    """)

    # Drop old events table (was for real-time overlay, Phase 2 uses episode timeline events)
    op.execute("""
        DROP TABLE IF EXISTS events CASCADE;
    """)

    # Create new events table for Phase 2 (episode timeline events)
    op.execute("""
        CREATE TABLE events (
            id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
            episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,

            -- Event Info
            name VARCHAR(255) NOT NULL,
            description TEXT,
            timestamp_in_episode INTEGER,

            -- Categories
            event_type VARCHAR(50),
            characters_involved TEXT,

            -- Timestamps
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Create indexes for events
    op.execute("""
        CREATE INDEX idx_events_episode ON events(episode_id);
    """)
    op.execute("""
        CREATE INDEX idx_events_type ON events(event_type);
    """)


def downgrade() -> None:
    # Drop events table and indexes (must be first due to FK constraint)
    op.execute("DROP INDEX IF EXISTS idx_events_type")
    op.execute("DROP INDEX IF EXISTS idx_events_episode")
    op.execute("DROP TABLE IF EXISTS events")

    # Drop episodes table and indexes
    op.execute("DROP INDEX IF EXISTS idx_episodes_number")
    op.execute("DROP INDEX IF EXISTS idx_episodes_slug")
    op.execute("DROP INDEX IF EXISTS idx_episodes_campaign")
    op.execute("DROP TABLE IF EXISTS episodes")

    # Drop characters table and indexes
    op.execute("DROP INDEX IF EXISTS idx_characters_slug")
    op.execute("DROP INDEX IF EXISTS idx_characters_campaign")
    op.execute("DROP TABLE IF EXISTS characters")
