import os  # Asegúrate de tener esta importación al principio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Railway proporciona la URL como mysql://...
DATABASE_URL = os.getenv("MYSQL_URL")

# Define un valor de fallback SOLO para pruebas locales (fuera de Railway)
if DATABASE_URL:
    # Si la variable existe, reemplazamos 'mysql' por 'mysql+pymysql' si PyMySQL es el driver.
    # Opcional: Si tu aplicación está usando 'mariadb', puedes cambiar 'mysql' por 'mariadb'.
    SQLALCHEMY_DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://")
else:
    # Fallback para desarrollo local (si usas XAMPP o Docker local)
    SQLALCHEMY_DATABASE_URL = "mysql://root:iUJKHheBPNeNAyZfrCAANnbFYysanLrt@shinkansen.proxy.rlwy.net:34048/railway" 


# crea el objeto de conexion(permite conectarse a la base de datos)
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
