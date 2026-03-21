from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from . import models, schemas
from .db import get_db

DEFAULT_COMPANY_ID = "demo-company"


branches_router = APIRouter(prefix="/branches", tags=["branches"])
products_router = APIRouter(prefix="/api/urunler", tags=["products"])
tables_router = APIRouter(prefix="/api/masalar", tags=["tables"])


@branches_router.get("/", response_model=list[schemas.Branch])
async def list_branches(
    db: AsyncSession = Depends(get_db),
) -> list[schemas.Branch]:
    result = await db.execute(select(models.Branch).order_by(models.Branch.id))
    return list(result.scalars().all())


@branches_router.post(
    "/", response_model=schemas.Branch, status_code=status.HTTP_201_CREATED
)
async def create_branch(
    payload: schemas.BranchCreate, db: AsyncSession = Depends(get_db)
) -> schemas.Branch:
    existing = await db.execute(
        select(models.Branch).where(models.Branch.name == payload.name)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu isimde bir şube zaten mevcut.",
        )

    branch = models.Branch(name=payload.name)
    db.add(branch)
    await db.commit()
    await db.refresh(branch)
    return branch


@products_router.get("/", response_model=list[schemas.Product])
async def list_products(
    db: AsyncSession = Depends(get_db),
) -> list[schemas.Product]:
    result = await db.execute(
        select(models.Product)
        .where(models.Product.company_id == DEFAULT_COMPANY_ID)
        .order_by(models.Product.id)
    )
    return list(result.scalars().all())


@products_router.post(
    "/", response_model=schemas.Product, status_code=status.HTTP_201_CREATED
)
async def create_product(
    name: str = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    gorsel: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
) -> schemas.Product:
    image_path: str | None = None
    if gorsel is not None:
        import os
        from uuid import uuid4

        ext = os.path.splitext(gorsel.filename or "")[1] or ".jpg"
        filename = f"{uuid4().hex}{ext}"
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        dest_path = os.path.join(upload_dir, filename)
        content = await gorsel.read()
        with open(dest_path, "wb") as f:
            f.write(content)
        image_path = f"/uploads/{filename}"

    product = models.Product(
        company_id=DEFAULT_COMPANY_ID,
        name=name,
        category=category,
        price=price,
        gorsel_url=image_path,
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


@products_router.delete(
    "/{product_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_product(
    product_id: int, db: AsyncSession = Depends(get_db)
) -> None:
    result = await db.execute(
        select(models.Product).where(
            models.Product.id == product_id,
            models.Product.company_id == DEFAULT_COMPANY_ID,
        )
    )
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ürün bulunamadı.",
        )

    await db.delete(product)
    await db.commit()
    return None


@tables_router.get("/", response_model=list[schemas.Table])
async def list_tables(
    db: AsyncSession = Depends(get_db),
) -> list[schemas.Table]:
    result = await db.execute(
        select(models.Table)
        .where(models.Table.company_id == DEFAULT_COMPANY_ID)
        .order_by(models.Table.id)
    )
    return list(result.scalars().all())


@tables_router.post(
    "/", response_model=schemas.Table, status_code=status.HTTP_201_CREATED
)
async def create_table(
    payload: schemas.TableCreate, db: AsyncSession = Depends(get_db)
) -> schemas.Table:
    existing = await db.execute(
        select(models.Table).where(models.Table.name == payload.name)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu isimde bir masa zaten mevcut.",
        )

    table = models.Table(
        company_id=DEFAULT_COMPANY_ID,
        name=payload.name,
        capacity=payload.capacity,
    )
    db.add(table)
    await db.commit()
    await db.refresh(table)
    return table

