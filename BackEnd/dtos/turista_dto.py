from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import date
import re
from security.validators import validate_email, validate_string

class turistaCreateDTO(BaseModel):
    correo: str
    nombre: str
    fecha_nacimiento: date
    tipo_identificacion: str
    identificacion: str
    contrasena: str
    ciudad_residencia_id: int
    celular: str
    direccion: str
    acepto_terminos: bool

    @validator("contrasena")
    def validar_contrasena_segura(cls, value):
        # Validar formato seguro
        pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$'
        if not re.match(pattern, value):
            raise ValueError("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.")
        # Validar longitud máxima
        return validate_string(value, max_length=100)

    @validator("tipo_identificacion")
    def validar_tipo_identificacion(cls, value):
        tipos_validos = {"CC", "TI", "CE", "PPT", "PAS"}
        if value not in tipos_validos:
            raise ValueError(f"Tipo de identificación inválido. Debe ser uno de {tipos_validos}")
        return value

    @validator("correo")
    def validar_correo(cls, v):
        return validate_email(v)

    @validator("nombre", "direccion", "tipo_identificacion", "identificacion")
    def validar_strings(cls, v):
        return validate_string(v, max_length=255)

class turistaUpdateDTO(BaseModel):
    nombre: Optional[str] = None
    correo: Optional[EmailStr] = None
    celular: Optional[str] = None
    fecha_nacimiento: Optional[str] = None
    ciudad_residencia_id: Optional[int] = None  # Nuevo
    tipo_identificacion: Optional[str] = None
    direccion: Optional[str] = None
    identificacion: Optional[str] = None
    contrasena: Optional[str] = None

class iniciarSesionDTO(BaseModel):
    correo: str
    contrasena: str

class CambiarContrasenaDTO(BaseModel):
    token: str
    nueva_contrasena: str

    @validator("nueva_contrasena")
    def validar_nueva_contrasena_segura(cls, value):
        pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$'
        if not re.match(pattern, value):
            raise ValueError("La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.")
        return value


class SolicitudRecuperacion(BaseModel):
    correo: str

class VerificarPinDTO(BaseModel):
    correo: str
    pin: str