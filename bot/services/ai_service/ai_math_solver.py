from typing import Optional
from bot.services.ai_service.anthropic_provider import AnthropicProvider
from bot.services.ai_service.openai_provider import OpenAIProvider
from anthropic import AsyncAnthropic
from openai import AsyncOpenAI


class AIMathSolver:
    def __init__(self, provider: str = "anthropic"):
        self.provider = provider
        self.ai_provider = self._get_ai_provider()

    def _get_ai_provider(self):
        if self.provider == "anthropic":
            return AnthropicProvider(AsyncAnthropic())
        elif self.provider == "openai":
            return OpenAIProvider(AsyncOpenAI())
        else:
            raise ValueError("Invalid provider. Choose 'anthropic' or 'openai'.")

    async def solve_problem(
        self, text: str | None, photo_path: str | None, additional_info: str | None
    ) -> str:
        messages = [
            {
                "role": "system",
                "content": "You are a math problem solver. Solve the given problem step by step.",
            }
        ]

        if text:
            messages.append(
                {"role": "user", "content": f"Solve this math problem: {text}"}
            )

        if photo_path:
            with open(photo_path, "rb") as photo_file:
                ai_media = self.ai_provider.media_class(
                    photo=photo_file, mime_type="image/jpeg"
                )
                content = ai_media.render_content()
                messages.append({"role": "user", "content": content})

        if additional_info:
            messages.append(
                {"role": "user", "content": f"Additional info: {additional_info}"}
            )

        full_response = ""
        async for partial_text in self.ai_provider.generate_response(
            messages,
            max_tokens=1000,
            temperature=0.4,
        ):
            full_response += partial_text

        return full_response
