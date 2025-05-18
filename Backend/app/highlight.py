import nltk
from typing import List, Dict

nltk.download('punkt_tab')
from nltk.tokenize import sent_tokenize

def highlight_text(text: str, model) -> Dict[str, List[Dict]]:
    highlights = []
    modified_text = text
    sentences = sent_tokenize(text)

    offset = 0  

    MAX_SENTENCE_LENGTH = 500
    
    for sentence in sentences:
        if len(sentence) > MAX_SENTENCE_LENGTH:
             continue
        pred = model(sentence)[0]  
        label = pred["label"]
        score = pred["score"]

        if label.upper() == "LABEL_1": 
            start = text.find(sentence, offset)
            end = start + len(sentence)
            offset = end

            highlights.append({
                "phrase": sentence,
                "confidence": round(score, 4),
                "start": start,
                "end": end
            })
    for h in sorted(highlights, key=lambda x: -x["start"]):
        phrase = h["phrase"]
        conf = h["confidence"]
        start, end = h["start"], h["end"]
        modified_text = (
            modified_text[:start] +
            f'<mark title="Confidence: {conf:.2f}">{phrase}</mark>' +
            modified_text[end:]
        )

    return {
        "highlighted_text": modified_text,
        "highlights": highlights
    }
