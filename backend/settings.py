from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENV: str = "staging"
    CORS_ORIGINS: str = "*"  # tighten later
    WS_PING_INTERVAL: int = 25
    DATABASE_URL: str = "postgresql+psycopg://user:pass@host/db?sslmode=require"
    FRONTEND_BASE_URL: str = ""
    BACKEND_BASE_URL: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
