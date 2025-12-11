from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, func
from sqlalchemy.orm import relationship
from db import Base

class AuditoriaPlan(Base):
    __tablename__ = "auditoria_plan"

    id = Column(Integer, primary_key=True, index=True)
    accion = Column(String(10), nullable=False)   # INSERT, UPDATE, DELETE
    fecha = Column(DateTime, server_default=func.now())
    admin_id = Column(Integer, ForeignKey("administrador.id"))     # ID del admin que creó o modificó
    old_data = Column(JSON, nullable=True)        # Datos anteriores
    new_data = Column(JSON, nullable=True)        # Datos nuevos
