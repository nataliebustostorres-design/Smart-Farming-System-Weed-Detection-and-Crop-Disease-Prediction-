# ai_helper.py

def generate_response(plant, disease, confidence, weed_risk):
    text = f"The system detected {disease} in {plant} with a confidence of {confidence}. "

    if confidence >= 0.8:
        text += "This is a strong and reliable prediction. "
    elif confidence >= 0.5:
        text += "This prediction is moderately reliable. "
    else:
        text += "This prediction has low confidence and should be verified. "

    text += f"The weed risk in this scenario is {weed_risk}. "

    if weed_risk == "High":
        text += "Weeds may significantly affect crop health and should be controlled immediately."
    elif weed_risk == "Medium":
        text += "Weeds may impact growth, regular monitoring is recommended."
    else:
        text += "Weed impact is minimal, but maintenance is still important."

    return text
