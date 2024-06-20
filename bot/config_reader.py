from pydantic_settings import BaseSettings


class Bot(BaseSettings):
    token: str


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
    assistance_id: str


class Config(BaseSettings):
    bot: Bot
    admin: Admin
    telegram_api: TelegramApi
    chat: Chat
    openai: OpenAI

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        env_nested_delimiter = "__"


def load_config(env_file=".env") -> Config:
    config = Config(_env_file=env_file)
    return config
