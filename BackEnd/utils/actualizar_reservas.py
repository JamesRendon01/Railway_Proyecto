from datetime import date
from sqlalchemy.orm import Session
from models.reserva import Reserva, EstadoReserva
from db.session import SessionLocal

def actualizar_reservas_finalizadas():
    """
    Marca automáticamente como FINALIZADAS todas las reservas cuya fecha ya pasó
    y que aún estén en estado CONFIRMADA o CANCELADA (pero no finalizada).
    """
    db: Session = SessionLocal()
    try:
        # 🔹 Buscar reservas cuya fecha ya pasó y no estén finalizadas
        reservas = db.query(Reserva).filter(
            Reserva.fecha_reserva < date.today(),
            Reserva.disponibilidad != EstadoReserva.FINALIZADA
        ).all()

        for reserva in reservas:
            reserva.disponibilidad = EstadoReserva.FINALIZADA

        db.commit()
        print(f"✅ {len(reservas)} reservas actualizadas como 'FINALIZADAS'.")
        
    except Exception as e:
        print(f"❌ Error al actualizar reservas: {e}")
        db.rollback()
    finally:
        db.close()
