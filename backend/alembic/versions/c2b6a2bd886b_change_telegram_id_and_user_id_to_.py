"""change telegram_id and user_id to BigInteger

Revision ID: c2b6a2bd886b
Revises: 48cb575d966e
Create Date: 2025-09-10 18:09:31.774366

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c2b6a2bd886b"
down_revision: Union[str, Sequence[str], None] = "48cb575d966e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Удаляем внешний ключ
    op.drop_constraint("transactions_user_id_fkey", "transactions", type_="foreignkey")

    # 2. Меняем тип у ребёнка (transactions.user_id)
    op.alter_column(
        "transactions",
        "user_id",
        existing_type=sa.VARCHAR(),
        type_=sa.BigInteger(),
        existing_nullable=False,
        postgresql_using="user_id::bigint",
    )

    # 3. Меняем тип у родителя (users.telegram_id)
    op.alter_column(
        "users",
        "telegram_id",
        existing_type=sa.VARCHAR(),
        type_=sa.BigInteger(),
        existing_nullable=False,
        postgresql_using="telegram_id::bigint",
    )

    # 4. Восстанавливаем внешний ключ
    op.create_foreign_key(
        "transactions_user_id_fkey",
        "transactions",
        "users",
        ["user_id"],
        ["telegram_id"],
    )


def downgrade() -> None:
    # 1. Удаляем внешний ключ
    op.drop_constraint("transactions_user_id_fkey", "transactions", type_="foreignkey")

    # 2. Возвращаем VARCHAR у родителя
    op.alter_column(
        "users",
        "telegram_id",
        existing_type=sa.BigInteger(),
        type_=sa.VARCHAR(),
        existing_nullable=False,
    )

    # 3. Возвращаем VARCHAR у ребёнка
    op.alter_column(
        "transactions",
        "user_id",
        existing_type=sa.BigInteger(),
        type_=sa.VARCHAR(),
        existing_nullable=False,
    )

    # 4. Восстанавливаем внешний ключ
    op.create_foreign_key(
        "transactions_user_id_fkey",
        "transactions",
        "users",
        ["user_id"],
        ["telegram_id"],
    )