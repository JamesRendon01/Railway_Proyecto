from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import session
from models.ubicacion import Ubicacion
from dtos.ubicacion_dto import ubicacionCreateDTO
from dtos.ubicacion_dto import ubicacionUpdateDTO
from db.session import SessionLocal

#obtener el objeto session
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
#objeto que contiene este grupo
#rutas
router = APIRouter( prefix='/ubicacion' )

@router.get('/')
def listar_ubicaciones(
                db: session = Depends(get_session)
                ):
    lu = db.query(Ubicacion).all()
    if not lu:
         raise HTTPException(status_code=404, detail="No hay Ubicaciones registradas")
    return lu

#Ruta parametrizada
@router.get('/{id}')
def listar_por_id(
                id: int, 
                db: session = Depends(get_session)
                ):
    lu = db.query(Ubicacion).filter(Ubicacion.id == id).first()
    if not lu:
         raise HTTPException(status_code=404, detail="Ubicacion no encontrada")
    return lu

#Ruta post
@router.post("/")
def crear_ubicacion(nuevo_ubicacion: ubicacionCreateDTO, db:session = Depends(get_session)):
            
             # Validar que el correo o identificación no se repita
            existente = db.query(Ubicacion).filter(
                (Ubicacion.longitud == nuevo_ubicacion.longitud) |
                (Ubicacion.latitud == nuevo_ubicacion.latitud)
            ).first()

            if existente:
                raise HTTPException(status_code=400, detail="Ubicacion ya existe")
            #crear categoria
            nu = Ubicacion(
                    ciudad = nuevo_ubicacion.ciudad,
                    longitud = nuevo_ubicacion.longitud,
                    latitud = nuevo_ubicacion.latitud,
                    id_plan = nuevo_ubicacion.id_plan
            )
            #inserto la nueva categoria
            db.add(nu)
            #confirmo la transaccion manualmente
            db.commit()
            #nueva categoria la dispongo en memoria
            db.refresh(nu)
            return nu

#Ruta update
@router.put('/{id}')
def actualizar_turista(
                id: int, datos: ubicacionUpdateDTO,
                db: session = Depends(get_session)
                ):
    au = db.query(Ubicacion).filter(Ubicacion.id == id).first()
    if not au:
        raise HTTPException(status_code=404, detail="Ubicacion no encontrado")
    for key, value in datos.dict(exclude_unset=True).items():
         setattr(au, key, value)
    db.commit()
    db.refresh(au)
    return "Se modifico exitosamente la ubicacion con el Id:" + str(id)

#Ruta delet
@router.delete('/{id}')
def eliminar_Ubicacion(
                id: int,
                db: session = Depends(get_session)
                ):
    eu = db.query(Ubicacion).filter(Ubicacion.id == id).first()
    if not eu:
         raise HTTPException(status_code=404, detail="Ubicacion no encontrado")
    db.delete(eu)
    db.commit()
    return "Se elimino con exito la Ubicacion con el Id:" + str(id)