import gradio as gr
from ultralytics import YOLO
from PIL import Image

# 1. Load your YOLO model
model = YOLO(r"s:\LASTY_P_S2S\model\runs\smart_city_efficient_yolo112\weights\best.pt") 

def predict_image(image, conf_threshold, iou_threshold):
    """
    Function to run inference on an image and generate a summary.
    """
    if image is None:
        return None, "No image uploaded."
    
    results = model.predict(
        source=image,
        conf=conf_threshold,
        iou=iou_threshold
    )
    
    detection_summary = {}
    total_detections = 0
    plotted_image = None
    
    for r in results:
        boxes = r.boxes  
        class_indices = boxes.cls.tolist()
        class_names = model.names 
        
        for cls_index in class_indices:
            name = class_names.get(int(cls_index), 'Unknown')
            detection_summary[name] = detection_summary.get(name, 0) + 1
            total_detections += 1
            
        im_array = r.plot()  
        plotted_image = Image.fromarray(im_array[..., ::-1]) 
        
    if total_detections == 0:
        description = "No issues (potholes, garbage, vandalism, or streetlights) were detected in the image."
    else:
        description_parts = [
            f"{count} {name}{'s' if count > 1 else ''}" 
            for name, count in detection_summary.items()
        ]
        
        if len(description_parts) == 1:
            description = f"{description_parts[0]} detected."
        else:
            description = ", ".join(description_parts[:-1]) + f" and {description_parts[-1]} detected."
        
        description = f"Total of {total_detections} issues detected: {description}"
        
    return plotted_image, description

# 2. Create the Gradio Interface
iface = gr.Interface(
    fn=predict_image,
    inputs=[
        gr.Image(type="pil", label="Upload Image"),
        gr.Slider(minimum=0, maximum=1, value=0.25, label="Confidence Threshold"),
        gr.Slider(minimum=0, maximum=1, value=0.45, label="IoU Threshold")
    ],
    outputs=[
        gr.Image(type="pil", label="Detection Result"),
        gr.Textbox(label="Prediction Summary")
    ],
    title="Smart City Object Detection",
    description="Upload an image to detect objects (Potholes, Garbage, Vandalism, Streetlights) and see a summarized count."
)

# 3. Launch the app
if __name__ == "__main__":
    iface.launch(share=True)