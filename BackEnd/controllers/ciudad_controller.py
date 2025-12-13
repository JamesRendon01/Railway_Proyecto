from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models.ciudad import Ciudad
from dtos.ciudad_dto import ciudadCreateDTO
from db.database import get_db

router = APIRouter(prefix="/ciudad", tags=["Ciudad"])


# ─────────────────────────────
# LISTAR CIUDADES
# ─────────────────────────────

@router.get("/listar_ciudades")
def listar_ciudades(db: Session = Depends(get_db)):
    ciudades = db.query(Ciudad).all()
    if not ciudades:
        raise HTTPException(status_code=404, detail="No hay ciudades registradas")
    return ciudades


# ─────────────────────────────
# OBTENER CIUDAD POR ID
# ─────────────────────────────

@router.get("/{id}")
def obtener_ciudad(id: int, db: Session = Depends(get_db)):
    ciudad = db.query(Ciudad).filter(Ciudad.id == id).first()
    if not ciudad:
        raise HTTPException(status_code=404, detail="Ciudad no encontrada")
    return ciudad


# ─────────────────────────────
# CREAR CIUDAD
# ─────────────────────────────

@router.post("/crear_ciudad")
def crear_ciudad(
    nueva_ciudad: ciudadCreateDTO,
    db: Session = Depends(get_db)
):
    existente = (
        db.query(Ciudad)
        .filter(Ciudad.nombre == nueva_ciudad.nombre)
        .first()
    )

    if existente:
        raise HTTPException(status_code=400, detail="La ciudad ya existe")

    ciudad = Ciudad(nombre=nueva_ciudad.nombre)

    db.add(ciudad)
    db.commit()
    db.refresh(ciudad)

    return ciudad
