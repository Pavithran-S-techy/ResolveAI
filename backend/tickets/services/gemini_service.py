import json
from decouple import config
from google import genai
from google.genai import types
class GeminiServiceError(Exception): pass
def client():
    key=config("GEMINI_API_KEY",default="")
    if not key: raise GeminiServiceError("GEMINI_API_KEY is missing from backend/.env")
    return genai.Client(api_key=key)
def analyze_ticket(subject,description):
    prompt=f'''Analyse this support ticket. Return JSON keys category,intent,sentiment,priority,summary.
category: payment,refund,order,delivery,return,product,account,technical,subscription,security,service,other.
sentiment: positive,neutral,negative. priority: low,medium,high. Do not invent facts.
Subject: {subject}\nDescription: {description}'''
    try:
        result=client().models.generate_content(model=config("GEMINI_MODEL",default="gemini-3.5-flash-lite"),
            contents=prompt,config=types.GenerateContentConfig(response_mime_type="application/json"))
        d=json.loads(result.text)
        cats={"payment","refund","order","delivery","return","product","account","technical","subscription","security","service","other"}
        return {"category":d.get("category") if d.get("category") in cats else "other",
        "intent":str(d.get("intent",""))[:120],
        "sentiment":d.get("sentiment") if d.get("sentiment") in {"positive","neutral","negative"} else "neutral",
        "priority":d.get("priority") if d.get("priority") in {"low","medium","high"} else "medium",
        "summary":str(d.get("summary",""))}
    except Exception as e: raise GeminiServiceError(str(e))
def generate_reply(ticket):
    prompt=f'''Draft a concise, professional customer-support email reply. Do not invent facts,
claim an action was taken, promise a refund, or invent company policy. Agent must review before sending.
Customer: {ticket.customer_name}
Subject: {ticket.subject}
Message: {ticket.description}
Summary: {ticket.summary}'''
    try:
        r=client().models.generate_content(model=config("GEMINI_MODEL",default="gemini-3.5-flash-lite"),contents=prompt)
        return (r.text or "").strip()
    except Exception as e: raise GeminiServiceError(str(e))
