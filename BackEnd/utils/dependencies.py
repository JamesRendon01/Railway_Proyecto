from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm.session import Session 
from sqlalchemy.orm import session
from db.session import SessionLocal
from models.turista import Turista
from utils.jwt_manager import verify_access_token

# Función para obtener la sesión de base de datos
def get_session() -> Session:
    db = SessionLocal()  # Crear sesión
    try:
        yield db  # Entregar la sesión como dependencia
    finally:
        db.close()  # Cerrar sesión al finalizar

# Configuración de OAuth2 con FastAPI
# tokenUrl indica la ruta donde se obtiene el token (login)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Función para obtener el usuario actual autenticado
def get_current_user(
    db: Session = Depends(get_session),  # Inyecta la sesión de DB
    token: str = Depends(oauth2_scheme)  # Obtiene el token del header Authorization
):
    # Verificar y decodificar el token JWT
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )
    
    # Obtener el ID del usuario del payload
    user_id: int = int(payload.get("sub"))
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    
    # Buscar usuario en la base de datos
    user = db.query(Turista).filter(Turista.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    return user  # Retorna el objeto usuario autenticado
