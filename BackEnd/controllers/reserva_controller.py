from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from datetime import datetime
import io

from db.database import get_db
from models.reserva import Reserva
from models.plan import Plan
from models.turista import Turista
from models.persona_reserva import PersonaReserva
from dtos.reserva_dto import reservaCreateDTO, reservaUpdateDTO, ReservaOut
from utils.jwt_manager import verify_access_token
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from mails.mailjet_config import enviar_comprobante

router = APIRouter(prefix="/reserva", tags=["Reserva"])


# =====================================================
# 🔹 Listar reservas del usuario / admin
# =====================================================
@router.get("/mis_reservas")
def listar_reservas_usuario(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    db: Session = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token no proporcionado")

    payload = verify_access_token(authorization.split(" ")[1])
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    user_id = int(payload.get("sub"))
    rol = payload.get("rol")

    if rol == "admin":
        reservas = db.query(Reserva).options(
            joinedload(Reserva.plan),
            joinedload(Reserva.turista),
        ).all()
    else:
        reservas = db.query(Reserva).options(
            joinedload(Reserva.plan),
            joinedload(Reserva.turista),
        ).filter(Reserva.id_turista == user_id).all()

    if not reservas:
        return []

    return [
        {
            "id": r.id,
            "fecha_reserva": str(r.fecha_reserva),
            "costo_final": r.costo_final,
            "disponibilidad": r.disponibilidad,
            "numero_personas": r.numero_personas,
            "plan_nombre": r.plan.nombre if r.plan else None,
            "plan_imagen": r.plan.imagen if r.plan else None,
            "turista_nombre": r.turista.nombre if r.turista else None,
            "comprobante_pdf": f"/reserva/comprobante/{r.id}" if r.comprobante_pdf else None,
        }
        for r in reservas
    ]


# =====================================================
# 🔹 Crear reserva
# =====================================================
@router.post("/crear_reserva", response_model=ReservaOut)
def crear_reserva(
    nuevo: reservaCreateDTO,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    db: Session = Depends(get_db),
):
    from models.tarjetas import Tarjeta

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token no proporcionado")

    payload = verify_access_token(authorization.split(" ")[1])
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")

    turista_id = int(payload.get("sub"))

    plan = db.query(Plan).filter(Plan.id == nuevo.id_plan).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")

    existente = db.query(Reserva).filter(
        Reserva.id_turista == turista_id,
        Reserva.id_plan == nuevo.id_plan,
    ).first()

    if existente:
        raise HTTPException(status_code=400, detail="Ya tienes una reserva para este plan")

    costo_final = nuevo.numero_personas * plan.costo_persona

    reserva = Reserva(
        fecha_reserva=nuevo.fecha_reserva,
        costo_final=costo_final,
        disponibilidad=nuevo.disponibilidad,
        numero_personas=nuevo.numero_personas,
        id_plan=nuevo.id_plan,
        id_turista=turista_id,
    )

    db.add(reserva)
    db.commit()
    db.refresh(reserva)

    if nuevo.acompanantes:
        for a in nuevo.acompanantes:
            db.add(PersonaReserva(
                nombre=a.nombre,
                tipo_identificacion=a.tipo_identificacion,
                identificacion=a.identificacion,
                edad=a.edad,
                id_reserva=reserva.id,
            ))
        db.commit()

    # =====================================================
    # 📄 Generar PDF
    # =====================================================
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawCentredString(300, 750, "COMPROBANTE DE PAGO")
    pdf.setFont("Helvetica", 11)
    pdf.drawString(50, 700, f"Plan: {plan.nombre}")
    pdf.drawString(50, 680, f"Personas: {reserva.numero_personas}")
    pdf.drawString(50, 660, f"Total: ${costo_final:,}")
    pdf.drawString(50, 640, f"Fecha: {datetime.now().strftime('%d/%m/%Y')}")
    pdf.save()

    buffer.seek(0)
    reserva.comprobante_pdf = buffer.getvalue()
    db.commit()

    try:
        enviar_comprobante(reserva, reserva.comprobante_pdf)
    except Exception as e:
        print("⚠️ Error correo:", e)

    return ReservaOut(
        id=reserva.id,
        fecha_reserva=str(reserva.fecha_reserva),
        costo_final=costo_final,
        disponibilidad=reserva.disponibilidad,
        numero_personas=reserva.numero_personas,
        id_plan=plan.id,
        plan_nombre=plan.nombre,
        id_turista=turista_id,
        turista_nombre=reserva.turista.nombre if reserva.turista else "",
    )


# =====================================================
# 🔹 Obtener comprobante
# =====================================================
@router.get("/comprobante/{id}")
def obtener_comprobante(id: int, db: Session = Depends(get_db)):
    reserva = db.query(Reserva).filter(Reserva.id == id).first()
    if not reserva or not reserva.comprobante_pdf:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")

    from fastapi.responses import Response
    return Response(reserva.comprobante_pdf, media_type="application/pdf")


# =====================================================
# 🔹 Actualizar reserva
# =====================================================
@router.put("/{id}")
def actualizar_reserva(id: int, datos: reservaUpdateDTO, db: Session = Depends(get_db)):
    reserva = db.query(Reserva).filter(Reserva.id == id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    for k, v in datos.dict(exclude_unset=True).items():
        setattr(reserva, k, v)

    db.commit()
    return {"message": "Reserva actualizada correctamente"}


# =====================================================
# 🔹 Eliminar reserva
# =====================================================
@router.delete("/{id}")
def eliminar_reserva(id: int, db: Session = Depends(get_db)):
    reserva = db.query(Reserva).filter(Reserva.id == id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    db.delete(reserva)
    db.commit()
    return {"message": "Reserva eliminada correctamente"}


# =====================================================
# 🔹 Fechas ocupadas
# =====================================================
@router.get("/disponibilidad/{id_plan}")
def fechas_ocupadas(id_plan: int, db: Session = Depends(get_db)):
    fechas = db.query(Reserva.fecha_reserva).filter(
        Reserva.id_plan == id_plan
    ).all()

    return {
        "fechas_ocupadas": [f[0].strftime("%Y-%m-%d") for f in fechas]
    }
