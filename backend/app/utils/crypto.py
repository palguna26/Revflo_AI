from cryptography.fernet import Fernet
from app.config import get_settings

settings = get_settings()


def get_fernet() -> Fernet:
    """Return a Fernet instance using the configured encryption key."""
    return Fernet(settings.encryption_key.encode())


def encrypt_token(token: str) -> str:
    """Encrypt a plain-text token (e.g. GitHub access token)."""
    f = get_fernet()
    return f.encrypt(token.encode()).decode()


def decrypt_token(encrypted: str) -> str:
    """Decrypt a previously encrypted token."""
    f = get_fernet()
    return f.decrypt(encrypted.encode()).decode()
