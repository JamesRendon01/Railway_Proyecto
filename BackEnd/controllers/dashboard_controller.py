from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from db.session import SessionLocal
from models.plan import Plan
from models.reserva import Reserva
from models.turista import Turista
from models.informe import Informe
from datetime import date, datetime, timezone, timedelta

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

COLOMBIA_TZ = timezone(timedelta(hours=-5))

# Dependency para obtener sesión
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Totales generales (planes, reservas, turistas) ---
@router.get("/totales")
def obtener_totales_generales(db: Session = Depends(get_session)):
    total_planes = db.query(func.count(Plan.id)).scalar() or 0
    total_reservas = db.query(func.count(Reserva.id)).scalar() or 0
    total_turistas = db.query(func.count(Turista.id)).scalar() or 0

    return {
        "total_planes": total_planes,
        "total_reservas": total_reservas,
        "total_turistas": total_turistas
    }

# --- Estadísticas de reservas ---
@router.get("/reservas")
def obtener_estadisticas_reservas(db: Session = Depends(get_session)):
    hoy = date.today()

    total_reservas = db.query(func.count(Reserva.id)).scalar() or 0
    reservas_hoy = (
        db.query(func.count(Reserva.id))
        .filter(func.date(Reserva.fecha_reserva) == hoy)
        .scalar()
        or 0
    )
    total_ingresos = db.query(func.sum(Reserva.costo_final)).scalar() or 0

    return {
        "total_reservas": total_reservas,
        "reservas_hoy": reservas_hoy,
        "total_ingresos": total_ingresos
    }

@router.get("/total_planes")
def obtener_totales_planes(db: Session = Depends(get_session)):
    hoy = date.today()
    total_planes = db.query(func.count(Plan.id)).scalar() or 0
    planes_hoy = (
        db.query(func.count(Plan.id))
        .filter(func.date(Plan.fecha_creacion) == hoy)
        .scalar()
        or 0
    )

    return {
        "total_planes": total_planes,
        "planes_hoy": planes_hoy
    }

@router.get("/dashboardListarTuristas")
def obtener_totales_turistas(db: Session = Depends(get_session)):
    hoy_colombia = datetime.now(COLOMBIA_TZ).date()
    total_turistas = db.query(func.count(Turista.id)).scalar() or 0
    registrados_hoy = (
        db.query(func.count(Turista.id))
        .filter(func.date(Turista.fecha_registro) == hoy_colombia)
        .scalar()
        or 0
    )

    return {
        "total_turistas": total_turistas,
        "registrados_hoy": registrados_hoy
    }

@router.get("/dashboardListarnformes")
def obtener_totales_informes(db: Session = Depends(get_session)):
    hoy_colombia = datetime.now(COLOMBIA_TZ).date()
    total_informes = db.query(func.count(Informe.id)).scalar() or 0
    informes_hoy = (
        db.query(func.count(Informe.id))
        .filter(func.date(Informe.fecha_creacion) == hoy_colombia)
        .scalar()
        or 0
    )

    return {
        "total_informes": total_informes,
        "informes_hoy": informes_hoy
    }

# --- NUEVOS ENDPOINTS PARA GRAFICAS DINAMICAS ---

@router.get("/resumenReservasPlanes")
def resumen_reservas_por_plan(db: Session = Depends(get_session)):
    """
    Devuelve un resumen de reservas y turistas por plan.
    Listo para gráfica de barras apiladas al 100%
    """
    resultados = (
        db.query(
            Plan.nombre.label("plan"),
            func.count(Reserva.id_turista).label("turistas"),
            func.count(Reserva.id).label("reservas")
        )
        .join(Reserva, Reserva.id_plan == Plan.id)
        .group_by(Plan.nombre)
        .all()
    )

    return [{"plan": r.plan, "turistas": r.turistas, "reservas": r.reservas} for r in resultados]

@router.get("/listarPlanes")
def listar_planes(db: Session = Depends(get_session)):
    """
    Lista todos los planes
    """
    planes = db.query(Plan).all()
    return [{"id": p.id, "nombre": p.nombre, "descripcion": p.descripcion} for p in planes]

@router.get("/listarTuristas")
def listar_turistas(db: Session = Depends(get_session)):
    """
    Lista todos los turistas
    """
    turistas = db.query(Turista).all()
    return [{"id": t.id, "nombre": t.nombre, "correo": t.correo} for t in turistas]
