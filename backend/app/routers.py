from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from . import models, schemas
from .db import get_db
from .paths import UPLOADS_DIR

DEFAULT_COMPANY_ID = "demo-company"


branches_router = APIRouter(prefix="/branches", tags=["branches"])
products_router = APIRouter(prefix="/api/urunler", tags=["products"])
tables_router = APIRouter(prefix="/api/masalar", tags=["tables"])
adisyon_router = APIRouter(prefix="/api/tables", tags=["adisyon"])


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
        os.makedirs(UPLOADS_DIR, exist_ok=True)
        dest_path = os.path.join(UPLOADS_DIR, filename)
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
    "/{product_id}", status_code=status.HTTP_200_OK
)
async def delete_product(
    product_id: int, db: AsyncSession = Depends(get_db)
) -> dict[str, str]:
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
    return {"detail": "Ürün başarıyla silindi."}


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
        is_occupied=False,
    )
    db.add(table)
    await db.commit()
    await db.refresh(table)
    return table


async def _ensure_seed_tables(db: AsyncSession) -> None:
    """Hiç masa yoksa Masa 1–10 oluşturur."""
    r = await db.execute(
        select(func.count())
        .select_from(models.Table)
        .where(models.Table.company_id == DEFAULT_COMPANY_ID)
    )
    n = r.scalar_one() or 0
    if n > 0:
        return
    for i in range(1, 11):
        db.add(
            models.Table(
                company_id=DEFAULT_COMPANY_ID,
                name=f"Masa {i}",
                capacity=4,
                status="available",
                is_occupied=False,
            )
        )
    await db.commit()


async def _build_table_response(
    db: AsyncSession, table: models.Table
) -> schemas.TableResponse:
    result = await db.execute(
        select(models.OrderItem, models.Product)
        .join(
            models.Product,
            models.OrderItem.product_id == models.Product.id,
        )
        .where(models.OrderItem.table_id == table.id)
        .order_by(models.OrderItem.id)
    )
    rows = result.all()
    items: list[schemas.OrderItemLine] = []
    total_amount = 0.0
    for oi, product in rows:
        unit = float(oi.unit_price)
        line_total = unit * oi.quantity
        total_amount += line_total
        items.append(
            schemas.OrderItemLine(
                id=oi.id,
                product_id=oi.product_id,
                product_name=product.name,
                quantity=oi.quantity,
                unit_price=unit,
                line_total=line_total,
            )
        )
    return schemas.TableResponse(
        id=table.id,
        name=table.name,
        is_occupied=table.is_occupied,
        items=items,
        total_amount=round(total_amount, 2),
    )


@adisyon_router.get("/", response_model=list[schemas.TableResponse])
async def list_tables_pos(
    db: AsyncSession = Depends(get_db),
) -> list[schemas.TableResponse]:
    await _ensure_seed_tables(db)
    result = await db.execute(
        select(models.Table)
        .where(models.Table.company_id == DEFAULT_COMPANY_ID)
        .order_by(models.Table.id)
    )
    tables = list(result.scalars().all())
    out: list[schemas.TableResponse] = []
    for t in tables:
        out.append(await _build_table_response(db, t))
    return out


@adisyon_router.post(
    "/{table_id}/add_item",
    response_model=schemas.TableResponse,
)
async def add_item_to_table(
    table_id: int,
    body: schemas.AddItemBody,
    db: AsyncSession = Depends(get_db),
) -> schemas.TableResponse:
    if body.quantity < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="quantity en az 1 olmalıdır.",
        )
    table = await db.get(models.Table, table_id)
    if table is None or table.company_id != DEFAULT_COMPANY_ID:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Masa bulunamadı.",
        )
    product = await db.get(models.Product, body.product_id)
    if product is None or product.company_id != DEFAULT_COMPANY_ID:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ürün bulunamadı.",
        )
    unit_price = float(product.price)
    existing = await db.execute(
        select(models.OrderItem).where(
            models.OrderItem.table_id == table_id,
            models.OrderItem.product_id == body.product_id,
        )
    )
    line = existing.scalar_one_or_none()
    if line is not None:
        line.quantity += body.quantity
    else:
        db.add(
            models.OrderItem(
                table_id=table_id,
                product_id=body.product_id,
                quantity=body.quantity,
                unit_price=unit_price,
            )
        )
    table.is_occupied = True
    await db.commit()
    await db.refresh(table)
    return await _build_table_response(db, table)


@adisyon_router.post("/{table_id}/checkout")
async def checkout_table(
    table_id: int,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str | int]:
    table = await db.get(models.Table, table_id)
    if table is None or table.company_id != DEFAULT_COMPANY_ID:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Masa bulunamadı.",
        )
    await db.execute(
        delete(models.OrderItem).where(models.OrderItem.table_id == table_id)
    )
    table.is_occupied = False
    await db.commit()
    return {
        "detail": "Hesap kapatıldı.",
        "table_id": table_id,
    }

