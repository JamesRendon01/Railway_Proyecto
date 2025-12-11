from pydantic import BaseModel, validator, EmailStr
from typing import Optional
from datetime import datetime
from security.validators import validate_email, validate_string

class iniciarSesionDTO(BaseModel):
    correo: str
    contrasena: str

    @validator("correo")
    def validar_correo(cls, v):
        return validate_email(v)

    @validator("contrasena")
    def validar_contrasena(cls, v):
        return validate_string(v, max_length=100)
    
class ActualizarAdministradorDTO(BaseModel):
    nombre: Optional[str] = None
    correo: Optional[EmailStr] = None
    celular: Optional[str] = None
    tipo_identificacion: Optional[str] = None
    identificacion: Optional[str] = None