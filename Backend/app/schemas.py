from pydantic import BaseModel, constr
from typing import List

class EmailRequest(BaseModel):
      text: constr(strip_whitespace=True, min_length=1, max_length=50000)  # Avoid processing massive inputs

class PhraseHighlight(BaseModel):
    phrase: str
    confidence: float
    start: int
    end: int

class PredictionResponse(BaseModel):
    label: str
    confidence: float
    explanation: List[PhraseHighlight]
    highlighted_text: str
