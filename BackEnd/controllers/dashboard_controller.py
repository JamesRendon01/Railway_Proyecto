from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime, timezone, timedelta

from models.plan import Plan
from models.reserva import Reserva
from models.turista import Turista
from models.informe import Informe
from db.database import get_db

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

COLOMBIA_TZ = timezone(timedelta(hours=-5))


# ─────────────────────────────
# TOTALES GENERALES
# ─────────────────────────────

@router.get("/totales")
def obtener_totales_generales(db: Session = Depends(get_db)):
    return {
        "total_planes": db.query(func.count(Plan.id)).scalar() or 0,
        "total_reservas": db.query(func.count(Reserva.id)).scalar() or 0,
        "total_turistas": db.query(func.count(Turista.id)).scalar() or 0,
    }


# ─────────────────────────────
# ESTADÍSTICAS DE RESERVAS
# ─────────────────────────────

@router.get("/reservas")
def obtener_estadisticas_reservas(db: Session = Depends(get_db)):
    hoy = date.today()

    return {
        "total_reservas": db.query(func.count(Reserva.id)).scalar() or 0,
        "reservas_hoy": (
            db.query(func.count(Reserva.id))
            .filter(func.date(Reserva.fecha_reserva) == hoy)
            .scalar()
            or 0
        ),
        "total_ingresos": db.query(func.sum(Reserva.costo_final)).scalar() or 0,
    }


@router.get("/total_planes")
def obtener_totales_planes(db: Session = Depends(get_db)):
    hoy = date.today()

    return {
        "total_planes": db.query(func.count(Plan.id)).scalar() or 0,
        "planes_hoy": (
            db.query(func.count(Plan.id))
            .filter(func.date(Plan.fecha_creacion) == hoy)
            .scalar()
            or 0
        ),
    }


# ─────────────────────────────
# TURISTAS
# ─────────────────────────────

@router.get("/dashboardListarTuristas")
def obtener_totales_turistas(db: Session = Depends(get_db)):
    hoy_colombia = datetime.now(COLOMBIA_TZ).date()

    return {
        "total_turistas": db.query(func.count(Turista.id)).scalar() or 0,
        "registrados_hoy": (
            db.query(func.count(Turista.id))
            .filter(func.date(Turista.fecha_registro) == hoy_colombia)
            .scalar()
            or 0
        ),
    }


# ─────────────────────────────
# INFORMES
# ─────────────────────────────

@router.get("/dashboardListarInformes")
def obtener_totales_informes(db: Session = Depends(get_db)):
    hoy_colombia = datetime.now(COLOMBIA_TZ).date()

    return {
        "total_informes": db.query(func.count(Informe.id)).scalar() or 0,
        "informes_hoy": (
            db.query(func.count(Informe.id))
            .filter(func.date(Informe.fecha_creacion) == hoy_colombia)
            .scalar()
            or 0
        ),
    }


# ─────────────────────────────
# GRAFICAS
# ─────────────────────────────

@router.get("/resumenReservasPlanes")
def resumen_reservas_por_plan(db: Session = Depends(get_db)):
    resultados = (
        db.query(
            Plan.nombre.label("plan"),
            func.count(Reserva.id_turista).label("turistas"),
            func.count(Reserva.id).label("reservas"),
        )
        .join(Reserva, Reserva.id_plan == Plan.id)
        .group_by(Plan.nombre)
        .all()
    )

    return [
        {"plan": r.plan, "turistas": r.turistas, "reservas": r.reservas}
        for r in resultados
    ]


# ─────────────────────────────
# LISTADOS
# ─────────────────────────────

@router.get("/listarPlanes")
def listar_planes(db: Session = Depends(get_db)):
    planes = db.query(Plan).all()
    return [
        {"id": p.id, "nombre": p.nombre, "descripcion": p.descripcion}
        for p in planes
    ]


@router.get("/listarTuristas")
def listar_turistas(db: Session = Depends(get_db)):
    turistas = db.query(Turista).all()
    return [
        {"id": t.id, "nombre": t.nombre, "correo": t.correo}
        for t in turistas
    ]
