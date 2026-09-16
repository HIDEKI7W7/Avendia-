"""Lema del año configurable desde administración."""

import sqlalchemy as sa
from alembic import op

revision = "0020_platform_year_motto"
down_revision = "0019_ai_generation_records"
branch_labels = None
depends_on = None

DEFAULT_YEAR_MOTTO = "“Año de la Esperanza y el Fortalecimiento de la Democracia”"


def upgrade():
    op.add_column(
        "platform_settings",
        sa.Column(
            "year_motto",
            sa.String(length=200),
            nullable=False,
            server_default=DEFAULT_YEAR_MOTTO,
        ),
    )


def downgrade():
    op.drop_column("platform_settings", "year_motto")
