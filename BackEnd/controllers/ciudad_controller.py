from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.ciudad import Ciudad
from db.session import SessionLocal
from dtos.ciudad_dto import ciudadCreateDTO

router = APIRouter(prefix="/ciudad")

# Dependency para obtener la sesión
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Listar todas las ciudades
@router.get("/listar_ciudades")
def listar_ciudades(db: Session = Depends(get_session)):
    ciudades = db.query(Ciudad).all()
    if not ciudades:
        raise HTTPException(status_code=404, detail="No hay ciudades registradas")
    return ciudades

# Obtener una ciudad por id
@router.get("/{id}")
def obtener_ciudad(id: int, db: Session = Depends(get_session)):
    ciudad = db.query(Ciudad).filter(Ciudad.id == id).first()
    if not ciudad:
        raise HTTPException(status_code=404, detail="Ciudad no encontrada")
    return ciudad

@router.post("/crear_ciudad")
def crear_ciudad(nueva_ciudad: ciudadCreateDTO, db:Session = Depends(get_session)):
            
             # Validar que el correo o identificación no se repita
            existente = db.query(Ciudad).filter(
                (Ciudad.nombre == nueva_ciudad.nombre)
            ).first()

            if existente:
                raise HTTPException(status_code=400, detail="Ubicacion ya existe")
            #crear categoria
            nc = Ciudad(
                    nombre = nueva_ciudad.nombre
            )
            #inserto la nueva categoria
            db.add(nc)
            #confirmo la transaccion manualmente
            db.commit()
            #nueva categoria la dispongo en memoria
            db.refresh(nc)
            return nc
