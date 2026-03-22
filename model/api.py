from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import shutil
import os

app = FastAPI()

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

# Load trained model
MODEL_PATH = os.getenv("MODEL_PATH", "runs/smart_city_efficient_yolo112/weights/best.pt")
model = YOLO(MODEL_PATH)

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
    return {"message": "Civic Issue AI Detection API Running"}

@app.post("/detect")
async def detect(file: UploadFile = File(...)):

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