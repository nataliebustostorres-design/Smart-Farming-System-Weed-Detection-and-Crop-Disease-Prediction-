# weed.py
# This module provides weed-related insights based on plant diseases

weed_info = {
    'Apple___Black_rot': {
        "risk": "High",
        "weeds": ["Dandelion", "Crabgrass"],
        "advice": "Weeds increase humidity and help fungal diseases spread. Remove nearby weeds."
    },

    'Apple___Cedar_apple_rust': {
        "risk": "Medium",
        "weeds": ["Wild grasses"],
        "advice": "Remove surrounding weeds to reduce disease spread."
    },

    'Apple___healthy': {
        "risk": "Low",
        "weeds": ["General weeds"],
        "advice": "Maintain clean soil to prevent weed growth."
    },

    'Cherry___Powdery_mildew': {
        "risk": "High",
        "weeds": ["Broadleaf weeds"],
        "advice": "Weeds trap moisture. Remove them to reduce fungal growth."
    },

    'Cherry___healthy': {
        "risk": "Low",
        "weeds": ["General weeds"],
        "advice": "Keep area clean and monitor regularly."
    },
    'Corn___Cercospora_leaf_spot Gray_leaf_spot':{
        "risk": "High",
        "weeds": ["Pigweed", "Crabgrass"],
        "advice": "These weeds thrive in humid conditions. Control them to reduce disease risk."
    },

    'Corn___Common_rust': {
        "risk": "Medium",
        "weeds": ["Foxtail", "Barnyard grass"],
        "advice": "Weeds compete with corn for nutrients. Keep rows clean."
    },

    'Corn___Northern_Leaf_Blight': {
        "risk": "High",
        "weeds": ["Pigweed", "Foxtail"],
        "advice": "Weeds can worsen disease spread. Remove weeds and improve airflow."
    },

    'Corn___healthy': {
        "risk": "Low",
        "weeds": ["Field weeds"],
        "advice": "Maintain weed control to protect crops."
    },

    'Potato___Early_blight': {
        "risk": "Medium",
        "weeds": ["Nightshade"],
        "advice": "Remove weeds to prevent disease spread."
    },

    'Potato___Late_blight': {
        "risk": "High",
        "weeds": ["Nightshade"],
        "advice": "Nightshade weeds can host disease. Remove immediately."
    },

    'Potato___healthy': {
        "risk": "Low",
        "weeds": ["General weeds"],
        "advice": "Keep soil clean and controlled."
    },

    'Strawberry___Leaf_scorch': {
        "risk": "Medium",
        "weeds": ["Broadleaf weeds"],
        "advice": "Remove weeds to improve airflow and reduce stress."
    },

    'Strawberry___healthy': {
        "risk": "Low",
        "weeds": ["General weeds"],
        "advice": "Maintain regular weeding practices."
    }
}
def get_weed_info(class_name):
    return weed_info.get(class_name, {
        "risk": "Unknown",
        "weeds": ["Unknown"],
        "advice": "No weed information available."
    })