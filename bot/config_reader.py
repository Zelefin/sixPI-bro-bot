from pydantic_settings import BaseSettings


class Web(BaseSettings):
    domain: str
    host: str
    port: int


class Bot(BaseSettings):
    token: str
    use_webhook: bool
    webhook_path: str
    webhook_url: str
    webhook_secret: str


class Admin(BaseSettings):
    id: int


class TelegramApi(BaseSettings):
    id: int
    hash: str


class Chat(BaseSettings):
    prod: int
    debug: int


class OpenAI(BaseSettings):
    api_key: str


class ElevenLabs(BaseSettings):
    api_key: str


class Anthropic(BaseSettings):
    api_key: str


class CoinMarketCap(BaseSettings):
    api_key: str


class Redis(BaseSettings):
    host: str
    port: int
    db: int

    def make_connection_string(self) -> str:
        return f"redis://{self.host}:{self.port}/{self.db}"


class Config(BaseSettings):
    web: Web
    bot: Bot
    admin: Admin
    telegram_api: TelegramApi
    chat: Chat
    openai: OpenAI
    elevenlabs: ElevenLabs
    anthropic: Anthropic
    coinmarketcap: CoinMarketCap
    redis: Redis

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        env_nested_delimiter = "__"


def load_config(env_file=".env") -> Config:
    config = Config(_env_file=env_file)
    return config
