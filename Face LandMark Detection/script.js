
const $ = (id) => document.getElementById(id);

const imageInput = $("imageInput");
const uploadZone = $("uploadZone");
const sourceImage = $("sourceImage");
const cameraVideo = $("cameraVideo");
const canvas = $("landmarkCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const imageStage = $("imageStage");
const emptyPreview = $("emptyPreview");
const cameraControls = $("cameraControls");
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
const faceCount = $("faceCount");
const landmarkCount = $("landmarkCount");
const detectBtn = $("detectBtn");
const resetBtn = $("resetBtn");
const meshOnBtn = $("meshOnBtn");
const meshOffBtn = $("meshOffBtn");
const pointsToggle = $("pointsToggle");
const uploadModeBtn = $("uploadModeBtn");
const cameraModeBtn = $("cameraModeBtn");
const startCameraBtn = $("startCameraBtn");
const stopCameraBtn = $("stopCameraBtn");
const captureBtn = $("captureBtn");
const captureCleanBtn = $("captureCleanBtn");
const changeImageBtn = $("changeImageBtn");
const zoomSlider = $("zoomSlider");
const zoomInBtn = $("zoomInBtn");
const zoomOutBtn = $("zoomOutBtn");
const zoomResetBtn = $("zoomResetBtn");
const zoomValue = $("zoomValue");
const pixelInfo = $("pixelInfo");

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const VISION_CDN =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

let detector = null;
let detectorPromise = null;
let detectorMode = "";
let FaceLandmarkerClass = null;

let activeSource = "upload";
let currentObjectURL = null;
let hasImage = false;
let meshEnabled = true;
let zoom = 1;

let cameraStream = null;
let cameraActive = false;
let cameraRequestToken = 0;
let animationFrameId = null;
let lastDetectionTime = 0;

let isDetecting = false;
let detectedFaces = [];
let loadToken = 0;

/* STATUS */

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

/* CANVAS */

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getMedia() {
  return activeSource === "camera" ? cameraVideo : sourceImage;
}

function getDimensions() {
  const media = getMedia();

  if (activeSource === "camera") {
    return { width: media.videoWidth, height: media.videoHeight };
  }

  return { width: media.naturalWidth, height: media.naturalHeight };
}

function drawMesh(landmarks) {
  const connections = FaceLandmarkerClass?.FACE_LANDMARKS_TESSELATION;
  if (!connections) return;

  ctx.save();
  ctx.lineWidth = Math.max(0.7, canvas.width / 1500);

  connections.forEach((edge, index) => {
    const start = landmarks[edge.start];
    const end = landmarks[edge.end];
    if (!start || !end) return;

    ctx.beginPath();
    ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
    ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
    ctx.strokeStyle = index % 2 === 0 ? "#48e0ed" : "#bd76ff";
    ctx.stroke();
  });

  ctx.restore();
}

function drawPoints(landmarks) {
  const radius = Math.max(1.5, canvas.width / 420);
  const colors = ["#ffe45e", "#ff55d9", "#50efa2", "#ffffff"];

  ctx.save();

  landmarks.forEach((point, index) => {
    ctx.beginPath();
    ctx.arc(
      point.x * canvas.width,
      point.y * canvas.height,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = colors[Math.floor(index / 30) % colors.length];
    ctx.fill();
  });

  ctx.restore();
}

function renderFrame(media, drawLandmarks = true) {
  if (!media) return;

  const size = getDimensions();
  if (!size.width || !size.height) return;

  if (canvas.width !== size.width || canvas.height !== size.height) {
    canvas.width = size.width;
    canvas.height = size.height;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(media, 0, 0, canvas.width, canvas.height);

  if (!drawLandmarks) return;

  detectedFaces.forEach((landmarks) => {
    if (meshEnabled) drawMesh(landmarks);
    if (pointsToggle.checked) drawPoints(landmarks);
  });
}

function showPreview() {
  imageStage.hidden = false;
  emptyPreview.hidden = true;
  sourceImage.hidden = true;
  cameraVideo.hidden = true;
  renderFrame(getMedia(), false);
  setZoom(zoom);
}

function clearDetection() {
  detectedFaces = [];
  faceCount.textContent = "Faces: —";
  landmarkCount.textContent = "Landmarks: —";
}

function showDetectionResult(faces) {
  detectedFaces = faces || [];
  faceCount.textContent = `Faces: ${detectedFaces.length}`;

  const total = detectedFaces.reduce((sum, face) => sum + face.length, 0);
  landmarkCount.textContent = `Landmarks: ${total}`;

  renderFrame(getMedia(), true);
  return total;
}

/* IMAGE UPLOAD */

function openFilePicker() {
  if (activeSource !== "upload") {
    stopCamera(false);
    activeSource = "upload";
    updateSourceButtons();
  }

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
  if (file) loadImageFile(file);
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  imageInput.value = "";
  if (file) loadImageFile(file);
});

function loadImageFile(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    setStatus("error", "Unsupported image", "Choose a JPG, PNG, or WEBP photo.");
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    setStatus("error", "Image too large", "Choose an image smaller than 15 MB.");
    return;
  }

  stopCamera(false);
  activeSource = "upload";
  updateSourceButtons();

  const token = ++loadToken;
  hasImage = false;
  clearDetection();
  detectBtn.disabled = true;

  fileInfo.hidden = false;
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);

  setStatus("loading", "Loading image", "Opening your photo...");
  showProgress(25, "Reading selected photo...");

  if (currentObjectURL) {
    URL.revokeObjectURL(currentObjectURL);
    currentObjectURL = null;
  }

  currentObjectURL = URL.createObjectURL(file);

  sourceImage.onload = () => {
    if (token !== loadToken) return;

    if (!sourceImage.naturalWidth || !sourceImage.naturalHeight) {
      imageLoadError(token);
      return;
    }

    hasImage = true;
    updateSourceButtons();
    showPreview();
    renderFrame(sourceImage, false);
    detectBtn.disabled = false;

    showProgress(100, "Photo loaded successfully!");
    setStatus(
      "success",
      "Image loaded successfully",
      "Your photo is ready. Click Detect Landmarks to analyze it."
    );

    window.setTimeout(() => {
      if (token === loadToken) hideProgress();
    }, 800);
  };

  sourceImage.onerror = () => imageLoadError(token);
  sourceImage.src = currentObjectURL;
}

function imageLoadError(token) {
  if (token !== loadToken) return;

  hasImage = false;
  detectBtn.disabled = true;
  imageStage.hidden = true;
  emptyPreview.hidden = false;
  uploadZone.hidden = false;
  fileInfo.hidden = true;

  hideProgress();
  setStatus(
    "error",
    "Could not load this photo",
    "Try a different JPG, PNG, or WEBP image."
  );
}

/* MEDIAPIPE AI MODEL */

async function getDetector(mode = "IMAGE") {
  if (detector && detectorMode === mode) return detector;

  if (detectorPromise) {
    await detectorPromise;
    if (detector && detectorMode === mode) return detector;
  }

  if (detector) {
    detector.close();
    detector = null;
    detectorMode = "";
  }

  const initializing = (async () => {
    setStatus(
      "loading",
      "Loading AI model",
      "Connecting to MediaPipe and downloading the face model..."
    );

    showProgress(15, "Loading computer vision library...");

    const { FaceLandmarker, FilesetResolver } =
      await import(`${VISION_CDN}/vision_bundle.mjs`);

    FaceLandmarkerClass = FaceLandmarker;

    const vision = await FilesetResolver.forVisionTasks(
      `${VISION_CDN}/wasm`
    );

    showProgress(55, "Loading facial landmark model...");

    const instance = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: "CPU"
      },
      runningMode: mode,
      numFaces: 5,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    detector = instance;
    detectorMode = mode;
    return instance;
  })();

  detectorPromise = initializing;

  try {
    return await initializing;
  } finally {
    if (detectorPromise === initializing) detectorPromise = null;
  }
}

/* DETECT FACES IN A PHOTO */

detectBtn.addEventListener("click", async () => {
  if (activeSource !== "upload" || !hasImage || isDetecting) return;

  const token = loadToken;
  isDetecting = true;
  detectBtn.disabled = true;

  setStatus("loading", "Detecting facial landmarks", "Analyzing your photo...");
  showProgress(70, "Analyzing face...");

  try {
    const faceDetector = await getDetector("IMAGE");

    if (
      token !== loadToken ||
      activeSource !== "upload" ||
      !hasImage ||
      !sourceImage.naturalWidth
    ) return;

    const result = faceDetector.detect(sourceImage);
    const total = showDetectionResult(result.faceLandmarks || []);

    if (!detectedFaces.length) {
      setStatus(
        "info",
        "No face detected",
        "Try a clear, front-facing photo with good lighting."
      );
    } else {
      setStatus(
        "success",
        "Detection complete!",
        `Found ${detectedFaces.length} face(s) and ${total} landmarks.`
      );
    }

    showProgress(100, "Detection finished!");
    window.setTimeout(hideProgress, 800);
  } catch (error) {
    console.error("Face detection failed:", error);

    if (token !== loadToken || activeSource !== "upload") return;

    setStatus(
      "error",
      "AI detection failed",
      `${error.message || "Unknown error"}. Check your internet connection and refresh the page.`
    );

    hideProgress();
    if (hasImage && sourceImage.naturalWidth) renderFrame(sourceImage, false);
  } finally {
    isDetecting = false;
    detectBtn.disabled = activeSource !== "upload" || !hasImage;
  }
});

/* CAMERA */

async function startCamera() {
  if (activeSource !== "camera") {
    stopCamera(false);
    activeSource = "camera";
    updateSourceButtons();
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus(
      "error",
      "Camera unavailable",
      "Open this website through HTTPS or localhost using a modern browser."
    );
    return;
  }

  const requestToken = ++cameraRequestToken;
  startCameraBtn.disabled = true;

  try {
    setStatus(
      "loading",
      "Requesting camera access",
      "Allow camera access when your browser asks."
    );

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    if (requestToken !== cameraRequestToken || activeSource !== "camera") {
      stream.getTracks().forEach(track => track.stop());
      return;
    }

    cameraStream = stream;
    cameraVideo.srcObject = stream;
    await cameraVideo.play();

    if (requestToken !== cameraRequestToken || activeSource !== "camera") {
      stopCamera(false);
      return;
    }

    cameraActive = true;
    updateSourceButtons();

    uploadZone.hidden = true;
    fileInfo.hidden = true;
    cameraVideo.hidden = false;
    sourceImage.hidden = true;
    imageStage.hidden = false;
    emptyPreview.hidden = true;

    stopCameraBtn.disabled = false;
    captureBtn.disabled = false;
    captureCleanBtn.disabled = false;
    detectBtn.disabled = true;

    clearDetection();
    renderFrame(cameraVideo, false);

    const faceDetector = await getDetector("VIDEO");

    if (
      requestToken !== cameraRequestToken ||
      !cameraActive ||
      activeSource !== "camera"
    ) return;

    setStatus(
      "success",
      "Camera is running",
      "Keep your face in view. Detection updates automatically."
    );

    hideProgress();
    lastDetectionTime = 0;
    cameraLoop(faceDetector);
  } catch (error) {
    console.error("Camera startup failed:", error);
    if (requestToken !== cameraRequestToken) return;

    stopCamera(false);

    const message = error.name === "NotAllowedError"
      ? "Camera permission was denied. Allow camera access in your browser settings."
      : error.name === "NotFoundError"
      ? "No camera was found on this device."
      : `${error.message || "Unable to start camera."} Try HTTPS or localhost.`;

    setStatus("error", "Could not start camera", message);
  } finally {
    if (requestToken === cameraRequestToken) startCameraBtn.disabled = false;
  }
}

function cameraLoop(faceDetector) {
  if (!cameraActive || activeSource !== "camera") return;

  animationFrameId = requestAnimationFrame(() => cameraLoop(faceDetector));

  const now = performance.now();
  if (now - lastDetectionTime < 100 || cameraVideo.readyState < 2) return;

  lastDetectionTime = now;

  try {
    const result = faceDetector.detectForVideo(cameraVideo, now);
    const total = showDetectionResult(result.faceLandmarks || []);

    if (detectedFaces.length) {
      statusTitle.textContent = "Face detected";
      statusMessage.textContent =
        `Tracking ${detectedFaces.length} face(s), ${total} landmarks.`;
    } else {
      statusTitle.textContent = "Looking for a face";
      statusMessage.textContent =
        "Move your face into view and improve the lighting.";
    }
  } catch (error) {
    console.warn("Skipped camera frame:", error);
  }
}

function stopCamera(showEmpty = true) {
  cameraRequestToken++;
  cameraActive = false;

  if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
  animationFrameId = null;

  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
  }

  cameraStream = null;
  cameraVideo.pause();
  cameraVideo.srcObject = null;

  stopCameraBtn.disabled = true;
  captureBtn.disabled = true;
  captureCleanBtn.disabled = true;
  startCameraBtn.disabled = false;

  if (activeSource === "camera") {
    clearDetection();

    if (showEmpty) {
      imageStage.hidden = true;
      emptyPreview.hidden = false;
    }

    clearCanvas();
  }
}

startCameraBtn.addEventListener("click", startCamera);

stopCameraBtn.addEventListener("click", () => {
  stopCamera(false);
  activeSource = "camera";
  updateSourceButtons();

  imageStage.hidden = true;
  emptyPreview.hidden = false;

  setStatus(
    "info",
    "Camera stopped",
    "Your camera is off. Click Start Camera to use it again, or select Upload Image."
  );
});

/* CAPTURE WITH MESH OR WITHOUT MESH */

function captureCameraFrame(withMesh) {
  if (!cameraActive || !cameraVideo.videoWidth) {
    setStatus(
      "error",
      "Camera not ready",
      "Start the camera before capturing a photo."
    );
    return;
  }

  const shot = document.createElement("canvas");
  shot.width = cameraVideo.videoWidth;
  shot.height = cameraVideo.videoHeight;

  const shotCtx = shot.getContext("2d");

  // Both options start with the original camera image.
  shotCtx.drawImage(cameraVideo, 0, 0, shot.width, shot.height);

  // Add mesh lines only when the user selects Capture with Mesh.
  // This draws directly on the captured image and does not depend
  // on whether the live preview's Mesh ON/OFF button is selected.
  if (withMesh && detectedFaces.length && FaceLandmarkerClass) {
    const connections = FaceLandmarkerClass.FACE_LANDMARKS_TESSELATION;

    if (connections) {
      shotCtx.save();
      shotCtx.lineWidth = Math.max(0.7, shot.width / 1500);

      detectedFaces.forEach((landmarks) => {
        connections.forEach((edge, index) => {
          const start = landmarks[edge.start];
          const end = landmarks[edge.end];
          if (!start || !end) return;

          shotCtx.beginPath();
          shotCtx.moveTo(
            start.x * shot.width,
            start.y * shot.height
          );
          shotCtx.lineTo(
            end.x * shot.width,
            end.y * shot.height
          );
          shotCtx.strokeStyle =
            index % 2 === 0 ? "#48e0ed" : "#bd76ff";
          shotCtx.stroke();
        });

        // Include points too if the points option is enabled.
        if (pointsToggle.checked) {
          const radius = Math.max(1.5, shot.width / 420);
          const colors = ["#ffe45e", "#ff55d9", "#50efa2", "#ffffff"];

          landmarks.forEach((point, index) => {
            shotCtx.beginPath();
            shotCtx.arc(
              point.x * shot.width,
              point.y * shot.height,
              radius,
              0,
              Math.PI * 2
            );
            shotCtx.fillStyle =
              colors[Math.floor(index / 30) % colors.length];
            shotCtx.fill();
          });
        }
      });

      shotCtx.restore();
    }
  }

  shot.toBlob((blob) => {
    if (!blob) {
      setStatus("error", "Capture failed", "Please try capturing the frame again.");
      return;
    }

    const filename = withMesh
      ? `face-mesh-${Date.now()}.jpg`
      : `clean-photo-${Date.now()}.jpg`;

    const file = new File([blob], filename, { type: "image/jpeg" });

    // Load the captured result as a normal photo so it can be
    // viewed, inspected, or analyzed again.
    loadImageFile(file);

    if (withMesh && !detectedFaces.length) {
      setStatus(
        "info",
        "Photo captured without mesh",
        "No face was detected at capture time, so the photo has no mesh lines."
      );
    }
  }, "image/jpeg", 0.94);
}

captureBtn.addEventListener("click", () => captureCameraFrame(true));
captureCleanBtn.addEventListener("click", () => captureCameraFrame(false));

/* SWITCH BETWEEN UPLOAD AND CAMERA */

function updateSourceButtons() {
  const isCamera = activeSource === "camera";

  uploadModeBtn.classList.toggle("active", !isCamera);
  cameraModeBtn.classList.toggle("active", isCamera);

  uploadModeBtn.setAttribute("aria-pressed", String(!isCamera));
  cameraModeBtn.setAttribute("aria-pressed", String(isCamera));

  cameraControls.hidden = !isCamera;
  uploadZone.hidden = isCamera || hasImage;

  detectBtn.disabled = isCamera || !hasImage || isDetecting;

  if (!isCamera && hasImage && sourceImage.naturalWidth) {
    imageStage.hidden = false;
    emptyPreview.hidden = true;
    sourceImage.hidden = true;
    cameraVideo.hidden = true;
  } else {
    imageStage.hidden = true;
    emptyPreview.hidden = false;
  }

  if (isCamera && cameraActive) {
    imageStage.hidden = false;
    emptyPreview.hidden = true;
    cameraVideo.hidden = false;
    sourceImage.hidden = true;
  }
}

uploadModeBtn.addEventListener("click", () => {
  stopCamera(false);
  activeSource = "upload";
  updateSourceButtons();

  if (hasImage && sourceImage.naturalWidth) {
    imageStage.hidden = false;
    emptyPreview.hidden = true;
    renderFrame(sourceImage, detectedFaces.length > 0);

    setStatus(
      "success",
      "Upload Image mode",
      "Your photo is ready. You can detect landmarks or choose another image."
    );
  } else {
    imageStage.hidden = true;
    emptyPreview.hidden = false;
    setStatus("info", "Upload Image mode", "Choose a photo to begin.");
  }
});

cameraModeBtn.addEventListener("click", () => {
  stopCamera(false);
  activeSource = "camera";
  updateSourceButtons();

  imageStage.hidden = true;
  emptyPreview.hidden = false;

  setStatus(
    "info",
    "Camera mode selected",
    "Click Start Camera whenever you are ready."
  );
});

/* MESH CONTROLS */

function setMeshMode(enabled) {
  meshEnabled = enabled;

  meshOnBtn.classList.toggle("active", enabled);
  meshOffBtn.classList.toggle("active", !enabled);

  meshOnBtn.setAttribute("aria-pressed", String(enabled));
  meshOffBtn.setAttribute("aria-pressed", String(!enabled));

  if (activeSource === "camera" && cameraActive) {
    renderFrame(cameraVideo, true);
  } else if (activeSource === "upload" && hasImage) {
    renderFrame(sourceImage, true);
  }
}

meshOnBtn.addEventListener("click", () => setMeshMode(true));
meshOffBtn.addEventListener("click", () => setMeshMode(false));

pointsToggle.addEventListener("change", () => {
  if (activeSource === "camera" && cameraActive) {
    renderFrame(cameraVideo, true);
  } else if (activeSource === "upload" && hasImage) {
    renderFrame(sourceImage, true);
  }
});

/* ZOOM */

function setZoom(value) {
  zoom = Math.max(1, Math.min(4, Number(value) || 1));

  zoomSlider.value = String(zoom);
  zoomValue.textContent = `${Math.round(zoom * 100)}%`;

  imageStage.style.setProperty("--preview-zoom", zoom);
  imageStage.classList.toggle("zoomed", zoom > 1);

  zoomOutBtn.disabled = zoom <= 1;
  zoomInBtn.disabled = zoom >= 4;
}

zoomSlider.addEventListener("input", () => setZoom(zoomSlider.value));
zoomInBtn.addEventListener("click", () => setZoom(zoom + 0.25));
zoomOutBtn.addEventListener("click", () => setZoom(zoom - 0.25));
zoomResetBtn.addEventListener("click", () => setZoom(1));

/* PIXEL RGB INSPECTOR */

canvas.addEventListener("click", (event) => {
  if (!canvas.width || !canvas.height) return;

  const rect = canvas.getBoundingClientRect();

  const x = Math.floor(
    (event.clientX - rect.left) * canvas.width / rect.width
  );
  const y = Math.floor(
    (event.clientY - rect.top) * canvas.height / rect.height
  );

  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;

  try {
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    const hex = [r, g, b]
      .map(value => value.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();

    pixelInfo.textContent =
      `Pixel (${x}, ${y}) · RGB(${r}, ${g}, ${b}) · HEX #${hex}`;
  } catch (error) {
    pixelInfo.textContent = "Unable to inspect this pixel.";
  }
});

/* RESET */

resetBtn.addEventListener("click", () => {
  stopCamera(false);
  loadToken++;

  hasImage = false;
  clearDetection();

  if (currentObjectURL) {
    URL.revokeObjectURL(currentObjectURL);
    currentObjectURL = null;
  }

  sourceImage.onload = null;
  sourceImage.onerror = null;
  sourceImage.removeAttribute("src");
  imageInput.value = "";

  fileInfo.hidden = true;
  uploadZone.hidden = false;
  imageStage.hidden = true;
  emptyPreview.hidden = false;

  detectBtn.disabled = true;
  clearCanvas();

  pixelInfo.textContent =
    "Pixel info: click the image after loading a photo or starting the camera.";

  hideProgress();
  setZoom(1);

  activeSource = "upload";
  updateSourceButtons();

  setStatus("info", "Waiting for image", "Choose a photo to begin.");
});

/* INITIAL STATE */

sourceImage.hidden = true;
cameraVideo.hidden = true;
imageStage.hidden = true;
emptyPreview.hidden = false;

detectBtn.disabled = true;
stopCameraBtn.disabled = true;
captureBtn.disabled = true;
captureCleanBtn.disabled = true;

setZoom(1);
updateSourceButtons();

setStatus("info", "Waiting for image", "Choose a photo to begin.");
