from jose import JWTError, jwt, ExpiredSignatureError
from datetime import datetime, timedelta

# Clave secreta para los tokens
SECRET_KEY = "Clavesecreta"
ALGORITHM = "HS256"
# Tiempod de experacion por defecto (1 hora)
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Función para crear un token a acceso JWT
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    #Copiamos los datos a codificar
    to_encode = data.copy()
    # Calulamos la fecha de expiracion
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes = ACCESS_TOKEN_EXPIRE_MINUTES))
    #Agregamos el campo de expiracion al payload
    to_encode.update({"exp":expire})
    # Genera el token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Funcion para verificar el token
def verify_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Si el token es válido y no expiró, devuelve el payload (diccionario)
        return payload
    except ExpiredSignatureError:
        #Token expirado
        return None
    except JWTError:
        #Token invalido
        return None