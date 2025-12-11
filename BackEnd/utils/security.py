import bcrypt

# Funcion para generar un hash de una contraseña en texto plano
def hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt() # Genera un "salt" aleatorio para mayor seguridad
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), salt)
    # Haspw recibe la contraseña en bytes y el salta, devuelve bytes
    return hashed.decode('utf-8') #Convertimos el hash a string para guardarlo en DB

# Funcion para verificar si una contraseña en texto plano coincide con un hash
def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Checkpw compara la contraseña en bytes con el hash en bytes y devuelve true/false
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
