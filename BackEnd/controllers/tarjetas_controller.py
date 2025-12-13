from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models.tarjetas import Tarjeta
from dtos.tarjetas_dto import TarjetaCreate
from models.turista import Turista

router = APIRouter(prefix="/tarjeta", tags=["Tarjeta"])


@router.get("/{turista_id}")
def obtener_tarjeta_por_turista(turista_id: int, db: Session = Depends(get_db)):
    tarjeta = db.query(Tarjeta).filter(Tarjeta.turista_id == turista_id).first()
    if not tarjeta:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")

    return {
        "id": tarjeta.id,
        "nombre": tarjeta.nombre,
        "tipo_tarjeta": tarjeta.tipo_tarjeta,
        "ultimos_4": tarjeta.numero[-4:],  # 🔐 seguro
        "fecha_vencimiento": tarjeta.fecha_vencimiento
    }


@router.post("/crear")
def crear_tarjeta(tarjeta: TarjetaCreate, db: Session = Depends(get_db)):
    turista = db.query(Turista).filter(Turista.id == tarjeta.turista_id).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Turista no encontrado")

    nueva_tarjeta = Tarjeta(
        nombre=tarjeta.nombre,
        tipo_tarjeta=tarjeta.tipo_tarjeta,
        numero=tarjeta.numero[-4:],   # 🔐 SOLO últimos 4
        fecha_vencimiento=tarjeta.fecha_vencimiento,
        cvv=None,                     # ❌ NO guardar CVV
        turista_id=tarjeta.turista_id,
    )

    db.add(nueva_tarjeta)
    db.commit()
    db.refresh(nueva_tarjeta)

    return {"message": "Tarjeta registrada correctamente"}
