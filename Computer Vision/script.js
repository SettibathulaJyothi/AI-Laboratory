
const $ = (id) => document.getElementById(id);

const imageInput = $("imageInput");
const uploadZone = $("uploadZone");
const statusBox = $("statusBox");
const statusIcon = $("statusIcon");
const statusTitle = $("statusTitle");
const statusMessage = $("statusMessage");
const progressWrap = $("progressWrap");
const progressBar = $("progressBar");
const progressText = $("progressText");
const fileInfo = $("fileInfo");
const fileName = $("fileName");
const fileSize = $("fileSize");
const changeImageBtn = $("changeImageBtn");
const emptyPreview = $("emptyPreview");
const imageStage = $("imageStage");
const sourceImage = $("sourceImage");
const canvas = $("landmarkCanvas");
const ctx = canvas.getContext("2d");
const faceCount = $("faceCount");
const landmarkCount = $("landmarkCount");
const detectBtn = $("detectBtn");
const resetBtn = $("resetBtn");
const meshOnBtn = $("meshOnBtn");
const meshOffBtn = $("meshOffBtn");
const pointsToggle = $("pointsToggle");

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const VISION_CDN =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

let imageUrl = null;
let hasImage = false;
let detector = null;
let detectorPromise = null;
let FaceLandmarkerClass = null;
let detectedFaces = [];
let meshEnabled = true;
let isDetecting = false;
let currentLoadToken = 0;

// ---------------- STATUS ----------------

function setStatus(type, title, message) {
  const icons = {
    info: "ℹ",
    loading: "⟳",
    success: "✓",
    error: "!"
  };

  statusBox.className = `status-box ${type}`;
  statusIcon.textContent = icons[type] || "ℹ";
  statusTitle.textContent = title;
  statusMessage.textContent = message;
}

function showProgress(percent, message) {
  progressWrap.hidden = false;
  progressBar.style.width = `${percent}%`;
  progressText.textContent = message;
}

function hideProgress() {
  progressWrap.hidden = true;
  progressBar.style.width = "0%";
}

function formatFileSize(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ---------------- CANVAS ----------------

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function fitCanvas() {
  if (!sourceImage.naturalWidth || !sourceImage.naturalHeight) {
    return;
  }

  canvas.width = sourceImage.naturalWidth;
  canvas.height = sourceImage.naturalHeight;

  redraw();
}

function redraw() {
  clearCanvas();

  if (!hasImage || !canvas.width || !canvas.height) {
    return;
  }

  detectedFaces.forEach((landmarks) => {
    if (meshEnabled) {
      drawMesh(landmarks);
    }

    if (pointsToggle.checked) {
      drawPoints(landmarks);
    }
  });
}

// ---------------- COLORFUL FACE MESH ----------------

function drawMesh(landmarks) {
  const connections =
    FaceLandmarkerClass?.FACE_LANDMARKS_TESSELATION;

  if (!connections) {
    console.warn("Face mesh connections are unavailable.");
    return;
  }

  ctx.save();
  ctx.lineWidth = Math.max(0.8, canvas.width / 1500);
  ctx.globalAlpha = 0.9;

  connections.forEach((edge, index) => {
    const start = landmarks[edge.start];
    const end = landmarks[edge.end];

    if (!start || !end) return;

    ctx.strokeStyle =
      index % 2 === 0 ? "#48e0ed" : "#bd76ff";

    ctx.beginPath();
    ctx.moveTo(
      start.x * canvas.width,
      start.y * canvas.height
    );
    ctx.lineTo(
      end.x * canvas.width,
      end.y * canvas.height
    );
    ctx.stroke();
  });

  ctx.restore();
}

// ---------------- COLORFUL LANDMARK POINTS ----------------

function drawPoints(landmarks) {
  const radius = Math.max(1.8, canvas.width / 420);

  const colors = [
    "#ffe45e",
    "#ff55d9",
    "#50efa2",
    "#ffffff"
  ];

  ctx.save();

  landmarks.forEach((point, index) => {
    const x = point.x * canvas.width;
    const y = point.y * canvas.height;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    ctx.fillStyle =
      colors[Math.floor(index / 30) % colors.length];

    ctx.fill();

    ctx.lineWidth = Math.max(0.7, radius * 0.35);
    ctx.strokeStyle = "#101426";
    ctx.stroke();
  });

  ctx.restore();
}

// ---------------- IMAGE UPLOAD ----------------

function openFilePicker() {
  imageInput.click();
}

changeImageBtn.addEventListener("click", openFilePicker);

uploadZone.addEventListener("click", (event) => {
  if (event.target.closest("label")) return;
  openFilePicker();
});

uploadZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openFilePicker();
  }
});

uploadZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  uploadZone.classList.add("dragging");
});

uploadZone.addEventListener("dragleave", () => {
  uploadZone.classList.remove("dragging");
});

uploadZone.addEventListener("drop", (event) => {
  event.preventDefault();
  uploadZone.classList.remove("dragging");

  const file = event.dataTransfer.files[0];

  if (file) {
    loadImageFile(file);
  }
});

imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  // Allow the same file to be selected again.
  imageInput.value = "";

  if (file) {
    loadImageFile(file);
  }
});

function loadImageFile(file) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    setStatus(
      "error",
      "Unsupported file type",
      "Please select a JPG, PNG, or WEBP image."
    );
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    setStatus(
      "error",
      "Image is too large",
      "Please choose an image smaller than 15 MB."
    );
    return;
  }

  const token = ++currentLoadToken;

  if (imageUrl) {
    URL.revokeObjectURL(imageUrl);
  }

  imageUrl = URL.createObjectURL(file);

  hasImage = false;
  detectedFaces = [];

  detectBtn.disabled = true;

  faceCount.textContent = "Faces: —";
  landmarkCount.textContent = "Landmarks: —";

  clearCanvas();

  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  fileInfo.hidden = false;

  setStatus(
    "loading",
    "Loading image",
    "Opening your photo in the browser..."
  );

  showProgress(25, "Opening selected image...");

  sourceImage.onload = () => {
    if (token !== currentLoadToken) return;

    if (!sourceImage.naturalWidth) {
      showImageError(token);
      return;
    }

    hasImage = true;

    uploadZone.hidden = true;
    emptyPreview.hidden = true;
    imageStage.hidden = false;

    fitCanvas();

    detectBtn.disabled = false;

    showProgress(100, "Image loaded successfully!");

    setStatus(
      "success",
      "Image loaded successfully!",
      `${file.name} is ready. Click Detect Landmarks.`
    );

    window.setTimeout(() => {
      if (token === currentLoadToken) {
        hideProgress();
      }
    }, 900);
  };

  sourceImage.onerror = () => showImageError(token);

  sourceImage.alt = `Selected image: ${file.name}`;
  sourceImage.src = imageUrl;
}

function showImageError(token) {
  if (token !== currentLoadToken) return;

  hasImage = false;
  detectBtn.disabled = true;

  imageStage.hidden = true;
  emptyPreview.hidden = false;
  uploadZone.hidden = false;
  fileInfo.hidden = true;

  hideProgress();

  setStatus(
    "error",
    "Could not display this image",
    "Try another JPG, PNG, or WEBP photo."
  );
}

// ---------------- LOAD MEDIAPIPE ----------------

async function getDetector() {
  if (detector) return detector;
  if (detectorPromise) return detectorPromise;

  detectorPromise = (async () => {
    setStatus(
      "loading",
      "Loading AI model",
      "Downloading MediaPipe and the face landmark model..."
    );

    showProgress(15, "Loading computer vision library...");

    const {
      FaceLandmarker,
      FilesetResolver
    } = await import(
      `${VISION_CDN}/vision_bundle.mjs`
    );

    FaceLandmarkerClass = FaceLandmarker;

    const vision =
      await FilesetResolver.forVisionTasks(
        `${VISION_CDN}/wasm`
      );

    showProgress(55, "Loading face landmark model...");

    const model = await FaceLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: "CPU"
        },

        runningMode: "IMAGE",
        numFaces: 5,

        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5
      }
    );

    detector = model;
    return model;
  })();

  try {
    return await detectorPromise;
  } catch (error) {
    detectorPromise = null;
    throw error;
  }
}

// ---------------- DETECT LANDMARKS ----------------

detectBtn.addEventListener("click", async () => {
  if (!hasImage || isDetecting) return;

  isDetecting = true;
  detectBtn.disabled = true;

  setStatus(
    "loading",
    "Detecting facial landmarks",
    "The AI model is analyzing your photo..."
  );

  showProgress(70, "Analyzing face...");

  try {
    const faceDetector = await getDetector();

    if (
      !hasImage ||
      !sourceImage.complete ||
      !sourceImage.naturalWidth
    ) {
      throw new Error(
        "The image is not ready. Please select it again."
      );
    }

    // Detect landmarks in the uploaded image.
    const result = faceDetector.detect(sourceImage);

    detectedFaces = result.faceLandmarks || [];

    faceCount.textContent =
      `Faces: ${detectedFaces.length}`;

    const totalLandmarks = detectedFaces.reduce(
      (total, face) => total + face.length,
      0
    );

    landmarkCount.textContent =
      `Landmarks: ${totalLandmarks}`;

    fitCanvas();

    if (detectedFaces.length === 0) {
      setStatus(
        "info",
        "No face detected",
        "Try a clear, front-facing photo with good lighting."
      );
    } else {
      setStatus(
        "success",
        "Detection complete!",
        `Found ${detectedFaces.length} face(s) and ${totalLandmarks} landmarks.`
      );
    }

    showProgress(100, "Detection finished!");

    window.setTimeout(hideProgress, 1000);

  } catch (error) {
    console.error("Face detection error:", error);

    setStatus(
      "error",
      "AI detection failed",
      `${error.message || "Unknown error"} Check your internet connection and refresh the page.`
    );

    hideProgress();

  } finally {
    isDetecting = false;
    detectBtn.disabled = !hasImage;
  }
});

// ---------------- MESH ON / OFF ----------------

function setMeshMode(enabled) {
  meshEnabled = enabled;

  meshOnBtn.classList.toggle("active", enabled);
  meshOffBtn.classList.toggle("active", !enabled);

  meshOnBtn.setAttribute("aria-pressed", String(enabled));
  meshOffBtn.setAttribute("aria-pressed", String(!enabled));

  redraw();

  if (detectedFaces.length) {
    setStatus(
      "success",
      enabled ? "Mesh ON" : "Mesh OFF",
      enabled
        ? "Cyan and violet connections and landmark points are visible."
        : pointsToggle.checked
          ? "Mesh connections are hidden. Colored points remain visible."
          : "Mesh connections and points are hidden."
    );
  }
}

meshOnBtn.addEventListener("click", () => {
  setMeshMode(true);
});

meshOffBtn.addEventListener("click", () => {
  setMeshMode(false);
});

pointsToggle.addEventListener("change", redraw);

// ---------------- RESET ----------------

resetBtn.addEventListener("click", () => {
  currentLoadToken++;

  if (imageUrl) {
    URL.revokeObjectURL(imageUrl);
  }

  imageUrl = null;

  sourceImage.onload = null;
  sourceImage.onerror = null;
  sourceImage.removeAttribute("src");

  imageInput.value = "";

  hasImage = false;
  detectedFaces = [];

  detectBtn.disabled = true;

  faceCount.textContent = "Faces: —";
  landmarkCount.textContent = "Landmarks: —";

  uploadZone.hidden = false;
  imageStage.hidden = true;
  emptyPreview.hidden = false;
  fileInfo.hidden = true;

  meshEnabled = true;

  meshOnBtn.classList.add("active");
  meshOffBtn.classList.remove("active");

  meshOnBtn.setAttribute("aria-pressed", "true");
  meshOffBtn.setAttribute("aria-pressed", "false");

  pointsToggle.checked = true;

  clearCanvas();
  hideProgress();

  setStatus(
    "info",
    "Waiting for image",
    "Choose a photo to begin."
  );
});

// ---------------- RESIZE ----------------

window.addEventListener("resize", () => {
  if (hasImage) {
    fitCanvas();
  }
});
