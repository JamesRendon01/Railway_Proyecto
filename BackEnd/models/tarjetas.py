from db import Base
from sqlalchemy import Column, Integer, ForeignKey, VARCHAR
from sqlalchemy.orm import relationship
from models.turista import Turista

class Tarjeta(Base):
    __tablename__ = "tarjeta"
    id = Column(Integer, primary_key=True)
    nombre = Column(VARCHAR(100), nullable=False)
    tipo_tarjeta = Column(VARCHAR(50), nullable=False)
    numero = Column(VARCHAR(16), nullable=False)
    fecha_vencimiento = Column(VARCHAR(200), nullable=False)
    cvv = Column(Integer, nullable=False)
    turista_id=Column(Integer, ForeignKey("turista.id"))
