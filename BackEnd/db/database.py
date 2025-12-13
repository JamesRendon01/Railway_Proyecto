import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

<<<<<<< HEAD
# Cargar variables de entorno
load_dotenv()

# Obtener URL de la base de datos desde .env
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL no está configurada. "
        "Asegúrate de definirla en tu archivo .env"
    )

# Crear engine único para toda la aplicación
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300
)
=======
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
>>>>>>> f778053e7e2d20f4e487ca9831a4c4f6ef53995f

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Dependencia para FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
