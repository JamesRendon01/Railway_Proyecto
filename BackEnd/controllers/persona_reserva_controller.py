from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from db.session import SessionLocal
from models.persona_reserva import PersonaReserva
from models.reserva import Reserva
from dtos.persona_reserva_dto import PersonaReservaCreateDTO, PersonaReservaOut
from typing import List

router = APIRouter(prefix="/persona_reserva", tags=["Acompañantes"])

# Dependencia para sesión de BD
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# 🔹 Crear acompañante
# =====================================================
@router.post("/crear", response_model=PersonaReservaOut)
def crear_persona_reserva(datos: PersonaReservaCreateDTO, db: Session = Depends(get_session)):
    reserva = db.query(Reserva).filter(Reserva.id == datos.id_reserva).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    persona = PersonaReserva(
        nombre=datos.nombre,
        tipo_identificacion=datos.tipo_identificacion,
        identificacion=datos.identificacion,
        edad=datos.edad,
        id_reserva=datos.id_reserva
    )

    db.add(persona)
    db.commit()
    db.refresh(persona)
    return persona


# =====================================================
# 🔹 Listar acompañantes por reserva
# =====================================================
@router.get("/listar/{id_reserva}", response_model=List[PersonaReservaOut])
def listar_personas_por_reserva(id_reserva: int, db: Session = Depends(get_session)):
    personas = db.query(PersonaReserva).filter(PersonaReserva.id_reserva == id_reserva).all()
    if not personas:
        raise HTTPException(status_code=404, detail="No hay acompañantes registrados para esta reserva")
    return personas


# =====================================================
# 🔹 Eliminar acompañante
# =====================================================
@router.delete("/{id}")
def eliminar_persona_reserva(id: int, db: Session = Depends(get_session)):
    persona = db.query(PersonaReserva).filter(PersonaReserva.id == id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Acompañante no encontrado")

    db.delete(persona)
    db.commit()
    return {"message": f"Acompañante con ID {id} eliminado correctamente"}
