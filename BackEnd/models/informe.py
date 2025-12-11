from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, VARCHAR
from sqlalchemy.orm import relationship
from db import Base

class Informe(Base):
    __tablename__ = "informe"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(VARCHAR(100), unique=True, nullable=False)
    fecha_creacion = Column(DateTime, nullable=False)
    id_administrador = Column(Integer, ForeignKey("administrador.id"))
    ruta_pdf = Column(String(500), nullable=False)

    administrador = relationship("Administrador", back_populates="informes")
