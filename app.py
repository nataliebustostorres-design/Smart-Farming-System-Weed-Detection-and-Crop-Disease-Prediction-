import os
import base64
import cv2
import eel
import shutil
from ultralytics import YOLO
from recommendations import recommendations
from weed import get_weed_info
from ai_helper import generate_response

# Init eel
eel.init("web")

# Load model
model = YOLO("models/best.pt")

WEB_RUNS_PATH = "web/runs"
if not os.path.exists(WEB_RUNS_PATH):
    try:
        if os.path.exists("runs"):
            shutil.copytree("runs", WEB_RUNS_PATH)
    except Exception as e:
        print(f"Error copying runs: {e}")

@eel.expose
def analyze_image(base64_data, filename):
    try:
        os.makedirs("web/uploads", exist_ok=True)
        os.makedirs("web/annotated", exist_ok=True)

        image_data = base64.b64decode(base64_data.split(',')[1])
        upload_path = os.path.join("web/uploads", filename)
        with open(upload_path, 'wb') as f:
            f.write(image_data)

        results = model.predict(source=upload_path)

        detections = []
        for box in results[0].boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            class_name = results[0].names[cls]
            rec = recommendations.get(class_name, 'Consult a specialist for advice.')
            weed_data = get_weed_info(class_name)

            parts = class_name.split("___")
            plant = parts[0]
            disease = parts[1] if len(parts) > 1 else "Unknown Disease"
            ai_text = generate_response(plant, disease, conf, weed_data["risk"])

            detections.append({
                "class": class_name,
                "confidence": round(conf, 2),
                "recommendation": rec,
                "weed_risk": weed_data["risk"],
                "common_weeds": weed_data["weeds"],
                "weed_advice": weed_data["advice"],
                "ai_explanation": ai_text
            })

        annotated_img = results[0].plot()
        cv2.imwrite(os.path.join("web/annotated", filename), annotated_img)

        return {
            "image": f"annotated/{filename}",
            "detections": detections
        }
    except Exception as e:
        return {"error": str(e)}

@eel.expose
def capture_and_analyze():
    pass

# Start app
eel.start("index.html", size=(1200, 800))
