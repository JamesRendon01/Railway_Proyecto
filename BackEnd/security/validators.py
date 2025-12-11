import re
from fastapi import HTTPException

def validate_email(email: str):
    if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email):
        raise HTTPException(status_code=400, detail="Correo inválido")
    return email

def validate_string(value: str, max_length: int = 255):
    if len(value) > max_length:
        raise HTTPException(status_code=400, detail="Texto demasiado largo")
    return value
