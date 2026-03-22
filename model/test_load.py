from ultralytics import YOLO
import os

MODEL_PATH = "runs/smart_city_efficient_yolo112/weights/best.pt"
print(f"Loading model from {MODEL_PATH}")
if os.path.exists(MODEL_PATH):
    print("Path exists!")
    model = YOLO(MODEL_PATH)
    print("Model loaded successfully!")
else:
    print("Path does NOT exist!")
