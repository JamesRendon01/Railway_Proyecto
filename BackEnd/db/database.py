import os  # Asegúrate de tener esta importación al principio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 1. Obtener la URL de conexión desde la variable de entorno de Railway
#    La variable MYSQL_URL tiene la forma: mysql://usuario:contraseña@host:puerto/bd
#    Si no está en el entorno (es decir, estás probando localmente), usa el valor local.

# Cambia esta línea:
# SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:admin@localhost:3315/josnishop"

# Por estas líneas:
# Asegúrate de que el driver pymysql esté especificado correctamente si es necesario.
# Railway proporciona la URL como mysql://...
DATABASE_URL = os.getenv("MYSQL_URL")

# Define un valor de fallback SOLO para pruebas locales (fuera de Railway)
if DATABASE_URL:
    # Si la variable existe, reemplazamos 'mysql' por 'mysql+pymysql' si PyMySQL es el driver.
    # Opcional: Si tu aplicación está usando 'mariadb', puedes cambiar 'mysql' por 'mariadb'.
    SQLALCHEMY_DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://")
else:
    # Fallback para desarrollo local (si usas XAMPP o Docker local)
    SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost:3306/escapade_parfaite" 


# crea el objeto de conexion(permite conectarse a la base de datos)
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
