from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import Optional
from random import randint
import uuid

from db.database import get_db
from models.turista import Turista
from models.ciudad import Ciudad

from dtos.turista_dto import (
    turistaCreateDTO,
    turistaUpdateDTO,
    iniciarSesionDTO,
    SolicitudRecuperacion,
    CambiarContrasenaDTO,
    VerificarPinDTO
)

from utils.security import hash_password, verify_password
from utils.jwt_manager import create_access_token
from utils.dependencies import get_current_user

from mails.mailjet_config import (
    enviar_correo_recuperacion,
    enviar_correo_bienvenida
)

router = APIRouter(prefix="/turista", tags=["Turista"])

# Zona horaria Colombia
COLOMBIA_TZ = timezone(timedelta(hours=-5))

# =====================================================
# 🔹 LISTAR TODOS LOS TURISTAS
# =====================================================
@router.get("/TotalTuristas")
def listar_turistas(db: Session = Depends(get_db)):
    turistas = (
        db.query(Turista, Ciudad.nombre.label("ciudad"))
        .join(Ciudad, Turista.ciudad_id == Ciudad.id, isouter=True)
        .order_by(Ciudad.nombre.asc())
        .all()
    )

    if not turistas:
        raise HTTPException(status_code=404, detail="No hay turistas registrados")

    return [
        {
            "nombre": t.nombre,
            "correo": t.correo,
            "tipo_identificacion": t.tipo_identificacion,
            "identificacion": t.identificacion,
            "celular": t.celular,
            "direccion": t.direccion,
            "ciudad": ciudad or "Sin ciudad"
        }
        for t, ciudad in turistas
    ]


# =====================================================
# 🔹 LISTAR TURISTA POR ID
# =====================================================
@router.get("/{id}")
def listar_por_id(id: int, db: Session = Depends(get_db)):
    turista = db.query(Turista).filter(Turista.id == id).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Turista no encontrado")
    return turista


# =====================================================
# 🔹 REGISTRAR TURISTA
# =====================================================
@router.post("/registrar")
def crear_turista(nuevo: turistaCreateDTO, db: Session = Depends(get_db)):

    if db.query(Turista).filter(Turista.correo == nuevo.correo).first():
        raise HTTPException(status_code=409, detail="Correo ya registrado")

    if db.query(Turista).filter(Turista.celular == nuevo.celular).first():
        raise HTTPException(status_code=409, detail="Celular ya registrado")

    if db.query(Turista).filter(Turista.identificacion == nuevo.identificacion).first():
        raise HTTPException(status_code=409, detail="Identificación ya registrada")

    ciudad = db.query(Ciudad).filter(Ciudad.id == nuevo.ciudad_residencia_id).first()
    if not ciudad:
        raise HTTPException(status_code=400, detail="Ciudad no válida")

    turista = Turista(
        nombre=nuevo.nombre,
        correo=nuevo.correo,
        celular=nuevo.celular,
        fecha_nacimiento=nuevo.fecha_nacimiento,
        direccion=nuevo.direccion,
        ciudad_id=nuevo.ciudad_residencia_id,
        tipo_identificacion=nuevo.tipo_identificacion,
        identificacion=nuevo.identificacion,
        contrasena=hash_password(nuevo.contrasena),
        acepto_terminos=nuevo.acepto_terminos
    )

    db.add(turista)
    db.commit()
    db.refresh(turista)

    enviar_correo_bienvenida(turista.correo, turista.nombre)

    return turista


# =====================================================
# 🔹 ACTUALIZAR TURISTA
# =====================================================
@router.put("/{id}")
def actualizar_turista(id: int, datos: turistaUpdateDTO, db: Session = Depends(get_db)):
    turista = db.query(Turista).filter(Turista.id == id).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Turista no encontrado")

    if datos.ciudad_residencia_id:
        ciudad = db.query(Ciudad).filter(Ciudad.id == datos.ciudad_residencia_id).first()
        if not ciudad:
            raise HTTPException(status_code=400, detail="Ciudad no válida")

    for key, value in datos.dict(exclude_unset=True).items():
        setattr(turista, key, value)

    db.commit()
    db.refresh(turista)

    return {"mensaje": "Turista actualizado correctamente"}


# =====================================================
# 🔹 ELIMINAR TURISTA (ADMIN)
# =====================================================
@router.delete("/delete/{id}")
def eliminar_turista(id: int, db: Session = Depends(get_db)):
    turista = db.query(Turista).filter(Turista.id == id).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Turista no encontrado")

    db.delete(turista)
    db.commit()
    return {"mensaje": "Turista eliminado correctamente"}


# =====================================================
# 🔹 INICIAR SESIÓN
# =====================================================
@router.post("/iniciarsesion")
def iniciar_sesion(datos: iniciarSesionDTO, db: Session = Depends(get_db)):
    turista = db.query(Turista).filter(Turista.correo == datos.correo).first()
    if not turista:
        raise HTTPException(status_code=401, detail="Correo no registrado")

    if turista.bloqueado_hasta and datetime.utcnow() < turista.bloqueado_hasta:
        hora = turista.bloqueado_hasta.replace(tzinfo=timezone.utc).astimezone(COLOMBIA_TZ)
        raise HTTPException(
            status_code=403,
            detail=f"Cuenta bloqueada hasta {hora.strftime('%Y-%m-%d %H:%M:%S')}"
        )

    if not verify_password(datos.contrasena, turista.contrasena):
        turista.intentos_fallidos += 1
        if turista.intentos_fallidos >= 5:
            turista.intentos_fallidos = 0
            turista.bloqueado_hasta = datetime.utcnow() + timedelta(minutes=5)
        db.commit()
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    turista.intentos_fallidos = 0
    turista.bloqueado_hasta = None
    db.commit()

    token = create_access_token(
        data={"sub": str(turista.id), "correo": turista.correo, "rol": "turista"}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "turista": {
            "id": turista.id,
            "correo": turista.correo
        }
    }


# =====================================================
# 🔹 DATOS DEL PERFIL (JWT)
# =====================================================
@router.get("/perfil/mis-datos")
def obtener_mis_datos(
    current_user: Turista = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ciudad = db.query(Ciudad).filter(Ciudad.id == current_user.ciudad_id).first()

    return {
        "id": current_user.id,
        "correo": current_user.correo,
        "nombre": current_user.nombre,
        "tipo_identificacion": current_user.tipo_identificacion,
        "identificacion": current_user.identificacion,
        "celular": current_user.celular,
        "fecha_nacimiento": current_user.fecha_nacimiento,
        "direccion": current_user.direccion,
        "ciudad": ciudad.nombre if ciudad else None
    }


# =====================================================
# 🔹 RECUPERACIÓN DE CONTRASEÑA
# =====================================================
@router.post("/solicitar-recuperacion")
def solicitar_recuperacion(data: SolicitudRecuperacion, db: Session = Depends(get_db)):
    turista = db.query(Turista).filter(Turista.correo == data.correo).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Correo no registrado")

    pin = str(randint(100000, 999999))
    turista.pin_recuperacion = pin
    turista.expira_pin = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    enviar_correo_recuperacion(turista.correo, pin)
    return {"mensaje": "Correo enviado correctamente"}


@router.post("/verificar-pin")
def verificar_pin(data: VerificarPinDTO, db: Session = Depends(get_db)):
    turista = db.query(Turista).filter(Turista.correo == data.correo).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if turista.pin_recuperacion != data.pin:
        raise HTTPException(status_code=400, detail="PIN incorrecto")

    if datetime.utcnow() > turista.expira_pin:
        raise HTTPException(status_code=400, detail="PIN expirado")

    token = str(uuid.uuid4())
    turista.token_recuperacion = token
    turista.expira_token = datetime.utcnow() + timedelta(minutes=15)
    turista.pin_recuperacion = None
    turista.expira_pin = None
    db.commit()

    return {"token": token}


@router.post("/cambiar-contrasena")
def cambiar_contrasena(data: CambiarContrasenaDTO, db: Session = Depends(get_db)):
    turista = db.query(Turista).filter(Turista.token_recuperacion == data.token).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Token inválido")

    if datetime.utcnow() > turista.expira_token:
        raise HTTPException(status_code=400, detail="Token expirado")

    turista.contrasena = hash_password(data.nueva_contrasena)
    turista.token_recuperacion = None
    turista.expira_token = None
    db.commit()

    return {"mensaje": "Contraseña actualizada correctamente"}


# =====================================================
# 🔹 ELIMINAR PERFIL (JWT)
# =====================================================
@router.delete("/eliminar-perfil")
def eliminar_perfil(
    current_user: Turista = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.delete(current_user)
    db.commit()
    return {"mensaje": "Perfil eliminado correctamente"}
