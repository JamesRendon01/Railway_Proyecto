from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from models.plan import Plan  # tu modelo Plan
from db.session import SessionLocal # tu función de sesión

def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
#objeto que contiene este grupo
#rutas
router = APIRouter( prefix='/filtro' )

@router.get("/", response_model=List[dict])
def listar_filtros(db: Session = Depends(get_session)):
    """
    Devuelve la lista de filtros únicos de Plan:
    pais, ciudad y lugar
    """
    planes = db.query(Plan).all()

    filtros = []
    for plan in planes:
        filtros.append({
            "pais": "Colombia", # suposición: ciudad tiene país
            "ciudad": plan.ciudad.nombre if plan.ciudad else None,
            "lugar": plan.nombre  # asumimos que "nombre" del plan es el lugar
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
