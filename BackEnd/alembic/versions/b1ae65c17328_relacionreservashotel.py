"""'relacionReservasHotel'

Revision ID: b1ae65c17328
Revises: 3b5e959c0b30
Create Date: 2025-11-05 00:31:31.842771
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision: str = 'b1ae65c17328'
down_revision: Union[str, None] = '3b5e959c0b30'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    conn = op.get_bind()
    columns_reserva = [row['Field'] for row in conn.execute(text("SHOW COLUMNS FROM reserva")).mappings()]

    if 'hotel_id' not in columns_reserva:
        op.add_column('reserva', sa.Column('hotel_id', sa.Integer(), nullable=True))
        op.create_foreign_key(None, 'reserva', 'hotel', ['hotel_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    conn = op.get_bind()
    columns_reserva = [row['Field'] for row in conn.execute(text("SHOW COLUMNS FROM reserva")).mappings()]

    if 'hotel_id' in columns_reserva:
        op.drop_constraint(None, 'reserva', type_='foreignkey')
        op.drop_column('reserva', 'hotel_id')
