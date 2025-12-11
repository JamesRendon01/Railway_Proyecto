from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class informeCreateDTO(BaseModel):
    fecha_creacion: datetime
    nombre: str
    id_administrador: int

class informeUpdateDTO(BaseModel):
    fecha_creacion: Optional[datetime] = None
    nombre: Optional[str] = None
    id_administrador: Optional[int] = None

class informeUploadDTO(BaseModel):
    nombre: str
    id_administrador: int