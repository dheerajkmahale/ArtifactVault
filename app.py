from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import io
import cv2
import numpy as np
import requests
from model import ArtifactClassifier
import os

app = FastAPI()

# 1. Load the Model
device = torch.device("cpu")
model = ArtifactClassifier()
model_path = 'checkpoints/artifact_model.pth'

if os.path.exists(model_path):
    # Using strict=False in case of minor architecture mismatch, but should match
    model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

# Dummy classes mapping CIFAR-10 to "Artifacts" for the sake of the demo
CLASSES = [
    "Pottery", "Sculpture", "Tool", "Jewelry", "Weapon",
    "Religious Object", "Coin", "Textile", "Document", "Fossil"
]

preprocess_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
])

class ClassifyRequest(BaseModel):
    image_url: str

@app.post("/classify")
async def classify_artifact(request: ClassifyRequest):
    try:
        # Download image
        response = requests.get(request.image_url)
        if response.status_code != 200:
            return JSONResponse(status_code=400, content={"error": "Could not download image"})
            
        img = Image.open(io.BytesIO(response.content)).convert('RGB')
        
        # Preprocess
        input_tensor = preprocess_transform(img)
        input_batch = input_tensor.unsqueeze(0)
        
        # Predict
        with torch.no_grad():
            output = model(input_batch)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            confidence, predicted_idx = torch.max(probabilities, 0)
            
        predicted_class = CLASSES[predicted_idx.item()]
        
        confidence_str = "high"
        if confidence.item() < 0.5:
            confidence_str = "low"
        elif confidence.item() < 0.8:
            confidence_str = "medium"

        return {
            "classification": predicted_class,
            "subCategory": "Local CNN Prediction",
            "estimatedEra": "Unknown",
            "material": "Unknown",
            "culturalOrigin": "Unknown",
            "condition": "Unknown",
            "notableFeatures": "Analyzed by Local Model",
            "confidence": confidence_str,
            "raw_score": float(confidence.item())
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
