from pathlib import Path
import base64
import shutil

import cv2
import eel
from ultralytics import YOLO

from recommendations import recommendations
from weed import get_weed_info
from ai_helper import generate_response

BASE_DIR = Path(__file__).resolve().parent
WEB_DIR = BASE_DIR / "web"
MODEL_PATH = BASE_DIR / "models" / "best.pt"
WEB_RUNS_PATH = WEB_DIR / "runs"
RUNS_PATH = BASE_DIR / "runs"

eel.init(str(WEB_DIR))

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model not found at {MODEL_PATH}. Copy models/best.pt from the original project."
    )

model = YOLO(str(MODEL_PATH))

if not WEB_RUNS_PATH.exists() and RUNS_PATH.exists():
    try:
        shutil.copytree(RUNS_PATH, WEB_RUNS_PATH)
    except Exception as exc:
        print(f"Error copying runs: {exc}")


@eel.expose
def analyze_image(base64_data, filename):
    try:
        uploads_dir = WEB_DIR / "uploads"
        annotated_dir = WEB_DIR / "annotated"
        uploads_dir.mkdir(parents=True, exist_ok=True)
        annotated_dir.mkdir(parents=True, exist_ok=True)

        safe_filename = Path(filename or "image.jpg").name
        if "," not in base64_data:
            return {"error": "Invalid image data."}

        image_data = base64.b64decode(base64_data.split(",", 1)[1])
        upload_path = uploads_dir / safe_filename
        upload_path.write_bytes(image_data)

        results = model.predict(source=str(upload_path))
        detections = []

        for box in results[0].boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            class_name = results[0].names[cls]
            rec = recommendations.get(class_name, "Consult a specialist for advice.")
            weed_data = get_weed_info(class_name)

            parts = class_name.split("___")
            plant = parts[0]
            disease = parts[1] if len(parts) > 1 else "Unknown Disease"
            ai_text = generate_response(plant, disease, conf, weed_data["risk"])

            detections.append(
                {
                    "class": class_name,
                    "confidence": round(conf, 2),
                    "recommendation": rec,
                    "weed_risk": weed_data["risk"],
                    "common_weeds": weed_data["weeds"],
                    "weed_advice": weed_data["advice"],
                    "ai_explanation": ai_text,
                }
            )

        annotated_img = results[0].plot()
        cv2.imwrite(str(annotated_dir / safe_filename), annotated_img)

        return {
            "image": f"annotated/{safe_filename}",
            "detections": detections,
        }
    except Exception as exc:
        return {"error": str(exc)}


@eel.expose
def capture_and_analyze():
    return {"error": "Camera capture is handled in the browser UI."}


if __name__ == "__main__":
    eel.start("index.html", size=(1280, 860), mode='edge')
