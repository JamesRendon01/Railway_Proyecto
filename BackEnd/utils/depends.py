from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from db.session import SessionLocal
from models.administrador import Administrador
from utils.jwt_manager import verify_access_token

import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="administrador/iniciarsesion")


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_admin(
    db: Session = Depends(get_session),
    token_admin: str = Depends(oauth2_scheme)
):

    if not token_admin:
        raise HTTPException(status_code=401, detail="Falta token")

    payload = verify_access_token(token_admin)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    admin_id = payload.get("sub")
    if not admin_id:
        raise HTTPException(status_code=401, detail="Token sin ID válido")

    admin = db.query(Administrador).filter(Administrador.id == int(admin_id)).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")

    return admin
