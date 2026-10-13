let selectedImageBase64 = "";
let selectedImageFilename = "";
let stream = null;
window.lastDetections = [];

const el = id => document.getElementById(id);

function formatLabel(label) {
    const parts = String(label || "Unknown").split("___");
    return {
        plant: (parts[0] || "Unknown crop").replaceAll("_", " "),
        disease: (parts[1] || "Unknown condition").replaceAll("_", " ")
    };
}

function getConfidenceLevel(conf) {
    if (conf >= 0.8) return "High confidence";
    if (conf >= 0.5) return "Medium confidence";
    return "Low confidence";
}

function setStatus(message, state = "idle") {
    const status = el("analysisStatus");
    if (!status) return;
    status.className = `analysis-status ${state}`;
    status.innerHTML = `<span class="status-indicator"></span><span>${message}</span>`;
}

function showMedia(targetId, emptyId) {
    const target = el(targetId);
    const empty = el(emptyId);
    if (target) target.style.display = "block";
    if (empty) empty.style.display = "none";
}

function uploadImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg";
    input.onchange = event => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            el("preview").src = e.target.result;
            showMedia("preview", "previewEmpty");
            selectedImageBase64 = e.target.result;
            selectedImageFilename = file.name;
            setStatus("Image ready. Run the analysis when you are ready.", "idle");
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

async function takePhoto() {
    const video = el("camera");
    const captureBtn = el("captureBtn");
    try {
        stopCamera();
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.style.display = "block";
        el("preview").style.display = "none";
        el("previewEmpty").style.display = "none";
        captureBtn.style.display = "block";
        setStatus("Camera active. Capture a clear image of the crop.", "idle");
    } catch (err) {
        setStatus(`Camera unavailable: ${err.message || err}`, "error");
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    const video = el("camera");
    if (video) {
        video.srcObject = null;
        video.style.display = "none";
    }
    if (el("captureBtn")) el("captureBtn").style.display = "none";
}

el("captureBtn").onclick = function () {
    const video = el("camera");
    if (!video.videoWidth || !video.videoHeight) {
        setStatus("Camera image is not ready yet.", "error");
        return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataURL = canvas.toDataURL("image/jpeg", 0.92);
    el("preview").src = dataURL;
    showMedia("preview", "previewEmpty");
    selectedImageBase64 = dataURL;
    selectedImageFilename = "capture.jpg";
    stopCamera();
    setStatus("Photo captured. Run the analysis when you are ready.", "idle");
};

async function analyze() {
    if (!selectedImageBase64) {
        setStatus("Select or capture an image first.", "error");
        return;
    }

    const analyzeBtn = el("analyzeBtn");
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing…";
    setStatus("Running the crop-health model…", "loading");

    try {
        const result = await eel.analyze_image(selectedImageBase64, selectedImageFilename)();
        if (!result || result.error) {
            throw new Error(result?.error || "The backend returned no result.");
        }

        window.lastDetections = Array.isArray(result.detections) ? result.detections : [];
        el("output").src = `${result.image}?t=${Date.now()}`;
        showMedia("output", "outputEmpty");
        renderResults(window.lastDetections);
        setStatus(
            window.lastDetections.length
                ? `${window.lastDetections.length} detection${window.lastDetections.length === 1 ? "" : "s"} found.`
                : "Analysis complete. No detections were returned.",
            "success"
        );
    } catch (err) {
        window.lastDetections = [];
        el("results").innerHTML = `<div class="result-card"><p>${escapeHtml(err.message || String(err))}</p></div>`;
        setStatus("Analysis failed. Review the error below.", "error");
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Run analysis";
    }
}

function renderResults(detections) {
    if (!detections.length) {
        el("results").innerHTML = `<div class="result-card"><p>No disease or weed-related detections were returned for this image.</p></div>`;
        return;
    }

    el("results").innerHTML = detections.map(d => {
        const info = formatLabel(d.class);
        const confidence = Number(d.confidence || 0);
        const healthy = info.disease.toLowerCase() === "healthy";
        const weeds = Array.isArray(d.common_weeds) ? d.common_weeds.join(", ") : "Unknown";
        return `
            <article class="result-card">
                <div class="result-card-header">
                    <div>
                        <p class="panel-kicker">${healthy ? "Healthy crop" : "Condition detected"}</p>
                        <h4>${escapeHtml(info.plant)}</h4>
                    </div>
                    <span class="meta-chip">${escapeHtml(getConfidenceLevel(confidence))}</span>
                </div>
                <div class="result-meta">
                    <span class="meta-chip">${escapeHtml(info.disease)}</span>
                    <span class="meta-chip warning">Weed risk: ${escapeHtml(d.weed_risk || "Unknown")}</span>
                </div>
                <p><strong>Common weeds:</strong> ${escapeHtml(weeds)}</p>
                <p><strong>Weed guidance:</strong> ${escapeHtml(d.weed_advice || "No advice available.")}</p>
                <p class="recommendation"><strong>Crop recommendation:</strong> ${escapeHtml(d.recommendation || "Consult a specialist for advice.")}</p>
            </article>`;
    }).join("");
}

function clearResults() {
    stopCamera();
    ["preview", "output"].forEach(id => {
        el(id).src = "";
        el(id).style.display = "none";
    });
    el("previewEmpty").style.display = "grid";
    el("outputEmpty").style.display = "grid";
    el("results").innerHTML = "";
    el("chatMessages").innerHTML = "";
    selectedImageBase64 = "";
    selectedImageFilename = "";
    window.lastDetections = [];
    setStatus("Select an image to begin.", "idle");
}

function openDiagrams() {
    stopCamera();
    el("mainApp").style.display = "none";
    el("diagrams").style.display = "block";
}

function goBack() {
    el("diagrams").style.display = "none";
    el("mainApp").style.display = "block";
}

function addMessage(text, type) {
    const container = el("chatMessages");
    const msg = document.createElement("div");
    msg.className = type === "user" ? "user-msg" : "ai-msg";
    msg.textContent = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

function askAI() {
    if (!window.lastDetections.length) {
        addMessage("Run an analysis first so I have a result to explain.", "ai");
        return;
    }
    addMessage("Explain the result", "user");
    const d = window.lastDetections[0];
    addMessage(d.ai_explanation || "No AI explanation is available for this detection.", "ai");
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

window.addEventListener("beforeunload", stopCamera);
