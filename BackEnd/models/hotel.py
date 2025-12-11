# models/hotel.py
from db import Base
from sqlalchemy import Column, Integer, ForeignKey, VARCHAR
from sqlalchemy.orm import relationship

class Hotel(Base):
    __tablename__ = "hotel"

    id = Column(Integer, primary_key=True)
    nombre = Column(VARCHAR(100), nullable=False)
    direccion = Column(VARCHAR(200), nullable=False)

    # 🔹 Relación con reservas
    reservas = relationship("Reserva", back_populates="hotel")
