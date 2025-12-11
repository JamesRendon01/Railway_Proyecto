from db import Base
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, ForeignKey, Text, VARCHAR
from sqlalchemy.orm import relationship

class Ciudad(Base):
    __tablename__ = "ciudad"
    id=Column(Integer, primary_key=True, autoincrement=True) 
    nombre=Column(VARCHAR(20), unique=True)
    planes = relationship("Plan", back_populates="ciudad")