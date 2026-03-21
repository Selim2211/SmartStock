# SmartStock Backend

FastAPI tabanlı restoran/kafe SaaS otomasyonu backend iskeleti.

## Özellikler

- FastAPI ile modern, tip güvenli API
- PostgreSQL için SQLAlchemy (async) + asyncpg sürücüsü
- Kolay yapılandırma için `.env` desteği

## Çalıştırma

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload
```

