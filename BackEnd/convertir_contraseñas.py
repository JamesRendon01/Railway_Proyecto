from sqlalchemy.orm import Session
from db.session import SessionLocal 
from models.administrador import Administrador
from utils.security import hash_password  # Función que genera hash bcrypt

# Función principal que convierte todas las contraseñas a hash bcrypt
def convertir_contrasenas():
    db: Session = SessionLocal()  # Crear sesión de base de datos

    administradores = db.query(Administrador).all()  # Obtener todos los administradores

    for admin in administradores:
        # Revisar si la contraseña ya está hasheada (bcrypt comienza con $2b$)
        if not admin.contrasena.startswith("$2b$"):
            print(f"Convirtiendo contraseña de: {admin.correo}")
            # Hashear la contraseña y reemplazar la anterior
            admin.contrasena = hash_password(admin.contrasena)

    db.commit()  # Guardar cambios en la base de datos
    db.close()   # Cerrar la sesión
    print("✔️ Contraseñas convertidas exitosamente.")

# Ejecutar la función si se corre directamente el script
if __name__ == "__main__":
    convertir_contrasenas()
