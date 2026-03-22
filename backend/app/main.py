from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from .db import init_db
from .paths import UPLOADS_DIR
from .routers import adisyon_router, branches_router, products_router, tables_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="SmartStock API",
    version="0.1.0",
    lifespan=lifespan,
    # Trailing slash yoksa 307 redirect üretme (proxy arkasında HTTP'ye düşmeyi önler)
    redirect_slashes=False,
)

# Railway / reverse proxy: X-Forwarded-Proto, Host → HTTPS redirect URL'leri doğru üretilsin
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(branches_router)
app.include_router(products_router)
app.include_router(tables_router)
app.include_router(adisyon_router)

os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

