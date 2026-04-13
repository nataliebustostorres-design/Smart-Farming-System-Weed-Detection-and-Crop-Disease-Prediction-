# Smart Farming System

A web-based application for intelligent plant disease and weed detection using image analysis.

## Features

- **Image Upload & Capture**: Upload images from device or capture directly from camera
- **AI Disease Detection**: Uses YOLOv8 model to identify plant diseases with confidence levels
- **Weed Risk Assessment**: Analyzes potential weed presence and provides management advice
- **Smart Recommendations**: Provides tailored treatment recommendations based on detected conditions
- **AI Chat Assistant**: Interactive chat feature for detailed explanations of analysis results
- **Real-time Results**: Instant processing and display of annotated images with detection overlays

## Technologies Used

- **Backend**: Python
- **AI Model**: Ultralytics YOLOv8 for object detection
- **GUI Framework**: Eel (Python + HTML/CSS/JavaScript)
- **Frontend**: HTML5, CSS3, JavaScript

## Installation

1. **Prerequisites**:
   - Python 3.8 or higher
   - Webcam (optional, for camera capture)

2. **Install dependencies**:
   ```bash
   pip install ultralytics eel opencv-python pillow
   ```

3. **Download/Prepare the model**:
   - Ensure `models/best.pt` contains the trained YOLO model
   - Dataset should be in `dataset/` directory

## Usage

1. **Start the application**:
   ```bash
   python app.py
   ```

2. **Access the web interface**:
   - The application will open in the default web browser

3. **Analyze images**:
   - Click "Upload Image" to select a file from your device
   - Or click "Take Photo" to capture using your camera
   - Click "Analyze" to process the image
   - View results in the output panel with detections and recommendations

4. **Additional features**:
   - Use the chat feature to get AI explanations of results
   - Switch to diagrams view for additional visualizations

## Project Structure

```
SmartSystemDetection/
├── app.py                 # Main application entry point
├── ai_helper.py          # chat assistant functionality
├── evaluacion.py         # Evaluation utilities
├── recommendations.py    # Recommendation engine
├── weed.py              # Weed analysis module
├── models/
│   └── best.pt          # Trained YOLO model
├── dataset/             # Training/validation data
├── web/                 # Frontend files
│   ├── index.html       # Main HTML interface
│   ├── script.js        # JavaScript functionality
│   ├── style.css        # Styling
│   ├── uploads/         # Uploaded images
│   └── annotated/       # Processed annotated images
└── runs/                # YOLO output directories
```

## Model Training

The system uses a custom-trained YOLOv8 model for plant disease detection. To retrain or modify the model:

1. Prepare the dataset in YOLO format
2. Use the dataset in `dataset/` directory
3. Train using Ultralytics CLI or Python API


