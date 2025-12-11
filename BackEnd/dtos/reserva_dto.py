from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from models.reserva import EstadoReserva  # ✅ importamos el Enum

# =====================================================
# 🔹 DTO para acompañante de reserva
# =====================================================
class PersonaReservaDTO(BaseModel):
    nombre: str
    tipo_identificacion: str
    identificacion: str
    edad: int


# =====================================================
# 🔹 DTO para tarjeta
# =====================================================
class TarjetaDTO(BaseModel):
    nombre: str
    tipo_tarjeta: str
    numero: str
    fecha_vencimiento: str
    cvv: int

# =====================================================
# 🔹 DTO para creación de reserva
# =====================================================
class reservaCreateDTO(BaseModel):
    fecha_reserva: date
    disponibilidad: Optional[EstadoReserva] = EstadoReserva.CONFIRMADA
    numero_personas: int
    id_informe: Optional[int] = None
    id_plan: int
    tarjeta: TarjetaDTO 
    email_cliente: str  # si lo usas para enviar correo
    acompanantes: List[PersonaReservaDTO]
    

    class Config:
        orm_mode = True


# =====================================================
# 🔹 DTO para actualización de reserva
# =====================================================
class reservaUpdateDTO(BaseModel):
    fecha_reserva: Optional[date] = None
    numero_personas: Optional[int] = None
    id_informe: Optional[int] = None
    id_plan: Optional[int] = None
    disponibilidad: Optional[EstadoReserva] = None

    class Config:
        orm_mode = True


# =====================================================
# 🔹 DTO para salida de reserva
# =====================================================
class ReservaOut(BaseModel):
    id: int
    fecha_reserva: str
    costo_final: float
    disponibilidad: EstadoReserva  # ✅ Enum, no bool
    numero_personas: int
    id_plan: int
    plan_nombre: Optional[str]
    id_turista: int
    turista_nombre: Optional[str]

    class Config:
        orm_mode = True
