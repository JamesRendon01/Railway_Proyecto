from db import Base
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, ForeignKey, Text, VARCHAR
from sqlalchemy.orm import relationship
from models.plan import Plan

class Ubicacion(Base):
    __tablename__ = "ubicacion"
    id=Column(Integer, primary_key=True)
    longitud=Column(VARCHAR(30))
    latitud=Column(VARCHAR(30))
    id_plan=Column(Integer, ForeignKey("plan.id"))