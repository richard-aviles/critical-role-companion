from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENV: str = "staging"

    # CORS: allow your staging frontend
    CORS_ORIGINS: str = "*"  # tighten later to exact URL

    # WebSocket
    WS_PING_INTERVAL: int = 25  # seconds

    # Database
    DATABASE_URL: str = "postgresql+psycopg://user:pass@host/dbname"

    # Optional: public base URLs (used in CORS, links, etc.)
    FRONTEND_BASE_URL: str = ""
    BACKEND_BASE_URL: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
