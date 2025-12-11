from db import Base
from sqlalchemy import Column, Integer, Date, Enum, LargeBinary, ForeignKey
from sqlalchemy.orm import relationship
import enum
from models.informe import Informe
from models.plan import Plan
from models.turista import Turista
from models.hotel import Hotel

class EstadoReserva(str, enum.Enum):
    CONFIRMADA = "Confirmada"
    CANCELADA = "Cancelada"
    FINALIZADA = "Finalizada"


class Reserva(Base):
    __tablename__ = "reserva"

    id = Column(Integer, primary_key=True)
    fecha_reserva = Column(Date)
    costo_final = Column(Integer)

    # 🔹 Campo Enum (antes llamado estado o disponibilidad)
    disponibilidad = Column(Enum(EstadoReserva), default=EstadoReserva.CONFIRMADA, nullable=False)

    numero_personas = Column(Integer)
    comprobante_pdf = Column(LargeBinary, nullable=True)
    id_informe = Column(Integer, ForeignKey("informe.id"))
    id_plan = Column(Integer, ForeignKey("plan.id"))
    id_turista = Column(Integer, ForeignKey("turista.id"))
    hotel_id = Column(Integer, ForeignKey("hotel.id"))

    hotel = relationship("Hotel", back_populates="reservas")
    turista = relationship("Turista", back_populates="reservas")
    plan = relationship("Plan")

    acompanantes = relationship(
        "PersonaReserva",
        back_populates="reserva",
        cascade="all, delete-orphan"
    )
