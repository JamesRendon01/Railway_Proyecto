from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from dtos.ubicacion_dto import UbicacionOut

# ==========================================================
# ✅ Crear plan
# ==========================================================
class planCreateDTO(BaseModel):
    nombre: str
    descripcion: str
    descripcion_corta: str
    costo_persona: int
    imagen: Optional[str] = None
    id_ciudad: Optional[int] = None
    mostrar_en_carrusel: Optional[bool] = False  # ✅ Nuevo campo


# ==========================================================
# ✅ Actualizar plan
# ==========================================================
class planUpdateDTO(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    descripcion_corta: Optional[str] = None
    costo_persona: Optional[int] = None
    imagen: Optional[str] = None
    id_ciudad: Optional[int] = None
    id_informe: Optional[int] = None
    mostrar_en_carrusel: Optional[bool] = False  # ✅ Nuevo campo


# ==========================================================
# ✅ Plan de salida general
# ==========================================================
class PlanOut(BaseModel):
    id: int
    nombre: str
    descripcion: str
    descripcion_corta: str
    costo_persona: int
    imagen: Optional[str]
    id_ciudad: int
    id_informe: Optional[int] = None
    mostrar_en_carrusel: Optional[bool] = False  # ✅ Nuevo campo

    class Config:
        orm_mode = True


# ==========================================================
# ✅ Plan para Cards
# ==========================================================
class PlanCardOut(BaseModel):
    id: int
    nombre: str
    descripcion_corta: str
    descripcion: str
    imagen: str


# ==========================================================
# ✅ Listar planes en Admin
# ==========================================================
class ListarPlanAdmin(BaseModel):
    id: int
    nombre: str
    descripcion_corta: str
    descripcion: str
    costo_persona: int
    id_ciudad: str
    mostrar_en_carrusel: Optional[bool] = False  # ✅ Nuevo campo
    ubicaciones: List[int] = []


# ==========================================================
# ✅ Plan por ID (para edición)
# ==========================================================
class planUpdateIdDTO(BaseModel):
    id: Optional[int] = None
    nombre: Optional[str] = None
    descripcion_corta: Optional[str] = None
    descripcion: Optional[str] = None
    costo_persona: Optional[int] = None
    id_ciudad: Optional[int] = None
    imagen: Optional[str] = None
    mostrar_en_carrusel: Optional[bool] = False  # ✅ Nuevo campo
