from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import shutil
import os

from contextlib import asynccontextmanager

import threading

# Global model variable
model = None
is_loading = False

def load_model_task():
    global model, is_loading
    is_loading = True
    try:
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        MODEL_FILENAME = "best.pt"
        MODEL_PATH = os.path.join(BASE_DIR, MODEL_FILENAME)
        
        print(f"DEBUG: Background loading started...")
        if not os.path.exists(MODEL_PATH):
            print(f"ERROR: {MODEL_FILENAME} not found at {MODEL_PATH}")
            return
            
        print(f"DEBUG: Loading YOLO model from {MODEL_PATH}...")
        model = YOLO(MODEL_PATH)
        print(f"DEBUG: Model loaded successfully!")
    except Exception as e:
        print(f"ERROR: Failed to load model: {e}")
    finally:
        is_loading = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start loading the model in a separate thread so we don't block the port binding
    thread = threading.Thread(target=load_model_task)
    thread.start()
    yield
    # Clean up on shutdown
    global model
    model = None

app = FastAPI(lifespan=lifespan)

# Enable CORS for backend proxy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Map issue to department
department_map = {
    "Pothole": "Road Maintenance Department",
    "pothole": "Road Maintenance Department",
    "potholes": "Road Maintenance Department",
    "Streetlight": "Electrical & Lighting Department",
    "streetlight": "Electrical & Lighting Department",
    "Lighting": "Electrical & Lighting Department",
    "Garbage": "Sanitation Department",
    "garbage": "Sanitation Department",
    "waste": "Sanitation Department",
    "Sanitation": "Sanitation Department",
    "Vandalism": "Public Property Department",
    "vandalism": "Public Property Department",
    "graffiti": "Public Property Department",
    "Water": "Water & Sewage Department",
    "leak": "Water & Sewage Department",
    "flood": "Water & Sewage Department",
    "Traffic": "Traffic Management Department",
    "signal": "Traffic Management Department",
    "Parks": "Parks & Recreation Department",
    "tree": "Parks & Recreation Department"
}

@app.get("/")
def home():
    return {"message": "AI Detection Server is running"}

@app.get("/health")
def health():
    return {
        "status": "ok", 
        "model_loaded": model is not None,
        "is_loading": is_loading
    }

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    if model is None:
        if is_loading:
            return {"error": "AI Model is still loading in the background. Please try again in 10-20 seconds."}, 503
        return {"error": "AI Model failed to load. Please check server logs."}, 503

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run YOLO prediction
    results = model(file_path)

    detections = []
    top_prediction = "unknown"
    confidence = 0

    for r in results:
        for box in r.boxes:

            cls = int(box.cls)
            label = model.names[cls]
            conf = float(box.conf)

            detections.append({
                "label": label,
                "confidence": round(conf, 2)
            })

            if conf > confidence:
                top_prediction = label
                confidence = conf

    department = department_map.get(top_prediction, "Municipal Department")

    return {
        "prediction": top_prediction,
        "confidence": round(confidence, 2),
        "department": department,
        "all_detections": detections
    }