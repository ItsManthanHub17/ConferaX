"""Initial migration - create users, rooms, and bookings tables

Revision ID: 001_initial
Revises: 
Create Date: 2025-02-03 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True, index=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', sa.Enum('USER', 'ADMIN', name='roleenum'), nullable=False, server_default='USER'),
        sa.Column('avatar', sa.String(500), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci'
    )
    
    # Create rooms table
    op.create_table(
        'rooms',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('floor', sa.String(100), nullable=False),
        sa.Column('room_number', sa.String(50), nullable=False, unique=True, index=True),
        sa.Column('capacity', sa.Integer(), nullable=False),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('features', sa.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci'
    )
    
    # Create bookings table
    op.create_table(
        'bookings',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('room_id', sa.String(36), sa.ForeignKey('rooms.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('date', sa.Date(), nullable=False, index=True),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('attendees', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('priority', sa.Enum('Low', 'Medium', 'High', name='priorityenum'), nullable=False, server_default='Medium'),
        sa.Column('status', sa.Enum('Pending', 'Approved', 'Rejected', 'Cancelled', name='bookingstatusenum'), nullable=False, server_default='Pending', index=True),
        sa.Column('equipment', sa.JSON(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci'
    )
    
    # Create composite index for conflict detection
    op.create_index(
        'idx_booking_conflict',
        'bookings',
        ['room_id', 'date', 'status']
    )


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index('idx_booking_conflict', table_name='bookings')
    op.drop_table('bookings')
    op.drop_table('rooms')
    op.drop_table('users')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS bookingstatusenum')
    op.execute('DROP TYPE IF EXISTS priorityenum')
    op.execute('DROP TYPE IF EXISTS roleenum')