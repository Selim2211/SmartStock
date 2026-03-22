"""Proje kök dizinleri (Railway volume / uploads için mutlak yol)."""

from __future__ import annotations

import os

# app/ içindeki dosyadan backend kökü: .../backend
_APP_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(_APP_DIR)

UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
