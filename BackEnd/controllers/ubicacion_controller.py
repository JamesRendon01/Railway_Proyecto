from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models.ubicacion import Ubicacion
from dtos.ubicacion_dto import (
    ubicacionCreateDTO,
    ubicacionUpdateDTO
)
from db.database import get_db

router = APIRouter(prefix="/ubicacion", tags=["Ubicacion"])


# =====================================================
# 🔹 LISTAR TODAS LAS UBICACIONES
# =====================================================
@router.get("/")
def listar_ubicaciones(db: Session = Depends(get_db)):
    ubicaciones = db.query(Ubicacion).all()
    if not ubicaciones:
        raise HTTPException(status_code=404, detail="No hay ubicaciones registradas")
    return ubicaciones


# =====================================================
# 🔹 LISTAR UBICACIÓN POR ID
# =====================================================
@router.get("/{id}")
def listar_por_id(id: int, db: Session = Depends(get_db)):
    ubicacion = db.query(Ubicacion).filter(Ubicacion.id == id).first()
    if not ubicacion:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")
    return ubicacion


# =====================================================
# 🔹 CREAR UBICACIÓN
# =====================================================
@router.post("/")
def crear_ubicacion(nueva: ubicacionCreateDTO, db: Session = Depends(get_db)):

    existente = db.query(Ubicacion).filter(
        (Ubicacion.longitud == nueva.longitud) &
        (Ubicacion.latitud == nueva.latitud)
    ).first()

    if existente:
        raise HTTPException(status_code=400, detail="La ubicación ya existe")

    ubicacion = Ubicacion(
        ciudad=nueva.ciudad,
        longitud=nueva.longitud,
        latitud=nueva.latitud,
        id_plan=nueva.id_plan
    )

    db.add(ubicacion)
    db.commit()
    db.refresh(ubicacion)

    return {
        "mensaje": "Ubicación creada correctamente",
        "ubicacion": ubicacion
    }


# =====================================================
# 🔹 ACTUALIZAR UBICACIÓN
# =====================================================
@router.put("/{id}")
def actualizar_ubicacion(
    id: int,
    datos: ubicacionUpdateDTO,
    db: Session = Depends(get_db)
):
    ubicacion = db.query(Ubicacion).filter(Ubicacion.id == id).first()
    if not ubicacion:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")

    for key, value in datos.dict(exclude_unset=True).items():
        setattr(ubicacion, key, value)

    db.commit()
    db.refresh(ubicacion)

    return {
        "mensaje": f"Ubicación con ID {id} actualizada correctamente"
    }


# =====================================================
# 🔹 ELIMINAR UBICACIÓN
# =====================================================
@router.delete("/{id}")
def eliminar_ubicacion(id: int, db: Session = Depends(get_db)):
    ubicacion = db.query(Ubicacion).filter(Ubicacion.id == id).first()
    if not ubicacion:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")

    db.delete(ubicacion)
    db.commit()

    return {
        "mensaje": f"Ubicación con ID {id} eliminada correctamente"
    }
