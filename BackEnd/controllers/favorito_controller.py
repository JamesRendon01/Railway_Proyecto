from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from models.favorito import Favorito
from dtos.favorito_dto import favoritoCreateDTO
from db.database import get_db

router = APIRouter(prefix="/favorito", tags=["Favoritos"])


# ─────────────────────────────
# LISTAR FAVORITOS
# ─────────────────────────────

@router.get("/")
def listar_favoritos(
    user_id: int = Query(..., description="ID del turista"),
    db: Session = Depends(get_db)
):
    favoritos = (
        db.query(Favorito)
        .filter(Favorito.id_turista == user_id)
        .all()
    )
    return favoritos


# ─────────────────────────────
# CREAR FAVORITO
# ─────────────────────────────

@router.post("/")
def crear_favorito(
    nuevo_favorito: favoritoCreateDTO,
    db: Session = Depends(get_db)
):
    existe = (
        db.query(Favorito)
        .filter(
            Favorito.id_turista == nuevo_favorito.id_turista,
            Favorito.id_plan == nuevo_favorito.id_plan,
        )
        .first()
    )

    if existe:
        raise HTTPException(status_code=400, detail="Favorito ya existe")

    favorito = Favorito(
        id_turista=nuevo_favorito.id_turista,
        id_plan=nuevo_favorito.id_plan,
    )

    db.add(favorito)
    db.commit()
    db.refresh(favorito)

    return favorito


# ─────────────────────────────
# ELIMINAR FAVORITO
# ─────────────────────────────

@router.delete("/")
def eliminar_favorito(
    user_id: int = Query(..., description="ID del turista"),
    plan_id: int = Query(..., description="ID del plan"),
    db: Session = Depends(get_db)
):
    favorito = (
        db.query(Favorito)
        .filter(
            Favorito.id_turista == user_id,
            Favorito.id_plan == plan_id,
        )
        .first()
    )

    if not favorito:
        raise HTTPException(status_code=404, detail="Favorito no encontrado")

    db.delete(favorito)
    db.commit()

    return {
        "detail": f"Favorito eliminado: usuario {user_id}, plan {plan_id}"
    }
