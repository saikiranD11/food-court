from passlib.context import CryptContext

# Prefer argon2 for new hashes; still verify bcrypt for existing users
pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    default="argon2",               # new hashes use argon2
    deprecated=["bcrypt"],          # marks bcrypt as legacy
)

def hash_password(password: str) -> str:
    # Argon2 accepts any length; normalize to str
    if password is None:
        password = ""
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    if password is None:
        password = ""
    return pwd_context.verify(password, password_hash)

def needs_rehash(password_hash: str) -> bool:
    return pwd_context.needs_update(password_hash)
