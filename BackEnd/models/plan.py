from db import Base
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, VARCHAR, func
from sqlalchemy.orm import relationship
from models.informe import Informe
from models.ciudad import Ciudad
from models.administrador import Administrador

class Plan(Base):
    __tablename__ = "plan"

    id = Column(Integer, primary_key=True)
    nombre = Column(VARCHAR(30), unique=True)
    descripcion = Column(String(200), unique=True)
    descripcion_corta = Column(String(100), unique=True)
    costo_persona = Column(Integer)
    imagen = Column(VARCHAR(255))
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

    # ✅ Campo sincronizado con el checkbox del frontend y DTOs
    mostrar_en_carrusel = Column(Boolean, default=False)

    # Relaciones
    id_ciudad = Column(Integer, ForeignKey("ciudad.id"))
    id_informe = Column(Integer, ForeignKey("informe.id"))
    id_Admin = Column(Integer, ForeignKey("administrador.id"))

    ciudad = relationship("Ciudad", back_populates="planes")
    ubicaciones = relationship("Ubicacion", backref="plan")
    administrador = relationship("Administrador", backref="planes")
