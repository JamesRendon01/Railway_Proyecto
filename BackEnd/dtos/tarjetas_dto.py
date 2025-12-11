# schemas/tarjeta.py
from pydantic import BaseModel, constr, conint
from typing import Optional

class TarjetaBase(BaseModel):
    nombre: str
    tipo_tarjeta: str
    numero: constr(min_length=13, max_length=16)  # Tarjetas suelen tener entre 13 y 16 dígitos
    fecha_vencimiento: str                        # Formato: "MM/AA"
    cvv: conint(min_length=3, max_lenght=5)                   # CVV de 3 dígitos
    turista_id: int

class TarjetaCreate(TarjetaBase):
    """DTO para crear una nueva tarjeta."""
    pass