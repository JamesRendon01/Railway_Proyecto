from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from models.turista import Turista
from models.ciudad import Ciudad
from dtos.turista_dto import (
    turistaCreateDTO, turistaUpdateDTO, iniciarSesionDTO,
    SolicitudRecuperacion, CambiarContrasenaDTO, VerificarPinDTO
)
from db.session import SessionLocal
from utils.security import hash_password, verify_password
from mails.mailjet_config import enviar_correo_recuperacion, enviar_correo_bienvenida
from datetime import datetime, timedelta, timezone
from utils.jwt_manager import create_access_token, verify_access_token
from typing import Optional
import uuid
from random import randint
from utils.dependencies import get_current_user

# ==============================
# CONFIGURACIÓN
# ==============================

# Zona horaria de Colombia (UTC-5)
COLOMBIA_TZ = timezone(timedelta(hours=-5))

# Dependencia de sesión
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(prefix='/turista')

# ==============================
# CRUD TURISTA
# ==============================

# Listar todos los turistas
@router.get('/TotalTuristas')
def listar_turistas(db: Session = Depends(get_session)):
    # Obtenemos todos los turistas con sus ciudades
    turistas = (
        db.query(Turista, Ciudad.nombre.label("ciudad"))
        .join(Ciudad, Turista.ciudad_id == Ciudad.id, isouter=True)
        .order_by(Ciudad.nombre.asc())  # 🔹 Ordenar alfabéticamente por ciudad
        .all()
    )

    if not turistas:
        raise HTTPException(status_code=404, detail="No hay turistas registrados")

    # Transformar el resultado en una lista limpia de diccionarios
    resultado = []
    for t, ciudad_nombre in turistas:
        resultado.append({
            "nombre": t.nombre,
            "correo": t.correo,
            "tipo_identificacion": t.tipo_identificacion,
            "identificacion": t.identificacion,
            "celular": t.celular,
            "direccion": t.direccion,
            "ciudad": ciudad_nombre or "Sin ciudad"
        })
    return resultado

# Listar por ID
@router.get('/{id}')
def listar_por_id(id: int, db: Session = Depends(get_session)):
    turista = db.query(Turista).filter(Turista.id == id).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Turista no encontrado")
    return turista

# Crear turista
@router.post("/registrar")
def crear_turista(nuevo_turista: turistaCreateDTO, db: Session = Depends(get_session)):
    # Validar datos únicos
    if db.query(Turista).filter(Turista.correo == nuevo_turista.correo).first():
        raise HTTPException(status_code=409, detail={"campo": "correo", "mensaje": "El correo ya está registrado"})
    if db.query(Turista).filter(Turista.celular == nuevo_turista.celular).first():
        raise HTTPException(status_code=409, detail={"campo": "celular", "mensaje": "El celular ya está registrado"})
    if db.query(Turista).filter(Turista.identificacion == nuevo_turista.identificacion).first():
        raise HTTPException(status_code=409, detail={"campo": "identificacion", "mensaje": "La identificación ya está registrada"})

    # Validar ciudad
    ciudad = db.query(Ciudad).filter(Ciudad.id == nuevo_turista.ciudad_residencia_id).first()
    if not ciudad:
        raise HTTPException(status_code=400, detail="Ciudad no válida")

    nt = Turista(
        nombre=nuevo_turista.nombre,
        correo=nuevo_turista.correo,
        celular=nuevo_turista.celular,
        fecha_nacimiento=nuevo_turista.fecha_nacimiento,
        direccion=nuevo_turista.direccion,
        ciudad_id=nuevo_turista.ciudad_residencia_id,
        tipo_identificacion=nuevo_turista.tipo_identificacion,
        identificacion=nuevo_turista.identificacion,
        contrasena=hash_password(nuevo_turista.contrasena),
        acepto_terminos=nuevo_turista.acepto_terminos
    )

    db.add(nt)
    db.commit()
    db.refresh(nt)

    enviar_correo_bienvenida(nt.correo, nt.nombre)
    return nt

# Actualizar turista
@router.put('/{id}')
def actualizar_turista(id: int, datos: turistaUpdateDTO, db: Session = Depends(get_session)):
    at = db.query(Turista).filter(Turista.id == id).first()
    if not at:
        raise HTTPException(status_code=404, detail="Turista no encontrado")

    if datos.ciudad_residencia_id:
        ciudad = db.query(Ciudad).filter(Ciudad.id == datos.ciudad_residencia_id).first()
        if not ciudad:
            raise HTTPException(status_code=400, detail="Ciudad no válida")

    for key, value in datos.dict(exclude_unset=True).items():
        setattr(at, key, value)
    db.commit()
    db.refresh(at)
    return {"mensaje": f"El turista {id} fue actualizado exitosamente"}

# Eliminar turista
@router.delete('/delet/{id}')
def eliminar_turista(id: int, db: Session = Depends(get_session)):
    et = db.query(Turista).filter(Turista.id == id).first()
    if not et:
        raise HTTPException(status_code=404, detail="Turista no encontrado")
    db.delete(et)
    db.commit()
    return {"mensaje": f"El turista {id} fue eliminado exitosamente"}

# ==============================
# AUTENTICACIÓN Y BLOQUEO
# ==============================

@router.post("/iniciarsesion")
def iniciar_sesion(datos: iniciarSesionDTO, db: Session = Depends(get_session)):
    turista = db.query(Turista).filter(Turista.correo == datos.correo).first()
    if not turista:
        raise HTTPException(status_code=401, detail="Correo no registrado")

    # Verificar si está bloqueado
    if turista.bloqueado_hasta and datetime.utcnow() < turista.bloqueado_hasta:
        hora_local = turista.bloqueado_hasta.replace(tzinfo=timezone.utc).astimezone(COLOMBIA_TZ)
        hora_formateada = hora_local.strftime("%Y-%m-%d %H:%M:%S")
        raise HTTPException(status_code=403, detail=f"Cuenta bloqueada. Intenta de nuevo a las {hora_formateada}")

    # Validar contraseña
    if not verify_password(datos.contrasena, turista.contrasena):
        turista.intentos_fallidos += 1
        if turista.intentos_fallidos >= 5:
            turista.intentos_fallidos = 0
            turista.bloqueado_hasta = datetime.utcnow() + timedelta(minutes=5)
        db.commit()
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    # Si la contraseña es correcta
    turista.intentos_fallidos = 0
    turista.bloqueado_hasta = None
    db.commit()

    access_token = create_access_token(
        data={"sub": str(turista.id), "correo": turista.correo, "nombre": turista.nombre}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "turista": {"id_turista": turista.id, "correo": turista.correo}
    }

# ==============================
# DATOS PERSONALES
# ==============================

@router.get("/reservas/mis-datos")
def obtener_mis_datos_reserva(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    db: Session = Depends(get_session)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token no proporcionado")

    token = authorization.split(" ")[1]
    payload = verify_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    turista_id = payload.get("sub")
    turista = db.query(Turista).filter(Turista.id == int(turista_id)).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Turista no encontrado")

    return {
        "id": turista.id,
        "correo": turista.correo,
        "nombre": turista.nombre,
        "tipo_identificacion": turista.tipo_identificacion,
        "identificacion": turista.identificacion,
        "celular": turista.celular,
    }

@router.get("/perfil/mis-datos")
def obtener_mis_datos_perfil(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    db: Session = Depends(get_session)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token no proporcionado")

    token = authorization.split(" ")[1]
    payload = verify_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    turista_id = payload.get("sub")
    turista = db.query(Turista).filter(Turista.id == int(turista_id)).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Turista no encontrado")

    ciudad = db.query(Ciudad).filter(Ciudad.id == turista.ciudad_id).first()
    nombre_ciudad = ciudad.nombre if ciudad else None

    return {
        "id": turista.id,
        "correo": turista.correo,
        "nombre": turista.nombre,
        "tipo_identificacion": turista.tipo_identificacion,
        "identificacion": turista.identificacion,
        "celular": turista.celular,
        "fecha_nacimiento": turista.fecha_nacimiento,
        "direccion": turista.direccion,
        "ciudad": nombre_ciudad
    }

# ==============================
# RECUPERACIÓN DE CONTRASEÑA
# ==============================

@router.post("/solicitar-recuperacion")
def solicitar_recuperacion(data: SolicitudRecuperacion, db: Session = Depends(get_session)):
    turista = db.query(Turista).filter(Turista.correo == data.correo).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Correo no registrado")

    pin = str(randint(100000, 999999))
    turista.pin_recuperacion = pin
    turista.expira_pin = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    if not enviar_correo_recuperacion(turista.correo, pin):
        raise HTTPException(status_code=500, detail="Error enviando correo")

    return {"mensaje": "Correo de recuperación enviado"}

@router.post("/verificar-pin")
def verificar_pin(data: VerificarPinDTO, db: Session = Depends(get_session)):
    turista = db.query(Turista).filter(Turista.correo == data.correo).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if turista.pin_recuperacion != data.pin:
        raise HTTPException(status_code=400, detail="PIN incorrecto")
    if datetime.utcnow() > turista.expira_pin:
        raise HTTPException(status_code=400, detail="PIN expirado")

    turista.pin_recuperacion = None
    turista.expira_pin = None
    token = str(uuid.uuid4())
    turista.token_recuperacion = token
    turista.expira_token = datetime.utcnow() + timedelta(minutes=15)
    db.commit()
    return {"token": token}

@router.post("/cambiar-contrasena")
def cambiar_contrasena(data: CambiarContrasenaDTO, db: Session = Depends(get_session)):
    turista = db.query(Turista).filter(Turista.token_recuperacion == data.token).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Token inválido")
    if datetime.utcnow() > turista.expira_token:
        raise HTTPException(status_code=400, detail="Token expirado")

    turista.contrasena = hash_password(data.nueva_contrasena)
    turista.token_recuperacion = None
    turista.expira_token = None
    db.commit()
    return {"mensaje": "Contraseña cambiada exitosamente"}



@router.delete("/eliminar-perfil")
def eliminar_perfil(current_user=Depends(get_current_user)):
    db: Session = current_user.__dict__['_sa_instance_state'].session
    db.delete(current_user)
    db.commit()
    return {"mensaje": "Perfil eliminado correctamente"}
