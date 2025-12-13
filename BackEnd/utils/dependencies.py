from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.turista import Turista
from utils.jwt_manager import verify_access_token

# Dependencia para obtener la sesión de DB
def get_session() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Configuración OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Obtener usuario autenticado
def get_current_user(
    db: Session = Depends(get_session),
    token: str = Depends(oauth2_scheme)
):
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )

    user_id: int = int(payload.get("sub"))
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

    user = db.query(Turista).filter(Turista.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    return user
