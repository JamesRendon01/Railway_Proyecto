from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form
from sqlalchemy.orm import Session
from datetime import datetime
import os, shutil

from db.database import get_db
from models.informe import Informe
from models.administrador import Administrador

router = APIRouter(prefix="/informe", tags=["Informes"])

# 📁 Carpeta para PDFs
CARPETA_INFORMES = os.path.join(os.getcwd(), "uploads", "informes")
os.makedirs(CARPETA_INFORMES, exist_ok=True)


# 📄 Crear informe con PDF
@router.post("/")
async def crear_informe(
    nombre: str = Form(...),
    id_administrador: int = Form(...),
    archivo: UploadFile | None = None,
    db: Session = Depends(get_db)
):
    # Validar duplicado
    existente = db.query(Informe).filter(Informe.nombre == nombre).first()
    if existente:
        raise HTTPException(status_code=400, detail="Informe ya existe")

    ruta_archivo = None

    if archivo:
        filename = f"{nombre}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
        ruta_archivo = os.path.join(CARPETA_INFORMES, filename)
        with open(ruta_archivo, "wb") as buffer:
            shutil.copyfileobj(archivo.file, buffer)

    nuevo_informe = Informe(
        nombre=nombre,
        fecha_creacion=datetime.now(),
        id_administrador=id_administrador,
        ruta_pdf=ruta_archivo
    )

    db.add(nuevo_informe)
    db.commit()
    db.refresh(nuevo_informe)

    return {
        "mensaje": "Informe creado correctamente",
        "informe": nuevo_informe
    }


# 📋 Listar informes
@router.get("/listarInformes")
def listar_informes(db: Session = Depends(get_db)):
    informes = (
        db.query(Informe, Administrador)
        .join(Administrador, Informe.id_administrador == Administrador.id)
        .order_by(Informe.fecha_creacion.desc())
        .all()
    )

    return [
        {
            "id": informe.id,
            "nombre": informe.nombre,
            "fecha_creacion": informe.fecha_creacion,
            "administrador": admin.nombre,
            "ruta_pdf": informe.ruta_pdf,
        }
        for informe, admin in informes
    ]
