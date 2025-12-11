from sqlalchemy import create_engine

MARIADB_URL = 'mysql+pymysql://root:@localhost:3306/escapade_parfaite'

#crear el objeto de la conexion
engine = create_engine(MARIADB_URL)