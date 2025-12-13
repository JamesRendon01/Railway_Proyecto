from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer

from models.administrador import Administrador
from dtos.administrador_dto import iniciarSesionDTO, ActualizarAdministradorDTO
from db.database import get_db
from utils.jwt_manager import create_access_token, verify_access_token
from utils.security import hash_password, verify_password

# Creación del Router
router = APIRouter(prefix="/administrador", tags=["Administrador"])

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="administrador/iniciarsesion")

# 🔐 Obtener administrador autenticado desde el token
def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    admin = (
        db.query(Administrador)
        .filter(Administrador.id == int(payload.get("sub")))
        .first()
    )

    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")

    return admin


# ─────────────────────────────
# AUTENTICACIÓN
# ─────────────────────────────

@router.post("/iniciarsesion")
def iniciar_sesion(
    datos: iniciarSesionDTO,
    db: Session = Depends(get_db)
):
    administrador = (
        db.query(Administrador)
        .filter(Administrador.correo == datos.correo)
        .first()
    )

    if not administrador:
        raise HTTPException(status_code=401, detail="Correo no registrado")

    if administrador.bloqueado_hasta and datetime.utcnow() < administrador.bloqueado_hasta:
        raise HTTPException(
            status_code=403,
            detail=f"Cuenta bloqueada. Intenta de nuevo a las {administrador.bloqueado_hasta}"
        )

    if not verify_password(datos.contrasena, administrador.contrasena):
        administrador.intentos_fallidos += 1

        if administrador.intentos_fallidos >= 5:
            administrador.intentos_fallidos = 0
            administrador.bloqueado_hasta = datetime.utcnow() + timedelta(minutes=5)

        db.commit()
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    administrador.intentos_fallidos = 0
    administrador.bloqueado_hasta = None
    db.commit()

    access_token = create_access_token(
        data={
            "sub": str(administrador.id),
            "correo": administrador.correo,
            "nombre": administrador.nombre,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "mensaje": "Inicio de sesión exitoso",
        "administrador": {
            "id": administrador.id,
            "correo": administrador.correo,
        },
    }


# ─────────────────────────────
# PERFIL
# ─────────────────────────────

@router.get("/misDatosAdministrador")
def obtener_mis_datos_administrador(
    admin: Administrador = Depends(get_current_admin)
):
    return {
        "id": admin.id,
        "nombre": admin.nombre,
        "correo": admin.correo,
        "celular": admin.celular,
        "tipo_identificacion": admin.tipo_identificacion,
        "identificacion": admin.identificacion,
    }


# ─────────────────────────────
# CRUD ADMINISTRADOR
# ─────────────────────────────

@router.get("/")
def listar_administradores(db: Session = Depends(get_db)):
    administradores = db.query(Administrador).all()
    if not administradores:
        raise HTTPException(status_code=404, detail="No hay administradores registrados")
    return administradores


@router.get("/{id}")
def listar_por_id(id: int, db: Session = Depends(get_db)):
    admin = db.query(Administrador).filter(Administrador.id == id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")
    return admin


@router.put("/actualizar/{id}")
def actualizar_administrador(
    id: int,
    datos: ActualizarAdministradorDTO,
    db: Session = Depends(get_db)
):
    admin = db.query(Administrador).filter(Administrador.id == id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")

    if datos.correo and datos.correo != admin.correo:
        if db.query(Administrador).filter(Administrador.correo == datos.correo).first():
            raise HTTPException(status_code=400, detail="El correo ya está en uso")

    if datos.identificacion and datos.identificacion != admin.identificacion:
        if db.query(Administrador).filter(
            Administrador.identificacion == datos.identificacion
        ).first():
            raise HTTPException(status_code=400, detail="La identificación ya está registrada")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(admin, campo, valor)

    db.commit()
    db.refresh(admin)

    return {
        "mensaje": "Administrador actualizado exitosamente",
        "administrador": {
            "id": admin.id,
            "nombre": admin.nombre,
            "correo": admin.correo,
            "celular": admin.celular,
            "tipo_identificacion": admin.tipo_identificacion,
            "identificacion": admin.identificacion,
        },
    }


@router.delete("/eliminar/{id}")
def eliminar_administrador(id: int, db: Session = Depends(get_db)):
    admin = db.query(Administrador).filter(Administrador.id == id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")

    db.delete(admin)
    db.commit()

    return {"mensaje": f"Administrador con ID {id} eliminado exitosamente"}
