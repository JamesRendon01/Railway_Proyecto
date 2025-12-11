import random
import string
from datetime import datetime, timedelta

codigos_verificacion = {}

def generar_codigo_verificacion():
    return ''.join(random.choices(string.digits, k=6))

def guardar_codigo(correo: str, codigo: str):
    codigos_verificacion[correo] = {
        "codigo": codigo,
        "expira": datetime.utcnow() + timedelta(minutes=10)
    }

def verificar_codigo(correo: str, codigo: str) -> bool:
    if correo not in codigos_verificacion:
        return False
    datos = codigos_verificacion[correo]
    if datetime.utcnow() > datos["expira"]:
        del codigos_verificacion[correo]
        return False
    return datos["codigo"] == codigo