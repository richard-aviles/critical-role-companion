from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Environment
    ENV: str = "development"

    # Database
    DATABASE_URL: str = ""

    # Neon API (for future use)
    NEON_API_KEY: str = ""

    # Frontend/Backend URLs
    FRONTEND_BASE_URL: str = "http://localhost:3000"
    BACKEND_BASE_URL: str = "http://localhost:8000"

    # CORS
    CORS_ORIGINS: str = "*"

    # WebSocket
    WS_PING_INTERVAL: int = 25

    # Authentication - Global admin token for creating campaigns
    ADMIN_TOKEN: str = "change_me_in_production"

    # Cloudflare R2 - Image storage
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "critical-role-companion-images"

    class Config:
        env_file = ".env"

settings = Settings()
