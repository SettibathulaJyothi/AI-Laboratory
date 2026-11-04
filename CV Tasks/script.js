
// ==================================================
// COMPUTER VISION TASK LAB
// Transformers.js 3.8.1
// ==================================================

const $ = id => document.getElementById(id);

let pipelineFunction = null;
let activeTask = null;
let imageUrl = null;
let currentImage = null;
let activeRun = 0;

const modelCache = {};
const modelPromises = {};

// ==================================================
// MODEL ENGINE
// ==================================================

async function loadAIEngine() {
  if (pipelineFunction) return pipelineFunction;

  setActivity(
    "connecting",
    "CONNECTING TO AI",
    "Connecting to the model library..."
  );

  const transformers = await import(
    "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
  );

  transformers.env.allowLocalModels = false;

  pipelineFunction = transformers.pipeline;

  return pipelineFunction;
}

// ==================================================
// TASK INFORMATION
// ==================================================

const taskInfo = {
  classification: {
    number: "TASK 01",
    title: "Single-object classification",
    description: "Predict image classes and compare their scores.",
    lesson:
      "Classification answers WHAT may be in an image. It does not tell us the object's exact location.",
    key: "OUTPUT → LABELS + SCORES"
  },

  localization: {
    number: "TASK 02",
    title: "Classification + localization",
    description: "Predict an object's class and locate it with a bounding box.",
    lesson:
      "Localization adds WHERE to classification. This demo displays the highest-scoring detected object.",
    key: "OUTPUT → MAIN LABEL + BOUNDING BOX"
  },

  detection: {
    number: "TASK 03",
    title: "Multiple-object detection",
    description: "Find multiple objects and draw a separate box around each.",
    lesson:
      "Object detection identifies WHAT and WHERE for each recognized object.",
    key: "OUTPUT → LABELS + BOXES"
  },

  segmentation: {
    number: "TASK 04",
    title: "Instance segmentation",
    description: "Identify individual objects and show their predicted pixel regions.",
    lesson:
      "Instance segmentation identifies the pixels belonging to each individual object. Each object receives its own colored mask.",
    key: "OUTPUT → INDIVIDUAL OBJECT PIXEL MASKS"
  }
};

// ==================================================
// REAL SAMPLE PHOTOGRAPHS
// ==================================================

const sampleImages = [
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=85"
];

// ==================================================
// CLASSIFICATION LABELS
// ==================================================

const GENERAL_LABELS = [
  "person", "human face",
  "dog", "puppy", "golden retriever", "German shepherd",
  "Labrador retriever", "cat", "kitten", "tiger", "lion",
  "elephant", "horse", "cow", "sheep", "goat", "rabbit",
  "monkey", "bear", "fox", "deer", "zebra", "giraffe",
  "squirrel", "mouse", "rat", "bird", "eagle", "parrot",
  "owl", "peacock", "pigeon", "crow", "duck", "chicken",
  "penguin", "fish", "shark", "turtle", "snake", "frog",
  "butterfly", "bee", "spider",

  "book", "notebook", "textbook", "paper", "pen", "pencil",
  "marker", "eraser", "ruler", "calculator", "scissors",
  "glue bottle", "school bag", "backpack", "pencil case",
  "stapler", "paper clip", "whiteboard", "chalkboard",
  "water bottle", "plastic bottle", "glass bottle", "cup",
  "coffee mug", "glass", "plate", "bowl", "spoon", "fork",
  "knife", "chair", "sofa", "table", "desk", "bed", "lamp",
  "fan", "clock", "wall clock", "refrigerator",
  "microwave oven", "television", "remote control",
  "umbrella", "key", "wallet", "handbag", "suitcase",
  "towel", "toothbrush", "comb", "soap bottle", "tissue box",
  "basket", "toy", "teddy bear",

  "laptop computer", "desktop computer", "computer monitor",
  "keyboard", "computer mouse", "mobile phone", "smartphone",
  "tablet", "camera", "headphones", "earphones", "speaker",
  "charger", "power bank", "television remote",

  "car", "sports car", "bus", "truck", "motorcycle",
  "bicycle", "train", "airplane", "helicopter", "boat",
  "ship", "tractor", "traffic light", "stop sign", "scooter",

  "apple", "banana", "orange", "mango", "grapes",
  "watermelon", "strawberry", "pineapple", "lemon", "tomato",
  "potato", "carrot", "broccoli", "bread", "cake", "pizza",
  "hamburger", "sandwich", "rice", "egg", "ice cream",
  "coffee", "tea", "milk carton", "food container",

  "shirt", "dress", "jacket", "trousers", "hat", "shoe",
  "sneaker", "sandal", "watch", "sunglasses", "belt",

  "flower", "rose", "sunflower", "tree", "grass", "forest",
  "mountain", "river", "waterfall", "beach", "building",
  "house", "bridge", "road", "garden", "cloud", "sunset",

  "football", "basketball", "tennis racket", "guitar",
  "piano", "ball", "musical instrument", "plant pot",
  "broom", "bucket", "paint brush", "toolbox"
];

// ==================================================
// COLORS
// ==================================================

const colors = [
  [113, 83, 245],
  [27, 157, 120],
  [242, 146, 49],
  [225, 69, 112],
  [44, 134, 227],
  [167, 91, 204],
  [20, 158, 176],
  [223, 177, 46]
];

// ==================================================
// STATUS AND ACTIVITY INDICATOR
// ==================================================

function setStatus(message, error = false) {
  $("status").textContent = message;
  $("status").classList.toggle("error", error);
}

function setActivity(state, title, message) {
  const indicator = $("activityIndicator");

  indicator.hidden = state === "idle";
  indicator.dataset.state = state;

  $("activityTitle").textContent = title || "";
  $("activityText").textContent = message || "";
}

function showEmptyResult(message = "Your model output will appear here.") {
  $("resultCanvasWrap").replaceChildren();

  const empty = document.createElement("div");
  empty.className = "empty-state";

  const icon = document.createElement("span");
  icon.textContent = "✨";

  const paragraph = document.createElement("p");
  paragraph.textContent = message;

  empty.append(icon, paragraph);
  $("resultCanvasWrap").appendChild(empty);
}

// ==================================================
// INTERFACE
// ==================================================

function showHome() {
  activeRun++;
  activeTask = null;

  $("home").hidden = false;
  $("workspace").hidden = true;

  setActivity("idle", "", "");
  $("runBtn").disabled = !currentImage || !imageUrl;
}

function openTask(task) {
  if (!taskInfo[task]) return;

  activeRun++;
  activeTask = task;

  $("home").hidden = true;
  $("workspace").hidden = false;

  document.querySelectorAll(".task-tab").forEach(button => {
    const selected = button.dataset.task === task;

    button.classList.toggle("active", selected);

    if (selected) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  const info = taskInfo[task];

  $("taskEyebrow").textContent = info.number;
  $("taskTitle").textContent = info.title;
  $("taskDescription").textContent = info.description;

  $("learningContent").replaceChildren();

  const heading = document.createElement("h3");
  heading.textContent = "What should you notice?";

  const paragraph = document.createElement("p");
  paragraph.textContent = info.lesson;

  const key = document.createElement("span");
  key.className = "learning-key";
  key.textContent = info.key;

  $("learningContent").append(heading, paragraph, key);

  $("resultBadge").textContent = "WAITING";
  $("results").replaceChildren();

  showEmptyResult();
  setActivity("idle", "", "");

  if (currentImage && imageUrl) {
    showImagePreview(currentImage);
  }

  $("runBtn").disabled = !currentImage || !imageUrl;

  setStatus("Choose an image, then run the selected task.");
}

function showImagePreview(img) {
  currentImage = img;

  $("preview").replaceChildren();

  const preview = document.createElement("img");
  preview.src = img.src;
  preview.alt = "Selected photograph";

  $("preview").appendChild(preview);

  $("runBtn").disabled = !activeTask || !imageUrl;
}

// ==================================================
// LOAD SAMPLE PHOTOGRAPHS
// ==================================================

function loadRemoteImage(url) {
  activeRun++;

  $("runBtn").disabled = true;

  setActivity(
    "connecting",
    "LOADING PHOTOGRAPH",
    "Connecting to the sample image..."
  );

  setStatus("Loading sample photograph...");

  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = () => {
    const previousUrl = imageUrl;

    imageUrl = url;
    showImagePreview(img);

    if (previousUrl && previousUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previousUrl);
    }

    setActivity(
      "complete",
      "IMAGE READY",
      "Your sample photograph is ready for analysis."
    );

    setStatus("Image ready. Run the selected computer-vision task.");
  };

  img.onerror = () => {
    setActivity(
      "error",
      "IMAGE COULD NOT LOAD",
      "Check your internet connection or upload a photograph."
    );

    setStatus(
      "This sample could not load. Check your connection or upload a photo.",
      true
    );
  };

  img.src = url;
}

// ==================================================
// UPLOAD PHOTOGRAPHS
// ==================================================

function loadUploadedImage(file) {
  if (!file) return;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    setStatus("Please upload a JPG, PNG, or WEBP image.", true);
    return;
  }

  if (file.size > 15 * 1024 * 1024) {
    setStatus("Please upload an image smaller than 15 MB.", true);
    return;
  }

  activeRun++;

  $("runBtn").disabled = true;

  setActivity(
    "loading",
    "OPENING IMAGE",
    "Preparing your uploaded photograph..."
  );

  setStatus("Opening your uploaded image...");

  const newUrl = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    const oldUrl = imageUrl;

    imageUrl = newUrl;
    showImagePreview(img);

    if (oldUrl && oldUrl.startsWith("blob:")) {
      URL.revokeObjectURL(oldUrl);
    }

    setActivity(
      "complete",
      "IMAGE READY",
      "Your uploaded photograph is ready for analysis."
    );

    setStatus("Your image is ready. Select Run computer vision.");
  };

  img.onerror = () => {
    URL.revokeObjectURL(newUrl);

    setActivity(
      "error",
      "IMAGE ERROR",
      "The browser could not open this photograph."
    );

    $("runBtn").disabled = !activeTask || !imageUrl;

    setStatus(
      "Unable to open this image. Please try another file.",
      true
    );
  };

  img.src = newUrl;
}

// ==================================================
// EVENT LISTENERS
// ==================================================

$("imageUpload").addEventListener("change", event => {
  loadUploadedImage(event.target.files[0]);
  event.target.value = "";
});

document.querySelectorAll(".sample").forEach(button => {
  button.addEventListener("click", () => {
    if (!activeTask) {
      openTask("classification");
    }

    loadRemoteImage(button.dataset.image);
  });
});

document.querySelectorAll(".task-card").forEach(button => {
  button.addEventListener("click", () => {
    openTask(button.dataset.task);
  });
});

document.querySelectorAll(".task-tab").forEach(button => {
  button.addEventListener("click", () => {
    openTask(button.dataset.task);
  });
});

$("backBtn").addEventListener("click", showHome);

// ==================================================
// LOAD THE CORRECT AI MODEL
// ==================================================

async function getModel(task) {
  if (modelCache[task]) {
    return modelCache[task];
  }

  if (modelPromises[task]) {
    return modelPromises[task];
  }

  let pipelineTask;
  let modelName;

  if (task === "classification") {
    pipelineTask = "zero-shot-image-classification";
    modelName = "Xenova/clip-vit-base-patch32";
  } else if (
    task === "localization" ||
    task === "detection"
  ) {
    pipelineTask = "object-detection";
    modelName = "Xenova/detr-resnet-50";
  } else if (task === "segmentation") {
    pipelineTask = "image-segmentation";
    modelName = "Xenova/detr-resnet-50-panoptic";
  } else {
    throw new Error("Unknown computer-vision task.");
  }

  modelPromises[task] = (async () => {
    try {
      setActivity(
        "connecting",
        "CONNECTING TO AI",
        "Preparing the AI model..."
      );

      setStatus("Connecting to the AI model service...");

      const pipeline = await loadAIEngine();

      setActivity(
        "loading",
        "DOWNLOADING AI MODEL",
        "The first download may take a few minutes. Please keep this page open."
      );

      setStatus(
        `Loading the ${task} model. The first download may take a while...`
      );

      const progressCallback = progress => {
        if (!progress || typeof progress !== "object") return;

        if (
          progress.status === "progress" &&
          Number.isFinite(progress.progress)
        ) {
          const percent = Math.round(progress.progress);

          setActivity(
            "loading",
            "DOWNLOADING AI MODEL",
            `${progress.file || "Model file"} - ${percent}%`
          );
        } else if (progress.status === "done") {
          setActivity(
            "loading",
            "PREPARING AI MODEL",
            "Download complete. Preparing the model..."
          );
        }
      };

      const model = await pipeline(
        pipelineTask,
        modelName,
        {
          progress_callback: progressCallback
        }
      );

      modelCache[task] = model;

      return model;

    } catch (error) {
      setActivity(
        "error",
        "MODEL LOADING FAILED",
        error?.message || "Unable to load the AI model."
      );

      throw error;

    } finally {
      delete modelPromises[task];
    }
  })();

  return modelPromises[task];
}

// ==================================================
// CANVAS HELPERS
// ==================================================

function createCanvasFromImage(img) {
  const canvas = document.createElement("canvas");

  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true
  });

  if (!ctx) {
    throw new Error("Your browser could not create a drawing canvas.");
  }

  ctx.drawImage(img, 0, 0);

  return { canvas, ctx };
}

function displayCanvas(canvas) {
  $("resultCanvasWrap").replaceChildren();

  canvas.style.width = "100%";
  canvas.style.height = "auto";
  canvas.style.display = "block";

  $("resultCanvasWrap").appendChild(canvas);
}

// ==================================================
// CONFIDENCE SCORE DISPLAY
// ==================================================

function addResultItem(label, score, index = 0) {
  const item = document.createElement("div");
  item.className = "result-item";

  const line = document.createElement("div");
  line.className = "result-line";

  const name = document.createElement("strong");
  name.textContent = label;

  const percent = document.createElement("span");
  percent.className = "score";

  percent.textContent = Number.isFinite(score)
    ? `${(score * 100).toFixed(1)}%`
    : "Score unavailable";

  line.append(name, percent);

  const track = document.createElement("div");
  track.className = "score-track";

  const fill = document.createElement("div");
  fill.className = "score-fill";

  const safeScore = Number.isFinite(score)
    ? Math.max(0, Math.min(1, score))
    : 0;

  fill.style.width = `${safeScore * 100}%`;

  const color = colors[index % colors.length];

  fill.style.background =
    `linear-gradient(90deg, rgb(${color.join(",")}), #8c82ff)`;

  track.appendChild(fill);
  item.append(line, track);

  $("results").appendChild(item);
}

// ==================================================
// DRAW OBJECT DETECTION BOXES
// ==================================================

function drawBoxes(ctx, predictions, width, height, onlyBest = false) {
  const valid = predictions.filter(item =>
    item &&
    item.box &&
    Number.isFinite(item.box.xmin) &&
    Number.isFinite(item.box.ymin) &&
    Number.isFinite(item.box.xmax) &&
    Number.isFinite(item.box.ymax)
  );

  const sorted = valid.slice().sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  const list = onlyBest ? sorted.slice(0, 1) : sorted;

  ctx.lineWidth = Math.max(3, Math.round(width / 250));

  ctx.font =
    `bold ${Math.max(15, Math.round(width / 55))}px sans-serif`;

  const drawn = [];

  list.forEach((prediction, index) => {
    const { xmin, ymin, xmax, ymax } = prediction.box;

    const x = Math.max(0, Math.min(width, xmin));
    const y = Math.max(0, Math.min(height, ymin));

    const right = Math.max(x, Math.min(width, xmax));
    const bottom = Math.max(y, Math.min(height, ymax));

    if (right <= x || bottom <= y) return;

    const color = colors[index % colors.length];
    const stroke = `rgb(${color.join(",")})`;

    ctx.strokeStyle = stroke;
    ctx.strokeRect(x, y, right - x, bottom - y);

    const scoreText = Number.isFinite(prediction.score)
      ? ` ${(prediction.score * 100).toFixed(0)}%`
      : "";

    const label = `${prediction.label}${scoreText}`;
    const labelWidth = ctx.measureText(label).width + 12;
    const labelHeight = 26;
    const labelY = Math.max(0, y - labelHeight);

    ctx.fillStyle = stroke;
    ctx.fillRect(x, labelY, labelWidth, labelHeight);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x + 6, labelY + 18);

    drawn.push(prediction);
  });

  return drawn;
}

// ==================================================
// TASK 01: IMAGE CLASSIFICATION
// ==================================================

async function runClassification(runId) {
  const model = await getModel("classification");

  if (runId !== activeRun) return;

  setActivity(
    "processing",
    "AI PROCESSING",
    "Comparing your photograph with the available object labels..."
  );

  setStatus("Comparing the photograph with everyday-object labels...");

  const predictions = await model(imageUrl, GENERAL_LABELS);

  if (runId !== activeRun) return;

  if (!Array.isArray(predictions) || predictions.length === 0) {
    throw new Error("The classification model returned no predictions.");
  }

  const ranked = predictions
    .filter(item =>
      item &&
      typeof item.label === "string" &&
      Number.isFinite(item.score)
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (ranked.length === 0) {
    throw new Error("No usable classification scores were returned.");
  }

  $("results").replaceChildren();

  ranked.forEach((item, index) => {
    addResultItem(item.label, item.score, index);
  });

  $("resultCanvasWrap").replaceChildren();

  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = "Photograph used for classification";

  $("resultCanvasWrap").appendChild(img);

  $("resultBadge").textContent = "COMPLETE";

  setActivity(
    "complete",
    "CLASSIFICATION COMPLETE",
    "The AI has finished comparing the image labels."
  );

  setStatus(
    `Best match: "${ranked[0].label}". Scores are model estimates, not guarantees.`
  );
}

// ==================================================
// TASKS 02 AND 03: OBJECT DETECTION
// ==================================================

async function runDetection(runId, single = false) {
  const model = await getModel(
    single ? "localization" : "detection"
  );

  if (runId !== activeRun) return;

  setActivity(
    "processing",
    "AI PROCESSING",
    single
      ? "Finding the main object and its location..."
      : "Finding multiple objects and calculating their locations..."
  );

  setStatus(
    single
      ? "Finding the main object and its location..."
      : "Finding multiple objects and calculating bounding boxes..."
  );

  const predictions = await model(imageUrl, {
    threshold: 0.35
  });

  if (runId !== activeRun) return;

  if (!Array.isArray(predictions)) {
    throw new Error("The object detector returned an unexpected result.");
  }

  const { canvas, ctx } = createCanvasFromImage(currentImage);

  const filtered = predictions.filter(item =>
    item &&
    item.box &&
    typeof item.label === "string" &&
    Number.isFinite(item.score) &&
    item.score >= 0.35
  );

  const drawn = drawBoxes(
    ctx,
    filtered,
    canvas.width,
    canvas.height,
    single
  );

  displayCanvas(canvas);
  $("results").replaceChildren();

  if (drawn.length === 0) {
    $("resultBadge").textContent = "NO DETECTIONS";

    setActivity(
      "complete",
      "ANALYSIS COMPLETE",
      "The model finished, but no objects passed the confidence threshold."
    );

    setStatus(
      "No objects passed the confidence threshold. Try a clearer photo or another image.",
      true
    );

    return;
  }

  drawn.forEach((item, index) => {
    addResultItem(item.label, item.score, index);
  });

  $("resultBadge").textContent = "COMPLETE";

  setActivity(
    "complete",
    single ? "LOCALIZATION COMPLETE" : "DETECTION COMPLETE",
    `${drawn.length} object(s) identified.`
  );

  if (single) {
    setStatus(
      `Localization complete. Main prediction: "${drawn[0].label}".`
    );
  } else {
    setStatus(
      `Detection complete. ${drawn.length} object(s) shown with individual boxes.`
    );
  }
}

// ==================================================
// TASK 04: INSTANCE SEGMENTATION
// ==================================================


// --------------------------------------------------
// TASK 04: INSTANCE / PANOPTIC SEGMENTATION
// --------------------------------------------------

async function runSegmentation(runId) {
  setStatus("Loading the segmentation model...");

  const model = await getModel("segmentation");

  if (runId !== activeRun) return;

  setStatus("AI is analysing the photograph and generating pixel masks...");

  // Ask the model to produce panoptic segmentation masks.
  const segments = await model(imageUrl, {
    subtask: "panoptic",
    threshold: 0.5,
    mask_threshold: 0.5,
    overlap_mask_area_threshold: 0.5
  });

  if (runId !== activeRun) return;

  if (!Array.isArray(segments)) {
    throw new Error("The segmentation model returned an invalid result.");
  }

  const { canvas, ctx } = createCanvasFromImage(currentImage);

  const imageWidth = canvas.width;
  const imageHeight = canvas.height;

  $("results").replaceChildren();

  let count = 0;

  for (const segment of segments) {
    if (runId !== activeRun) return;

    const mask = segment?.mask;

    if (!mask || !mask.data || !mask.width || !mask.height) {
      console.warn("Skipping invalid segmentation mask:", segment);
      continue;
    }

    const maskWidth = mask.width;
    const maskHeight = mask.height;
    const channels = mask.channels || 1;
    const maskData = mask.data;

    if (maskData.length < maskWidth * maskHeight * channels) {
      console.warn("Incomplete mask data:", segment);
      continue;
    }

    // Create an overlay canvas for this individual object.
    const overlay = document.createElement("canvas");
    overlay.width = maskWidth;
    overlay.height = maskHeight;

    const overlayCtx = overlay.getContext("2d");

    if (!overlayCtx) {
      throw new Error("Could not create the segmentation overlay.");
    }

    const overlayImage = overlayCtx.createImageData(
      maskWidth,
      maskHeight
    );

    const foreground = new Uint8Array(maskWidth * maskHeight);

    // The model already returns a binary mask.
    for (let i = 0; i < foreground.length; i++) {
      const value = Number(maskData[i * channels]);
      foreground[i] = value > 0 ? 1 : 0;
    }

    const color = colors[count % colors.length];
    let visiblePixels = 0;

    // Paint the object region and its boundary.
    for (let y = 0; y < maskHeight; y++) {
      for (let x = 0; x < maskWidth; x++) {
        const i = y * maskWidth + x;

        if (!foreground[i]) continue;

        visiblePixels++;

        const edge =
          x === 0 ||
          y === 0 ||
          x === maskWidth - 1 ||
          y === maskHeight - 1 ||
          foreground[i - 1] === 0 ||
          foreground[i + 1] === 0 ||
          foreground[i - maskWidth] === 0 ||
          foreground[i + maskWidth] === 0;

        const p = i * 4;

        overlayImage.data[p] = color[0];
        overlayImage.data[p + 1] = color[1];
        overlayImage.data[p + 2] = color[2];

        // Transparent inside, stronger color at the boundary.
        overlayImage.data[p + 3] = edge ? 230 : 95;
      }
    }

    // Ignore masks with no foreground pixels.
    if (visiblePixels === 0) {
      console.warn("Empty mask:", segment.label);
      continue;
    }

    overlayCtx.putImageData(overlayImage, 0, 0);

    // Resize the mask to match the original photograph.
    ctx.drawImage(
      overlay,
      0,
      0,
      imageWidth,
      imageHeight
    );

    const label = segment.label || `Object ${count + 1}`;

    addResultItem(
      label,
      Number.isFinite(segment.score) ? segment.score : NaN,
      count
    );

    count++;
  }

  if (runId !== activeRun) return;

  displayCanvas(canvas);

  if (count === 0) {
    $("resultBadge").textContent = "NO MASKS";

    setStatus(
      "The model completed, but no visible object masks were returned. Try the official sample photograph.",
      true
    );

    return;
  }

  $("resultBadge").textContent = "COMPLETE";

  setStatus(
    `Segmentation complete! ${count} object region(s) identified. Colored areas show the predicted pixels, and brighter edges show their boundaries.`
  );
}


// ==================================================
// RUN SELECTED COMPUTER-VISION TASK
// ==================================================

$("runBtn").addEventListener("click", async () => {
  if (!activeTask || !currentImage || !imageUrl) {
    setStatus("Choose a task and image first.", true);
    return;
  }

  const runId = ++activeRun;

  $("runBtn").disabled = true;
  $("resultBadge").textContent = "RUNNING";
  $("results").replaceChildren();

  showEmptyResult("AI is preparing your result...");

  try {
    if (activeTask === "classification") {
      await runClassification(runId);

    } else if (activeTask === "localization") {
      await runDetection(runId, true);

    } else if (activeTask === "detection") {
      await runDetection(runId, false);

    } else if (activeTask === "segmentation") {
      await runSegmentation(runId);
    }

  } catch (error) {
    console.error("Computer vision error:", error);
console.error("Error stack:", error?.stack);

    if (runId === activeRun) {
      setActivity(
        "error",
        "ANALYSIS FAILED",
        error?.message || "Something went wrong."
      );

      setStatus(
        "The model could not finish. Check your internet connection and browser console. " +
        (error?.message || "Unknown error"),
        true
      );

      $("resultBadge").textContent = "ERROR";
    }

  } finally {
    if (runId === activeRun) {
      $("runBtn").disabled =
        !currentImage || !imageUrl || !activeTask;
    }
  }
});
