let selectedImageBase64 = "";
let selectedImageFilename = "";
let stream = null;

function formatLabel(label) {
    const parts = label.split("___");
    return {
        plant: parts[0],
        disease: parts[1] || "Unknown"
    };
}

function getConfidenceLevel(conf) {
    if (conf >= 0.8) return "High confidence";
    if (conf >= 0.5) return "Medium confidence";
    return "Low confidence";
}

function getStatusEmoji(disease) {
    if (disease.toLowerCase() === "healthy") {
        return "Healthy";
    }
    return "Disease Detected";
}


// Upload image
function uploadImage() {
    const input = document.createElement("input");
    input.type = "file";

    input.onchange = e => {
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById("preview").src = event.target.result;
            selectedImageBase64 = event.target.result;
            selectedImageFilename = file.name;
        };
        reader.readAsDataURL(file);
    };

    input.click();
}

// Take photo
async function takePhoto() {
    const video = document.getElementById("camera");
    const captureBtn = document.getElementById("captureBtn");

    video.style.display = "block";
    captureBtn.style.display = "inline-block";

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        alert("Camera error: " + err);
    }
}

// Capture image
document.getElementById("captureBtn").onclick = function() {
    const video = document.getElementById("camera");
    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const dataURL = canvas.toDataURL("image/jpeg");

    document.getElementById("preview").src = dataURL;
    selectedImageBase64 = dataURL;
    selectedImageFilename = "capture.jpg";

    // Stop camera
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    video.style.display = "none";
    document.getElementById("captureBtn").style.display = "none";
};

// Analyze
async function analyze() {
    if (!selectedImageBase64) {
        alert("Select an image first");
        return;
    }

    const result = await eel.analyze_image(
        selectedImageBase64,
        selectedImageFilename
    )();
    window.lastDetections = result.detections;

    if (result.error) {
        document.getElementById("results").innerText = result.error;
        return;
    }

    document.getElementById("output").src =
        result.image + "?t=" + new Date().getTime();

    let html = "";

    result.detections.forEach(d => {
    const info = formatLabel(d.class);
    const level = getConfidenceLevel(d.confidence);
    const status = getStatusEmoji(info.disease);

    html += `
        <div class="result-card">
            <h3>${info.plant}</h3>
            <p>${status}</p>
            <p><strong>Condition:</strong> ${info.disease}</p>
            <p><strong>Confidence:</strong> ${level}</p>
            <p class="rec">${d.recommendation}</p>

            <hr>

            <p><strong>Weed Risk:</strong> ${d.weed_risk}</p>
            <p><strong>Common Weeds:</strong> ${d.common_weeds.join(", ")}</p>
            <p><strong>Weed Advice:</strong> ${d.weed_advice}</p>

        </div>
    `;
});

document.getElementById("results").innerHTML = html;
}

// Clear
function clearResults() {
    const preview = document.getElementById("preview");
    const output = document.getElementById("output");
    const results = document.getElementById("results");
    const chat = document.getElementById("chatMessages");
    const video = document.getElementById("camera");
    const captureBtn = document.getElementById("captureBtn");


    if (preview) preview.src = "";
    if (output) output.src = "";
    if (results) results.innerHTML = "";
    if (chat) chat.innerHTML = "";

    selectedImageBase64 = "";
    selectedImageFilename = "";
    window.lastDetections = [];

}

// switch to diagrams
function openDiagrams() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    document.getElementById("mainApp").style.display = "none";
    document.getElementById("diagrams").style.display = "block";
}

//back to main app
function goBack() {
    document.getElementById("diagrams").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
}

// Chat with AI
function addMessage(text, type) {
    const container = document.getElementById("chatMessages");

    const msg = document.createElement("div");
    msg.className = type === "user" ? "user-msg" : "ai-msg";

    msg.innerText = text;
    container.appendChild(msg);

    container.scrollTop = container.scrollHeight;
}

function askAI() {
    if (!window.lastDetections || window.lastDetections.length === 0) {
        addMessage("No analysis available.", "ai");
        return;
    }
    const d = window.lastDetections[0];

    // User's message
    addMessage("Explain the result", "user");

    // AI message
    addMessage(d.ai_explanation || "No AI explanation available.", "ai");
}