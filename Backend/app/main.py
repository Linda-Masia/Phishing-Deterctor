from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import logging

from app.model_loader import pipe
from app.highlight import highlight_text
from app.schemas import EmailRequest, PredictionResponse

limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger("uvicorn.error")


app = FastAPI(title="Phishing Detection API")
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded."}
    )
class SecureHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "geolocation=()"
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SecureHeadersMiddleware)

app.add_middleware(SlowAPIMiddleware)


@app.post("/predict", response_model=PredictionResponse)
@limiter.limit("10/minute")
async def predict_phishing(request: Request, email: EmailRequest):
    try:
        prediction = pipe(email.text)[0]
        label = prediction["label"]
        score = prediction["score"]

        result = highlight_text(email.text, pipe)

        return {
            "label": "Phishing" if "phishing" in label.lower() or "label_1" in label.lower() else "Legitimate",
            "confidence": round(score, 4),
            "explanation": result["highlights"],
            "highlighted_text": result["highlighted_text"]
        }

    except Exception as e:
        logger.exception("Prediction error")
        raise HTTPException(status_code=500, detail="Failed to process the request.")
