from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    port: int = 8000
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.5-flash-lite"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
