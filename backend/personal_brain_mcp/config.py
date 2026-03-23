from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Loads and validates application settings from environment variables."""
    # Load variables from a .env file
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    # Required API Keys and settings
    GOOGLE_API_KEY: str
    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str

    # Optional API key for Anthropic's Claude model
    ANTHROPIC_API_KEY: str | None = None

# Instantiate settings to be imported by other modules
settings = Settings()