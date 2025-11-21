"""Add users table and link campaigns to users

Revision ID: 002
Revises: 001
Create Date: 2025-11-21 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table if it doesn't exist
    op.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id UUID NOT NULL PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL
        );
    """)

    # Create index on email for fast lookups if it doesn't exist
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);
    """)

    # Create a default user for existing campaigns (migration user)
    op.execute("""
        INSERT INTO users (id, email, password_hash, created_at, updated_at)
        VALUES (
            '00000000-0000-0000-0000-000000000000'::uuid,
            'migration@critical-role-companion.local',
            '$2b$12$placeholder.hash.for.migration.user.that.should.be.updated',
            NOW(),
            NOW()
        )
        ON CONFLICT (email) DO NOTHING
    """)

    # Update existing campaigns to have an owner_id
    op.execute("""
        UPDATE campaigns
        SET owner_id = '00000000-0000-0000-0000-000000000000'::uuid
        WHERE owner_id IS NULL
    """)

    # Try to add foreign key constraint if it doesn't exist
    # (This will be idempotent - if it already exists, it won't fail)
    try:
        op.execute("""
            ALTER TABLE campaigns
            ADD CONSTRAINT fk_campaigns_owner_id_users_id
            FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
        """)
    except:
        pass  # Constraint might already exist

    # Create index on campaigns.owner_id if it doesn't exist
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_campaigns_owner_id ON campaigns (owner_id);
    """)


def downgrade() -> None:
    # Drop foreign key
    op.drop_constraint('fk_campaigns_owner_id_users_id', 'campaigns', type_='foreignkey')

    # Drop index on owner_id
    op.drop_index(op.f('ix_campaigns_owner_id'), table_name='campaigns')

    # Restore campaigns.owner_id to nullable
    op.alter_column('campaigns', 'owner_id',
                   existing_type=postgresql.UUID(as_uuid=True),
                   nullable=True)

    # Drop users table
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
