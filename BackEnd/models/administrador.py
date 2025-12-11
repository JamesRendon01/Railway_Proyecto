from db import Base
from sqlalchemy import Column, Integer, String, VARCHAR, DateTime
from sqlalchemy.orm import relationship

class Administrador(Base):
    __tablename__ = "administrador"
    id=Column(Integer, primary_key=True)
    nombre=Column(VARCHAR(30))
    correo=Column(VARCHAR(50), unique=True)
    celular=Column(String(15), unique=True)
    tipo_identificacion=Column(String(5))
    identificacion=Column(String(15), unique=True)
    contrasena=Column(VARCHAR(100))
    intentos_fallidos = Column(Integer, default = 0)
    bloqueado_hasta = Column(DateTime, nullable=True)
    informes = relationship("Informe", back_populates="administrador")

