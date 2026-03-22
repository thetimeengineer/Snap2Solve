🏙️ Smart City Object Detection
Garbage & Pothole Detection using YOLOv8 and Gradio

An AI-powered computer vision application that detects garbage dumps and road potholes from images to support smart city infrastructure monitoring.
The system uses a custom-trained YOLOv8 model and provides an interactive Gradio web interface for real-time inference and summarized insights.

🚀 Project Highlights

✅ Custom-trained YOLOv8m model

✅ Dataset annotated & augmented using Roboflow

✅ Model trained on Google Colab (GPU)

✅ Interactive Gradio UI for image-based detection

✅ Adjustable Confidence and IoU thresholds

✅ Automatic detection summary (count-based)

✅ Industry-ready folder structure

🧠 Problem Statement

Urban infrastructure issues such as potholes and garbage accumulation negatively affect safety, cleanliness, and quality of life.
Manual reporting is slow and inconsistent.

This project automates the detection of these issues using deep learning-based object detection, enabling:

Faster identification

Data-driven decision making

Scalable smart city solutions


🛠️ Tech Stack
Category	             Technology
Language	             Python 3.9+
Model	                 YOLOv8 (Ultralytics)
Dataset	                 Roboflow
UI	                     Gradio
Image Processing	     Pillow
Training	             Google Colab (GPU)

📂 Project Structure 

Smart-City-Object-Detection/
│
├── .gradio/                    # Gradio runtime cache
├── .venv/                      # Virtual environment (local)
│
├── data/                       # Dataset (optional / reference)
│
├── app.py                      # Gradio application (deployment)
├── yolov8m.pt                  # Trained YOLOv8 model (custom)
│
├── model-training.ipynb        # Model training (Colab version)
├── notebook.ipynb              # Model testing, demo & evaluation
│
├── requirements.txt            # Project dependencies
└── README.md                   # Project documentation



📊 Dataset & Annotation
Platform: Roboflow

Classes:

pothole

garbage

Features used:

Bounding box annotation

Data augmentation (flip, rotate, brightness, blur)

Train / validation / test split

Dataset size: ~2,000+ images

🧪 Model Training
Architecture: YOLOv8m

Environment: Google Colab (GPU)

Framework: Ultralytics YOLO

Training notebook: model-training.ipynb

⚠️ Note:
Training notebooks are Colab-based copies and not intended for direct local execution without GPU support.

🖥️ Application Workflow
User uploads an image via Gradio UI

YOLOv8 model performs object detection

Bounding boxes are drawn on the image

Detected objects are counted per class

A natural-language summary is generated

🎯 Gradio Interface Features
Image upload (JPG / PNG)

Confidence threshold slider

IoU threshold slider

Detection visualization

Automatic textual summary

### Create Virtual Environment
python -m venv .venv
source .venv/bin/activate      # Linux/Mac
.venv\Scripts\activate         # Windows

### Install Dependencies
pip install -r requirements.txt

### Run the Application
python app.py

Gradio will launch a local web app and provide a public shareable link.


📈 Output Example
✔️ Detected: 2 potholes and 1 garbage dump

✔️ Visual bounding boxes on image

✔️ Text summary:

"Total of 3 issues detected: 2 potholes and 1 garbage detected."

🔐 Limitations
Works only on image-based input

No real-time video inference (yet)

Performance depends on image quality

CPU inference is slower than GPU

🚧 Future Enhancements
🎥 Real-time video & CCTV stream detection

📍 GPS-based issue mapping

🗂️ Database integration for issue tracking

🌐 Web dashboard for municipalities

📱 Mobile app integration


