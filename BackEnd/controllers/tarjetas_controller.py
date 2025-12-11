from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from db import get_db
from models.tarjetas import Tarjeta
from dtos.tarjetas_dto import TarjetaCreate

router = APIRouter(prefix="/tarjeta", tags=["Tarjeta"])

@router.get("/{turista_id}")
def obtener_tarjeta_por_turista(turista_id: int, db: Session = Depends(get_db)):
    tarjeta = db.query(Tarjeta).filter(Tarjeta.turista_id == turista_id).first()
    if not tarjeta:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    return tarjeta


@router.post("/crear")
def crear_tarjeta(tarjeta: TarjetaCreate, db: Session = Depends(get_db)):
    # Verificar si el turista existe (opcional si la FK lo maneja)
    from models.turista import Turista
    turista = db.query(Turista).filter(Turista.id == tarjeta.turista_id).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Turista no encontrado")

    # Crear objeto Tarjeta
    nueva_tarjeta = Tarjeta(
        nombre=tarjeta.nombre,
        tipo_tarjeta=tarjeta.tipo_tarjeta,
        numero=tarjeta.numero,
        fecha_vencimiento=tarjeta.fecha_vencimiento,
        cvv=tarjeta.cvv,
        turista_id=tarjeta.turista_id,
    )

    db.add(nueva_tarjeta)
    db.commit()
    db.refresh(nueva_tarjeta)

    return nueva_tarjeta