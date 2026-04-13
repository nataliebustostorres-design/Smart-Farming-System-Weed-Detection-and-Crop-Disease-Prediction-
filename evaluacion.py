from ultralytics import YOLO
from sklearn.metrics import confusion_matrix, classification_report

# Evaluation detection (precision, recall, mAP)
model = YOLO("models/best.pt")
metrics = model.val(data="dataset/data.yaml")

print("Precision:", metrics.box.map50)
print("mAP@0.5:0.95:", metrics.box.map)
print("Recall:", metrics.box.recall)


y_true = [0, 1, 2, 2, 1]
y_pred = [0, 1, 2, 1, 1]

cm = confusion_matrix(y_true, y_pred)
print("Matrix of confusion:\n", cm)

print(classification_report(y_true, y_pred, target_names=["Healthy","DiseaseA","DiseaseB"]))
