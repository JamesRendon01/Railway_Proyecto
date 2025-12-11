from db import Base
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, VARCHAR, Text, Date
from datetime import datetime
from sqlalchemy.orm import relationship
from models.ciudad import Ciudad

class Turista(Base):
    __tablename__ ="turista"
    id=Column(Integer, primary_key=True)
    nombre=Column(VARCHAR(30))
    correo=Column(VARCHAR(50), unique=True)
    celular=Column(String(20), unique=True)
    fecha_nacimiento=Column(Date)
    direccion=Column(VARCHAR(50))
    tipo_identificacion=Column(String(5))
    identificacion=Column(String(30), unique=True)
    contrasena=Column(VARCHAR(100))
    estado=Column(Boolean, default=True)
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    acepto_terminos = Column(Boolean, default=False)
    intentos_fallidos = Column(Integer, default = 0)
    bloqueado_hasta = Column(DateTime, nullable = True)
    pin_recuperacion = Column(String(6), nullable=True)
    expira_pin = Column(DateTime, nullable=True)
    token_recuperacion = Column(String(255), nullable=True)
    expira_token = Column(DateTime, nullable=True)
    ciudad_id=Column(Integer, ForeignKey("ciudad.id"))

    reservas = relationship("Reserva", back_populates="turista")