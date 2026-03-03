from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    database_url: str
    supabase_jwt_secret: str

    # GitHub
    github_client_id: str
    github_client_secret: str
    github_webhook_secret: str

    # Groq
    groq_api_key: str

    # Encryption
    encryption_key: str

    # App
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    frontend_url: str = "http://localhost:5173"

    @property
    def allowed_origins(self) -> list[str]:
        """Parse comma-separated FRONTEND_URL into a list of allowed origins."""
        return [u.strip() for u in self.frontend_url.split(",") if u.strip()]


    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
