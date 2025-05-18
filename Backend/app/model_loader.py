from transformers import AutoModelForSequenceClassification, AutoTokenizer, TextClassificationPipeline
from pathlib import Path

class CustomTextClassificationPipeline(TextClassificationPipeline):
    def preprocess(self, inputs, **kwargs):
        model_inputs = self.tokenizer(
            inputs,
            truncation=True,
            max_length=512,
            return_tensors=self.framework,
        )
        model_inputs.pop("token_type_ids", None) 
        return model_inputs

model_path = Path(__file__).resolve().parent.parent / "model"
model = AutoModelForSequenceClassification.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)

pipe = CustomTextClassificationPipeline(model=model, tokenizer=tokenizer, device=-1)