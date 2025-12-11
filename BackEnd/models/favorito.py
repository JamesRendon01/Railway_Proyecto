from db import Base
from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

class Favorito(Base):
    __tablename__ = "favorito"
    
    id = Column(Integer, primary_key=True)
    id_turista = Column(Integer, ForeignKey("turista.id"), nullable=False)
    id_plan = Column(Integer, ForeignKey("plan.id"), nullable=False)
    
    turista = relationship("Turista", backref="favoritos")
    plan = relationship("Plan")

__table_args__ = (
        UniqueConstraint('id_turista', 'id_plan', name='uix_turista_plan'),
    )