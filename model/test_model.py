from ultralytics import YOLO
import os

model_path = r"s:\LASTY_P_S2S\model\runs\smart_city_efficient_yolo112\weights\best.pt"
if os.path.exists(model_path):
    print(f"Loading model from {model_path}...")
    model = YOLO(model_path)
    print("Model loaded successfully!")
else:
    print(f"Model path {model_path} does not exist.")
