
import json
from decouple import config
from google import genai
from google.genai import types


class GeminiServiceError(Exception):
    pass


# Reuse one Gemini client
_gemini_client = None


def client():
    global _gemini_client

    if _gemini_client is None:
        key = config("GEMINI_API_KEY", default="")

        if not key:
            raise GeminiServiceError(
                "GEMINI_API_KEY is missing from backend/.env"
            )

        _gemini_client = genai.Client(api_key=key)

    return _gemini_client


def analyze_ticket(subject, description):
    prompt = f"""
Analyse this support ticket. Return JSON keys:
category, intent, sentiment, priority, summary.

category: payment, refund, order, delivery, return, product,
account, technical, subscription, security, service, other.

sentiment: positive, neutral, negative.
priority: low, medium, high.

Do not invent facts.

Subject: {subject}
Description: {description}
"""

    try:
        result = client().models.generate_content(
            model=config(
                "GEMINI_MODEL",
                default="gemini-3.5-flash-lite"
            ),
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        if not result.text:
            raise GeminiServiceError("Gemini returned an empty response.")

        data = json.loads(result.text)

        categories = {
            "payment", "refund", "order", "delivery", "return",
            "product", "account", "technical", "subscription",
            "security", "service", "other"
        }

        return {
            "category": (
                data.get("category")
                if data.get("category") in categories
                else "other"
            ),
            "intent": str(data.get("intent", ""))[:120],
            "sentiment": (
                data.get("sentiment")
                if data.get("sentiment") in {
                    "positive", "neutral", "negative"
                }
                else "neutral"
            ),
            "priority": (
                data.get("priority")
                if data.get("priority") in {
                    "low", "medium", "high"
                }
                else "medium"
            ),
            "summary": str(data.get("summary", ""))
        }

    except GeminiServiceError:
        raise
    except Exception as e:
        raise GeminiServiceError(str(e))


def generate_reply(ticket):
    prompt = f"""
Draft a concise, professional customer-support email reply.

Do not invent facts, claim an action was taken, promise a refund,
or invent company policy.

The support agent must review the reply before sending.

Customer: {ticket.customer_name}
Subject: {ticket.subject}
Message: {ticket.description}
Summary: {ticket.summary}
"""

    try:
        result = client().models.generate_content(
            model=config(
                "GEMINI_MODEL",
                default="gemini-3.5-flash-lite"
            ),
            contents=prompt
        )

        if not result.text:
            raise GeminiServiceError("Gemini returned an empty reply.")

        return result.text.strip()

    except GeminiServiceError:
        raise
    except Exception as e:
        raise GeminiServiceError(str(e))
