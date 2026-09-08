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

        # ---------------------------------------------------------
        # 3D Mesh Generation (Meshy.ai API Integration)
        # ---------------------------------------------------------
        model_url = None
        meshy_api_key = os.environ.get("MESHY_API_KEY")
        
        if meshy_api_key:
            try:
                # Step 1: Start the 3D generation task
                headers = {"Authorization": f"Bearer {meshy_api_key}"}
                payload = {
                    "image_url": request.image_url,
                    "enable_pbr": True,
                }
                
                print("Initiating Meshy.ai 3D generation task...")
                task_res = requests.post(
                    "https://api.meshy.ai/openapi/v2/image-to-3d",
                    headers=headers,
                    json=payload
                )
                
                if task_res.status_code == 202:
                    task_id = task_res.json().get("result")
                    
                    # Step 2: Poll for completion (Warning: For production, this should be async/webhooks 
                    # to prevent edge function timeouts, but we'll poll synchronously for the prototype)
                    import time
                    max_retries = 60 # 2 minutes max
                    for _ in range(max_retries):
                        status_res = requests.get(
                            f"https://api.meshy.ai/openapi/v2/image-to-3d/{task_id}",
                            headers=headers
                        )
                        status_data = status_res.json()
                        status = status_data.get("status")
                        
                        if status == "SUCCEEDED":
                            model_url = status_data.get("model_urls", {}).get("glb")
                            print(f"3D Model generated successfully: {model_url}")
                            break
                        elif status in ["FAILED", "EXPIRED"]:
                            print(f"3D generation failed: {status_data}")
                            break
                            
                        time.sleep(2)
            except Exception as mesh_e:
                print(f"Error calling Meshy API: {mesh_e}")
        else:
            print("No MESHY_API_KEY found. Skipping real 3D generation.")

        return {
            "classification": predicted_class,
            "subCategory": "Local CNN Prediction",
            "estimatedEra": "Unknown",
            "material": "Unknown",
            "culturalOrigin": "Unknown",
            "condition": "Unknown",
            "notableFeatures": "Analyzed by Local Model",
            "confidence": confidence_str,
            "raw_score": float(confidence.item()),
            "model_url": model_url  # New field returning the .glb URL
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
