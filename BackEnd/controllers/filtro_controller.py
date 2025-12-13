from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from models.plan import Plan
from db.database import get_db

router = APIRouter(prefix="/filtro", tags=["Filtro"])


@router.get("/", response_model=List[dict])
def listar_filtros(db: Session = Depends(get_db)):
    """
    Devuelve la lista de filtros únicos de Plan:
    pais, ciudad y lugar
    """

    planes = db.query(Plan).all()

    filtros = []
    for plan in planes:
        filtros.append({
            "pais": "Colombia",  # valor fijo según tu lógica actual
            "ciudad": plan.ciudad.nombre if plan.ciudad else None,
            "lugar": plan.nombre
        })

    # Eliminar duplicados
    filtros_unicos = []
    vistos = set()

    for f in filtros:
        key = (f["pais"], f["ciudad"], f["lugar"])
        if key not in vistos:
            vistos.add(key)
            filtros_unicos.append(f)

    return filtros_unicos
