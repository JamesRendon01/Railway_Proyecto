from fastapi import APIRouter, Depends, HTTPException, Query, Form, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from models.plan import Plan
from models.ciudad import Ciudad
from dtos.plan_dto import planCreateDTO, planUpdateDTO, PlanOut, PlanCardOut, ListarPlanAdmin, planUpdateIdDTO
from db.session import SessionLocal
from typing import List, Optional
import shutil
import os
import uuid

# 📁 Carpeta donde se guardan las imágenes de los planes
UPLOAD_DIR = "uploads/planes_img"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ==========================================================
# 🔹 Obtener sesión de base de datos
# ==========================================================
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================================
# 🔹 Creación del router
# ==========================================================
router = APIRouter(prefix="/plan", tags=["Planes"])

# ==========================================================
# ✅ Crear plan (incluye campo mostrar_en_carrusel)
# ==========================================================
@router.post("/crear-plan")
def crear_plan(
    nombre: str = Form(...),
    descripcion_corta: str = Form(...),
    descripcion: str = Form(...),
    costo_persona: float = Form(...),
    id_ciudad: Optional[int] = Form(None),
    mostrar_en_carrusel: bool = Form(False),  # ✅ Nuevo campo
    imagen: Optional[UploadFile] = File(None),
    db: Session = Depends(get_session),
):
    filename = None

    # Guardar imagen si se envía
    if imagen:
        ext = os.path.splitext(imagen.filename)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(imagen.file, buffer)

    # Crear plan en la DB
    nuevo_plan = Plan(
        nombre=nombre,
        descripcion_corta=descripcion_corta,
        descripcion=descripcion,
        costo_persona=costo_persona,
        id_ciudad=id_ciudad,
        imagen=filename,
        mostrar_en_carrusel=mostrar_en_carrusel,  # ✅ Guardar valor del checkbox
    )
    db.add(nuevo_plan)
    db.commit()
    db.refresh(nuevo_plan)

    return {"detail": "Plan creado correctamente", "id": nuevo_plan.id}


# ==========================================================
# ✅ Actualizar plan (incluye campo mostrar_en_carrusel)
# ==========================================================
@router.put("/update/{id}")
def actualizar_plan(
    id: int,
    nombre: str = Form(...),
    descripcion_corta: str = Form(...),
    descripcion: str = Form(...),
    costo_persona: float = Form(...),
    id_ciudad: int = Form(...),
    mostrar_en_carrusel: bool = Form(False),  # ✅ Nuevo campo
    imagen: UploadFile = File(None),
    db: Session = Depends(get_session),
):
    plan = db.query(Plan).filter(Plan.id == id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")

    # Actualiza campos
    plan.nombre = nombre
    plan.descripcion_corta = descripcion_corta
    plan.descripcion = descripcion
    plan.costo_persona = costo_persona
    plan.id_ciudad = id_ciudad
    plan.mostrar_en_carrusel = mostrar_en_carrusel  # ✅ Actualizar estado

    # Guardar nueva imagen si se envía
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
# ✅ Listar todos los planes (ordenados por ciudad)
# ==========================================================
@router.get("/listar-planes", response_model=List[ListarPlanAdmin])
def listar_plan(db: Session = Depends(get_session)):
    planes = (
        db.query(Plan)
        .join(Ciudad, Plan.id_ciudad == Ciudad.id)
        .order_by(func.lower(func.trim(Ciudad.nombre)))
        .all()
    )

    if not planes:
        raise HTTPException(status_code=404, detail="No hay Planes registrados")

    result = [
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
    return result


# ==========================================================
# ✅ Listar plan por ID
# ==========================================================
@router.get("/listar-plan-id/{id}", response_model=planUpdateIdDTO)
def obtener_plan_id(id: int, db: Session = Depends(get_session)):
    plan = db.query(Plan).filter(Plan.id == id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    return plan


# ==========================================================
# ✅ Eliminar plan
# ==========================================================
@router.delete("/delete/{id}")
def eliminar_plan(id: int, db: Session = Depends(get_session)):
    plan = db.query(Plan).filter(Plan.id == id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    db.delete(plan)
    db.commit()
    return {"detail": f"Se eliminó con éxito el Plan con ID: {id}"}


# ==========================================================
# ✅ Listar solo los planes visibles en carrusel
# ==========================================================
@router.get("/listar-carrusel")
def listar_planes_carrusel(db: Session = Depends(get_session)):
    planes = db.query(Plan).filter(Plan.mostrar_en_carrusel == True).all()
    if not planes:
        raise HTTPException(status_code=404, detail="No hay planes para mostrar en el carrusel")

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
# ✅ Listar planes para las cards
# ==========================================================
@router.get("/card_planes")
def obtener_planes_card(db: Session = Depends(get_session)):
    resultados = db.query(Plan).all()
    if not resultados:
        raise HTTPException(status_code=404, detail="No hay planes disponibles")

    return [
        {
            "id": r.id,
            "nombre": r.nombre,
            "descripcion_corta": r.descripcion_corta,
            "descripcion": r.descripcion,
            "imagen": r.imagen,
            "costo_persona": r.costo_persona,
            "ciudad": r.ciudad.nombre if r.ciudad else None,
        }
        for r in resultados
    ]


# ==========================================================
# ✅ Buscar planes por nombre o descripción
# ==========================================================
@router.get("/buscar", response_model=List[PlanCardOut])
def buscar_planes(query: str = Query(..., min_length=1), db: Session = Depends(get_session)):
    resultados = db.query(Plan).filter(
        (Plan.nombre.ilike(f"%{query}%")) | (Plan.descripcion.ilike(f"%{query}%"))
    ).all()

    if not resultados:
        return []

    return [
        {
            "id": p.id,
            "nombre": p.nombre,
            "descripcion_corta": p.descripcion_corta,
            "descripcion": p.descripcion,
            "imagen": p.imagen,
        }
        for p in resultados
    ]


# ==========================================================
#Estadísticas de planes creados por mes
# ==========================================================
@router.get("/estadisticas")
def estadisticas_planes(db: Session = Depends(get_session)):
    resultados = (
        db.query(
            func.date_format(Plan.fecha_creacion, "%Y-%m").label("mes"),
            func.count(Plan.id).label("total_planes"),
        )
        .group_by(func.date_format(Plan.fecha_creacion, "%Y-%m"))
        .order_by(func.date_format(Plan.fecha_creacion, "%Y-%m"))
        .all()
    )

    return {"data": [{"mes": r.mes, "total_planes": r.total_planes} for r in resultados]}
