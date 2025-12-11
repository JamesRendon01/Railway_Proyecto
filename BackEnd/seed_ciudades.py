from db.session import SessionLocal
from models.ciudad import Ciudad

db = SessionLocal()

ciudades = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Pereira", "Cundinamarca "]

for nombre in ciudades:
    if not db.query(Ciudad).filter(Ciudad.nombre == nombre).first():
        db.add(Ciudad(nombre=nombre))

db.commit()
db.close()
print("Ciudades insertadas correctamente ✅")