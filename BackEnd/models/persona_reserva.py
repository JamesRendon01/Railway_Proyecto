# models/persona_reserva.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class PersonaReserva(Base):
    __tablename__ = "persona_reserva"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    tipo_identificacion = Column(String(5), nullable=False)
    identificacion = Column(String(15), nullable=False)
    edad = Column(Integer, nullable=False)
    id_reserva = Column(Integer, ForeignKey("reserva.id", ondelete="CASCADE"), nullable=False)

    reserva = relationship("Reserva", back_populates="acompanantes")
