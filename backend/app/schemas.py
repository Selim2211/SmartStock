from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class BranchBase(BaseModel):
    name: str


class BranchCreate(BranchBase):
    pass


class Branch(BranchBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    category: str
    price: float
    gorsel_url: str | None = None


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: int
    company_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class TableBase(BaseModel):
    name: str
    capacity: int


class TableCreate(TableBase):
    pass


class Table(TableBase):
    id: int
    company_id: str
    status: str
    is_occupied: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


# --- Adisyon / Masa POS ---


class OrderItemLine(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    line_total: float


class TableResponse(BaseModel):
    """Masa + aktif adisyon satırları + toplam tutar."""

    id: int
    name: str
    is_occupied: bool
    items: list[OrderItemLine]
    total_amount: float


class AddItemBody(BaseModel):
    product_id: int
    quantity: int = 1

