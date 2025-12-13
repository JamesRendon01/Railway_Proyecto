from fastapi import APIRouter, Depends, HTTPException, Query, Form, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List, Optional
import shutil
import os
import uuid

from db.database import get_db
from models.plan import Plan
from models.ciudad import Ciudad
from dtos.plan_dto import (
    planCreateDTO,
    planUpdateDTO,
    PlanOut,
    PlanCardOut,
    ListarPlanAdmin,
    planUpdateIdDTO
)

# ==========================================================
# 📁 Carpeta donde se guardan las imágenes de los planes
# ==========================================================
UPLOAD_DIR = "uploads/planes_img"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/plan", tags=["Planes"])

# ==========================================================
# ✅ Crear plan
# ==========================================================
@router.post("/crear-plan")
def crear_plan(
    nombre: str = Form(...),
    descripcion_corta: str = Form(...),
    descripcion: str = Form(...),
    costo_persona: float = Form(...),
    id_ciudad: Optional[int] = Form(None),
    mostrar_en_carrusel: bool = Form(False),
    imagen: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    filename = None

    if imagen:
        ext = os.path.splitext(imagen.filename)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(imagen.file, buffer)

    nuevo_plan = Plan(
        nombre=nombre,
        descripcion_corta=descripcion_corta,
        descripcion=descripcion,
        costo_persona=costo_persona,
        id_ciudad=id_ciudad,
        imagen=filename,
        mostrar_en_carrusel=mostrar_en_carrusel,
        fecha_creacion=datetime.utcnow()
    )

    db.add(nuevo_plan)
    db.commit()
    db.refresh(nuevo_plan)

    return {"detail": "Plan creado correctamente", "id": nuevo_plan.id}


# ==========================================================
# ✅ Actualizar plan
# ==========================================================
@router.put("/update/{id}")
def actualizar_plan(
    id: int,
    nombre: str = Form(...),
    descripcion_corta: str = Form(...),
    descripcion: str = Form(...),
    costo_persona: float = Form(...),
    id_ciudad: int = Form(...),
    mostrar_en_carrusel: bool = Form(False),
    imagen: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    plan = db.query(Plan).filter(Plan.id == id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")

    plan.nombre = nombre
    plan.descripcion_corta = descripcion_corta
    plan.descripcion = descripcion
    plan.costo_persona = costo_persona
    plan.id_ciudad = id_ciudad
    plan.mostrar_en_carrusel = mostrar_en_carrusel

    if imagen:
        ext = os.path.splitext(imagen.filename)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(imagen.file, buffer)
        plan.imagen = filename

    db.commit()
    db.refresh(plan)

    return {"detail": "Plan actualizado correctamente", "id": plan.id}


# ==========================================================
# ✅ Listar planes (admin)
# ==========================================================
@router.get("/listar-planes", response_model=List[ListarPlanAdmin])
def listar_plan(db: Session = Depends(get_db)):
    planes = (
        db.query(Plan)
        .outerjoin(Ciudad, Plan.id_ciudad == Ciudad.id)
        .order_by(func.lower(func.trim(Ciudad.nombre)))
        .all()
    )

    if not planes:
        raise HTTPException(status_code=404, detail="No hay planes registrados")

    return [
        {
            "id": p.id,
            "nombre": p.nombre,
            "descripcion_corta": p.descripcion_corta,
            "descripcion": p.descripcion,
            "costo_persona": p.costo_persona,
            "id_ciudad": p.ciudad.nombre if p.ciudad else None,
            "mostrar_en_carrusel": p.mostrar_en_carrusel,
            "ubicaciones": [u.id for u in (p.ubicaciones or [])],
        }
        for p in planes
    ]


# ==========================================================
# ✅ Obtener plan por ID
# ==========================================================
@router.get("/listar-plan-id/{id}", response_model=planUpdateIdDTO)
def obtener_plan_id(id: int, db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    return plan


# ==========================================================
# ✅ Eliminar plan
# ==========================================================
@router.delete("/delete/{id}")
def eliminar_plan(id: int, db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")

    db.delete(plan)
    db.commit()

    return {"detail": f"Plan con ID {id} eliminado correctamente"}


# ==========================================================
# ✅ Carrusel
# ==========================================================
@router.get("/listar-carrusel")
def listar_planes_carrusel(db: Session = Depends(get_db)):
    planes = db.query(Plan).filter(Plan.mostrar_en_carrusel.is_(True)).all()
    if not planes:
        return []

    return [
        {
            "id": p.id,
            "nombre": p.nombre,
            "descripcion_corta": p.descripcion_corta,
            "imagen": p.imagen,
        }
        for p in planes
    ]


# ==========================================================
# ✅ Cards
# ==========================================================
@router.get("/card_planes")
def obtener_planes_card(db: Session = Depends(get_db)):
    planes = db.query(Plan).all()
    if not planes:
        return []

    return [
        {
            "id": p.id,
            "nombre": p.nombre,
            "descripcion_corta": p.descripcion_corta,
            "descripcion": p.descripcion,
            "imagen": p.imagen,
            "costo_persona": p.costo_persona,
            "ciudad": p.ciudad.nombre if p.ciudad else None,
        }
        for p in planes
    ]


# ==========================================================
# ✅ Buscar
# ==========================================================
@router.get("/buscar", response_model=List[PlanCardOut])
def buscar_planes(query: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    planes = db.query(Plan).filter(
        Plan.nombre.ilike(f"%{query}%") |
        Plan.descripcion.ilike(f"%{query}%")
    ).all()

    return planes


# ==========================================================
# ✅ Estadísticas
# ==========================================================
@router.get("/estadisticas")
def estadisticas_planes(db: Session = Depends(get_db)):
    resultados = (
        db.query(
            func.date_format(Plan.fecha_creacion, "%Y-%m").label("mes"),
            func.count(Plan.id).label("total_planes"),
        )
        .group_by(func.date_format(Plan.fecha_creacion, "%Y-%m"))
        .order_by(func.date_format(Plan.fecha_creacion, "%Y-%m"))
        .all()
    )

    return {
        "data": [
            {"mes": r.mes, "total_planes": r.total_planes}
            for r in resultados
        ]
    }
