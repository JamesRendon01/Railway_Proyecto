from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ubicacionCreateDTO(BaseModel):
    longitud: str
    latitud: str
    id_plan: int

class ubicacionUpdateDTO(BaseModel):
    longitud: Optional[str] = None
    latitud: Optional[str] = None
    id_plan: Optional[int] = None

class UbicacionOut(BaseModel):
    id: int