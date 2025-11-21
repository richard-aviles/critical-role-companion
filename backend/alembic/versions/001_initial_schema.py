"""Initial schema creation - all tables for multi-tenant campaign app

Revision ID: 001
Revises:
Create Date: 2025-11-20

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create campaigns table
    op.create_table(
        'campaigns',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('slug', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('owner_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('admin_token', sa.String(255), nullable=False),
        sa.Column('settings', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
        sa.UniqueConstraint('admin_token')
    )
    op.create_index(op.f('ix_campaigns_slug'), 'campaigns', ['slug'], unique=True)

    # Create characters table
    op.create_table(
        'characters',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('campaign_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('player_name', sa.String(255), nullable=True),
        sa.Column('class_name', sa.String(100), nullable=True),
        sa.Column('race', sa.String(100), nullable=True),
        sa.Column('stats', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('portrait_url', sa.String(500), nullable=True),
        sa.Column('background_url', sa.String(500), nullable=True),
        sa.Column('status', sa.String(50), nullable=True, server_default='active'),
        sa.Column('appearance', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_characters_campaign_id'), 'characters', ['campaign_id'])

    # Create episodes table
    op.create_table(
        'episodes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('campaign_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('episode_number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(255), nullable=True),
        sa.Column('date', sa.String(50), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_episodes_campaign_id'), 'episodes', ['campaign_id'])

    # Create events table
    op.create_table(
        'events',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('campaign_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('character_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('event_type', sa.String(100), nullable=False),
        sa.Column('data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.id'], ),
        sa.ForeignKeyConstraint(['character_id'], ['characters.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_events_campaign_id'), 'events', ['campaign_id'])
    op.create_index(op.f('ix_events_character_id'), 'events', ['character_id'])
    op.create_index(op.f('ix_events_timestamp'), 'events', ['timestamp'])

    # Create rosters table
    op.create_table(
        'rosters',
        sa.Column('campaign_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('character_ids', postgresql.ARRAY(postgresql.UUID(as_uuid=True)), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.id'], ),
        sa.PrimaryKeyConstraint('campaign_id')
    )
    op.create_index(op.f('ix_rosters_campaign_id'), 'rosters', ['campaign_id'])

    # Create layout_overrides table
    op.create_table(
        'layout_overrides',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('campaign_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tier', sa.String(50), nullable=False),
        sa.Column('badges', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('chips', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_layout_overrides_campaign_id'), 'layout_overrides', ['campaign_id'])


def downgrade() -> None:
    # Drop all tables in reverse order of creation
    op.drop_index(op.f('ix_layout_overrides_campaign_id'), table_name='layout_overrides')
    op.drop_table('layout_overrides')

    op.drop_index(op.f('ix_rosters_campaign_id'), table_name='rosters')
    op.drop_table('rosters')

    op.drop_index(op.f('ix_events_timestamp'), table_name='events')
    op.drop_index(op.f('ix_events_character_id'), table_name='events')
    op.drop_index(op.f('ix_events_campaign_id'), table_name='events')
    op.drop_table('events')

    op.drop_index(op.f('ix_episodes_campaign_id'), table_name='episodes')
    op.drop_table('episodes')

    op.drop_index(op.f('ix_characters_campaign_id'), table_name='characters')
    op.drop_table('characters')

    op.drop_index(op.f('ix_campaigns_slug'), table_name='campaigns')
    op.drop_table('campaigns')
