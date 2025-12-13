from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql
from sqlalchemy import text

revision: str = '3b5e959c0b30'
down_revision: Union[str, None] = '291f144e2188'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    conn = op.get_bind()

    # Modificaciones a tabla informe
    op.alter_column('informe', 'nombre',
                    existing_type=mysql.VARCHAR(length=30),
                    type_=sa.VARCHAR(length=100),
                    nullable=False)
    op.alter_column('informe', 'fecha_creacion',
                    existing_type=sa.DATE(),
                    type_=sa.DateTime(),
                    nullable=False)

    indexes = [i['Key_name'] for i in conn.execute(text("SHOW INDEXES FROM informe")).mappings()]
    if 'ix_informe_id' not in indexes:
        op.create_index(op.f('ix_informe_id'), 'informe', ['id'], unique=False)

    # Modificaciones a tabla plan
    columns_plan = [row['Field'] for row in conn.execute(text("SHOW COLUMNS FROM plan")).mappings()]
    if 'fecha_creacion' not in columns_plan:
        op.add_column(
            'plan',
            sa.Column('fecha_creacion', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True)
        )
    if 'mostrar_en_carrusel' not in columns_plan:
        op.add_column('plan', sa.Column('mostrar_en_carrusel', sa.Boolean(), nullable=True))

    # Modificaciones a tabla turista
    columns_turista = [row['Field'] for row in conn.execute(text("SHOW COLUMNS FROM turista")).mappings()]
    if 'estado' not in columns_turista:
        op.add_column('turista', sa.Column('estado', sa.Boolean(), nullable=True))
    if 'fecha_registro' not in columns_turista:
        op.add_column('turista', sa.Column('fecha_registro', sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    conn = op.get_bind()

    # Downgrade tabla turista
    columns_turista = [row['Field'] for row in conn.execute(text("SHOW COLUMNS FROM turista")).mappings()]
    if 'fecha_registro' in columns_turista:
        op.drop_column('turista', 'fecha_registro')
    if 'estado' in columns_turista:
        op.drop_column('turista', 'estado')

    # Downgrade tabla plan
    columns_plan = [row['Field'] for row in conn.execute(text("SHOW COLUMNS FROM plan")).mappings()]
    if 'mostrar_en_carrusel' in columns_plan:
        op.drop_column('plan', 'mostrar_en_carrusel')
    if 'fecha_creacion' in columns_plan:
        op.drop_column('plan', 'fecha_creacion')

    # Downgrade tabla informe
    indexes = [i['Key_name'] for i in conn.execute(text("SHOW INDEXES FROM informe")).mappings()]
    if 'ix_informe_id' in indexes:
        op.drop_index(op.f('ix_informe_id'), table_name='informe')

    op.alter_column('informe', 'fecha_creacion',
                    existing_type=sa.DateTime(),
                    type_=sa.DATE(),
                    nullable=True)
    op.alter_column('informe', 'nombre',
                    existing_type=sa.VARCHAR(length=100),
                    type_=mysql.VARCHAR(length=30),
                    nullable=True)
