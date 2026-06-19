from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Configuración de base de datos
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres_secure_pass@localhost:5432/avendia_db"
    
    # Configuración de Seguridad y JWT
    JWT_SECRET_KEY: str = "super_secure_secret_key_change_me_in_prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Configuración de Google Gemini (requerida en .env)
    GEMINI_API_KEY: str
    
    # Orígenes permitidos por CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3005,http://127.0.0.1:3005"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
