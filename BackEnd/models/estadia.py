from db import Base
from sqlalchemy import Column, Integer, ForeignKey, VARCHAR
from sqlalchemy.orm import relationship
from models.hotel import Hotel 

class Estadia(Base):
    __tablename__ = "estadia"
    
    id = Column(Integer, primary_key=True)
    habitacion = Column(VARCHAR(100), nullable=False)
    numHabitacion = Column(VARCHAR(200), nullable=False)
    numDias = Column(VARCHAR(200), nullable=False)
    numNoche = Column(VARCHAR(200), nullable=False)
    precioDia = Column(VARCHAR(200), nullable=False)
    precioNoche = Column(VARCHAR(200), nullable=False)
    tipoHabitacion = Column(VARCHAR(200), nullable=False)
    id_hotel = Column(Integer, ForeignKey("hotel.id"), nullable=False)
    hotel = relationship("Hotel")