from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import shutil
import os

from contextlib import asynccontextmanager

# Global model variable
model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load trained model on startup
    global model
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    # Force use best.pt in the same directory as api.py for Render
    MODEL_FILENAME = "best.pt"
    MODEL_PATH = os.path.join(BASE_DIR, MODEL_FILENAME)
    
    print(f"DEBUG: STARTUP LOGS")
    print(f"DEBUG: Current directory (os.getcwd()): {os.getcwd()}")
    print(f"DEBUG: BASE_DIR (api.py location): {BASE_DIR}")
    print(f"DEBUG: Checking for model at: {MODEL_PATH}")
    
    if not os.path.exists(MODEL_PATH):
        print(f"ERROR: Model file {MODEL_FILENAME} NOT FOUND at {MODEL_PATH}")
        print(f"DEBUG: Directory contents of {BASE_DIR}: {os.listdir(BASE_DIR)}")
        # Try to find any .pt file as a fallback
        pt_files = [f for f in os.listdir(BASE_DIR) if f.endswith('.pt')]
        if pt_files:
            print(f"DEBUG: Found alternative model files: {pt_files}")
            MODEL_PATH = os.path.join(BASE_DIR, pt_files[0])
            print(f"DEBUG: Falling back to {MODEL_PATH}")
        else:
            raise FileNotFoundError(f"Could not find {MODEL_FILENAME} or any .pt file in {BASE_DIR}")
    
    print(f"DEBUG: Loading YOLO model from {MODEL_PATH}...")
    model = YOLO(MODEL_PATH)
    yield
    # Clean up on shutdown
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
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    if model is None:
        return {"error": "Model is still loading or failed to load. Please try again in a few seconds."}, 503

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