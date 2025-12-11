from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from typing import Optional
from db.session import SessionLocal
from models.reserva import Reserva
from models.plan import Plan
from models.ciudad import Ciudad

router = APIRouter(prefix="/graficas", tags=["Gráficas"])

# ==========================================================
# 🧩 Dependencia de sesión
# ==========================================================
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==========================================================
# 🔁 Formatos SQL seguros
# ==========================================================
def obtener_formato(agrupacion: str):
    formatos = {
        "dia": "%Y-%m-%d",
        "semana": "%Y-W%v",  # Año-Semana ISO, con prefijo 'W'
        "mes": "%Y-%m",
        "anio": "%Y",
    }
    formato = formatos.get(agrupacion)
    if not formato:
        raise HTTPException(
            status_code=400,
            detail="Valor de 'agrupacion' inválido. Use: dia, semana, mes o anio.",
        )
    return formato


# ==========================================================
# 🏙️ Ciudades con más reservas
# ==========================================================
@router.get("/ciudades_mas_reservas")
def ciudades_mas_reservas(
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin: Optional[date] = Query(None),
    db: Session = Depends(get_session)
):
    query = (
        db.query(
            Ciudad.nombre.label("ciudad"),
            func.count(Reserva.id).label("total_reservas")
        )
        .join(Plan, Plan.id == Reserva.id_plan)
        .join(Ciudad, Ciudad.id == Plan.id_ciudad)
    )

    if fecha_inicio:
        query = query.filter(Reserva.fecha_reserva >= fecha_inicio)
    if fecha_fin:
        query = query.filter(Reserva.fecha_reserva <= fecha_fin)

    resultados = (
        query.group_by(Ciudad.nombre)
        .order_by(func.count(Reserva.id).desc())
        .all()
    )

    return {"data": [{"ciudad": r.ciudad, "total_reservas": r.total_reservas} for r in resultados]}


# ==========================================================
# 📆 Planes por periodo
# ==========================================================
@router.get("/planes_por_periodo")
def planes_por_periodo(
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin: Optional[date] = Query(None),
    agrupacion: str = Query("mes"),
    db: Session = Depends(get_session),
):
    formato = obtener_formato(agrupacion)

    query = db.query(
        func.date_format(Plan.fecha_creacion, formato).label("periodo"),
        func.count(Plan.id).label("total_planes"),
    )

    if fecha_inicio:
        query = query.filter(Plan.fecha_creacion >= fecha_inicio)
    if fecha_fin:
        query = query.filter(Plan.fecha_creacion <= fecha_fin)

    resultados = (
        query.group_by(func.date_format(Plan.fecha_creacion, formato))
        .order_by(func.date_format(Plan.fecha_creacion, formato))
        .all()
    )

    # 🔹 Garantizar formato consistente (cero padding)
    data = []
    for r in resultados:
        periodo = r.periodo
        # Asegura que los meses tengan 2 dígitos (YYYY-MM)
        if agrupacion == "mes" and len(periodo.split("-")[1]) == 1:
            partes = periodo.split("-")
            periodo = f"{partes[0]}-0{partes[1]}"
        data.append({"periodo": periodo, "total_planes": r.total_planes})

    return {"data": data}


# ==========================================================
# 🗓️ Reservas por periodo
# ==========================================================
@router.get("/reservas_por_periodo")
def reservas_por_periodo(
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin: Optional[date] = Query(None),
    agrupacion: str = Query("mes"),
    db: Session = Depends(get_session),
):
    formato = obtener_formato(agrupacion)

    query = db.query(
        func.date_format(Reserva.fecha_reserva, formato).label("periodo"),
        func.count(Reserva.id).label("total_reservas"),
    )

    if fecha_inicio:
        query = query.filter(Reserva.fecha_reserva >= fecha_inicio)
    if fecha_fin:
        query = query.filter(Reserva.fecha_reserva <= fecha_fin)

    resultados = (
        query.group_by(func.date_format(Reserva.fecha_reserva, formato))
        .order_by(func.date_format(Reserva.fecha_reserva, formato))
        .all()
    )

    # 🔹 Asegurar formato legible (YYYY-MM-DD o YYYY-MM)
    data = []
    for r in resultados:
        periodo = r.periodo
        if agrupacion == "mes" and len(periodo.split("-")[1]) == 1:
            partes = periodo.split("-")
            periodo = f"{partes[0]}-0{partes[1]}"
        data.append({"periodo": periodo, "total_reservas": r.total_reservas})

    return {"data": data}
