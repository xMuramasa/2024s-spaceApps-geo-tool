# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    earthdata_username: str
    earthdata_password: str
    earthdata_api_url: str

    class Config:
        env_file = ".env"  # Point to the .env file


settings = Settings()
