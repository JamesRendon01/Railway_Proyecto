from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from models.favorito import Favorito
from dtos.favorito_dto import favoritoCreateDTO
from db.session import SessionLocal

# Obtener sesión
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Router
router = APIRouter(prefix='/favorito', tags=["Favoritos"])

# Listar favoritos de un usuario
@router.get('/')
def listar_favoritos(user_id: int = Query(..., description="ID del usuario"), db: Session = Depends(get_session)):
    favoritos = db.query(Favorito).filter(Favorito.id_turista == user_id).all()
    return favoritos

# Agregar favorito
@router.post('/')
def crear_favorito(nuevo_favorito: favoritoCreateDTO, db: Session = Depends(get_session)):
    # Evitar duplicados
    existe = db.query(Favorito).filter_by(
        id_turista=nuevo_favorito.id_turista, 
        id_plan=nuevo_favorito.id_plan
    ).first()
    if existe:
        raise HTTPException(status_code=400, detail="Favorito ya existe")
    
    favorito = Favorito(
        id_turista=nuevo_favorito.id_turista,
        id_plan=nuevo_favorito.id_plan
    )
    db.add(favorito)
    db.commit()
    db.refresh(favorito)
    return favorito

# Eliminar favorito por turista y plan
@router.delete('/')
def eliminar_favorito(user_id: int = Query(...), plan_id: int = Query(...), db: Session = Depends(get_session)):
    favorito = db.query(Favorito).filter(
        Favorito.id_turista == user_id,
        Favorito.id_plan == plan_id
    ).first()
    if not favorito:
        raise HTTPException(status_code=404, detail="Favorito no encontrado")
    db.delete(favorito)
    db.commit()
    return {"detail": f"Favorito eliminado: usuario {user_id}, plan {plan_id}"}
