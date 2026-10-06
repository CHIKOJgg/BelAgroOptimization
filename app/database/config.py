from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Настройки подключения к бд"""

    DB_USER: str = 'postgres'
    DB_PASS: str = 'postgres'
    DB_HOST: str = 'localhost'
    DB_PORT: int = 5432
    DB_NAME: str = 'agro_optimization_dev'
    DATABASE_URL: str | None = None
    MODE: str = 'DEV'

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith('postgres://'):
                url = url.replace('postgres://', 'postgresql+psycopg://', 1)
            elif url.startswith('postgresql://') and not url.startswith('postgresql+psycopg://'):
                url = url.replace('postgresql://', 'postgresql+psycopg://', 1)
            return url
        return f'postgresql+psycopg://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}'

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='UTF-8', extra="ignore")


settings = Settings()
