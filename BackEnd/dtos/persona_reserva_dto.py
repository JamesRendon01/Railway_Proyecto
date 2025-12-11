from pydantic import BaseModel
from typing import Optional

class PersonaReservaCreateDTO(BaseModel):
    nombre: str
    tipo_identificacion: str
    identificacion: str
    edad: int
    id_reserva: int

    class Config:
        orm_mode = True


class PersonaReservaOut(BaseModel):
    id: int
    nombre: str
    tipo_identificacion: str
    identificacion: str
    edad: int
    id_reserva: int

    class Config:
        orm_mode = True
