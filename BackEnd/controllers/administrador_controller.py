from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, session
from models.administrador import Administrador
from dtos.administrador_dto import iniciarSesionDTO, ActualizarAdministradorDTO
from db.session import SessionLocal
from utils.jwt_manager import create_access_token, verify_access_token
from datetime import datetime, timedelta
from utils.security import hash_password, verify_password
from fastapi.security import OAuth2PasswordBearer

# Función para obtener la sesión de la base de datos
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Creación del Router con el prefijo /administrador
router = APIRouter(prefix='/administrador', tags=['Administrador'])

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="administrador/iniciarsesion")

# Dependencia para obtener el administrador actual a partir del token
def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_session)):
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    admin = db.query(Administrador).filter(Administrador.id == int(payload.get("sub"))).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")
    return admin

# -------------------
# Rutas fijas primero
# -------------------

@router.post("/iniciarsesion")
def iniciar_sesion(datos: iniciarSesionDTO, db: session = Depends(get_session)):
    administrador = db.query(Administrador).filter(Administrador.correo == datos.correo).first()

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
        data={"sub": str(administrador.id), "correo": administrador.correo, "nombre": administrador.nombre}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "mensaje": "Inicio de sesión exitoso",
        "Administrador": {
            "id": administrador.id,
            "correo": administrador.correo
        }
    }

@router.get("/misDatosAdministrador")
def obtener_mis_datos_administrador(admin: Administrador = Depends(get_current_admin)):
    return {
        "id": admin.id,
        "nombre": admin.nombre,
        "correo": admin.correo,
        "celular": admin.celular,
        "tipo_identificacion": admin.tipo_identificacion,
        "identificacion": admin.identificacion,
    }

# ------------------------
# Rutas dinámicas después
# ------------------------

@router.get("/")
def listar_administradores(db: session = Depends(get_session)):
    la = db.query(Administrador).all()
    if not la:
        raise HTTPException(status_code=404, detail="No hay administradores registrados")
    return la

@router.get("/{id}")
def listar_por_id(id: int, db: session = Depends(get_session)):
    lpa = db.query(Administrador).filter(Administrador.id == id).first()
    if not lpa:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")
    return lpa

@router.put("/actualizar/{id}")
def actualizar_administrador(id: int, datos: ActualizarAdministradorDTO, db: session = Depends(get_session)):
    admin = db.query(Administrador).filter(Administrador.id == id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")

    if datos.correo and datos.correo != admin.correo:
        correo_existente = db.query(Administrador).filter(Administrador.correo == datos.correo).first()
        if correo_existente:
            raise HTTPException(status_code=400, detail="El correo ya está en uso por otro administrador")

    if datos.identificacion and datos.identificacion != admin.identificacion:
        id_existente = db.query(Administrador).filter(Administrador.identificacion == datos.identificacion).first()
        if id_existente:
            raise HTTPException(status_code=400, detail="La identificación ya está registrada por otro administrador")

    if datos.nombre:
        admin.nombre = datos.nombre
    if datos.correo:
        admin.correo = datos.correo
    if datos.celular:
        admin.celular = datos.celular
    if datos.tipo_identificacion:
        admin.tipo_identificacion = datos.tipo_identificacion
    if datos.identificacion:
        admin.identificacion = datos.identificacion

    db.commit()
    db.refresh(admin)

    return {
        "mensaje": "Datos del administrador actualizados exitosamente",
        "administrador": {
            "id": admin.id,
            "nombre": admin.nombre,
            "correo": admin.correo,
            "celular": admin.celular,
            "tipo_identificacion": admin.tipo_identificacion,
            "identificacion": admin.identificacion
        }
    }

@router.delete("/eliminar/{id}")
def eliminar_administrador(id: int, db: session = Depends(get_session)):
    admin = db.query(Administrador).filter(Administrador.id == id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")

    db.delete(admin)
    db.commit()

    return {"mensaje": f"El administrador con ID {id} fue eliminado exitosamente"}
