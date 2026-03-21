from __future__ import annotations

import asyncio
import os
from typing import AsyncGenerator

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

load_dotenv()

try:
    import asyncpg
except ImportError:
    asyncpg = None


class Base(DeclarativeBase):
    pass


raw_url = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/smartstock",
)

if raw_url.startswith("postgresql://") and "+asyncpg" not in raw_url:
    DATABASE_URL = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    DATABASE_URL = raw_url

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    bind=engine,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


def _is_db_starting_up(exc: BaseException) -> bool:
    """Veritabanı 'starting up' hatası mı kontrol eder (sarmalanmış dahil)."""
    current: BaseException | None = exc
    while current:
        if asyncpg and isinstance(current, asyncpg.exceptions.CannotConnectNowError):
            return True
        msg = str(current).lower()
        if "starting up" in msg or "cannot connect now" in msg:
            return True
        current = getattr(current, "__cause__", None) or getattr(current, "__context__", None)
    return False


async def init_db() -> None:
    """
    Uygulama ayağa kalkarken modellerin tablolarını oluşturur.
    DB henüz hazır değilse birkaç kez yeniden dener (örn. Railway cold start).
    Production için alembic migration tercih edilmelidir.
    """
    from . import models  # noqa: F401

    def run_migrations(sync_conn) -> None:
        # Eski lojistik alanlarını kaldır
        sync_conn.exec_driver_sql(
            "ALTER TABLE products DROP COLUMN IF EXISTS stock;"
        )
        sync_conn.exec_driver_sql(
            "ALTER TABLE products DROP COLUMN IF EXISTS critical_level;"
        )
        sync_conn.exec_driver_sql(
            "ALTER TABLE products DROP COLUMN IF EXISTS supplier;"
        )

    max_attempts = 10
    delay_seconds = 2

    for attempt in range(1, max_attempts + 1):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                await conn.run_sync(run_migrations)
            return
        except Exception as e:
            if _is_db_starting_up(e) and attempt < max_attempts:
                await asyncio.sleep(delay_seconds)
                continue
            raise

