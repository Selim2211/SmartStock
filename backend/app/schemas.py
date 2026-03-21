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
    created_at: datetime

    class Config:
        from_attributes = True

