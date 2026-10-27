
let pipelineFunction = null;

async function loadAIEngine() {
  if (pipelineFunction) return pipelineFunction;

  const transformers = await import(
    "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
  );

  transformers.env.allowLocalModels = false;
  pipelineFunction = transformers.pipeline;

  return pipelineFunction;
}
// --------------------------------------------------
// COMPUTER VISION LEARNING LAB
// --------------------------------------------------

const $ = id => document.getElementById(id);

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
    description: "Identify objects and trace their predicted pixel boundaries.",
    lesson:
      "Segmentation predicts the pixels belonging to image regions. Colored outlines show the boundaries of the predicted masks.",
    key: "OUTPUT → OBJECT MASKS + OUTLINES"
  }
};

// Real sample photographs
const sampleImages = [
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=85"
];

// Candidate labels for zero-shot classification
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

let activeTask = null;
let imageUrl = null;
let currentImage = null;
let activeRun = 0;

const modelCache = {};

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

// --------------------------------------------------
// STATUS AND INTERFACE
// --------------------------------------------------

function setStatus(message, error = false) {
  $("status").textContent = message;
  $("status").classList.toggle("error", error);
}

function showEmptyResult(
  message = "Your model output will appear here."
) {
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

function showHome() {
  activeRun++;
  activeTask = null;

  $("home").hidden = false;
  $("workspace").hidden = true;

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

// --------------------------------------------------
// LOAD SAMPLE PHOTOGRAPHS
// --------------------------------------------------

function loadRemoteImage(url) {
  activeRun++;

  const previousUrl = imageUrl;
  const previousImage = currentImage;

  $("runBtn").disabled = true;
  setStatus("Loading photograph...");

  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = () => {
    if (previousUrl && previousUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previousUrl);
    }

    imageUrl = url;

    showImagePreview(img);

    setStatus("Image ready. Run the selected computer-vision task.");
  };

  img.onerror = () => {
    imageUrl = previousUrl;
    currentImage = previousImage;

    $("runBtn").disabled = !activeTask || !imageUrl;

    setStatus(
      "This sample could not load. Check your connection or upload a photo.",
      true
    );
  };

  img.src = url;
}

// --------------------------------------------------
// UPLOAD PHOTOGRAPHS
// --------------------------------------------------

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

    setStatus("Your image is ready. Select Run computer vision.");
  };

  img.onerror = () => {
    URL.revokeObjectURL(newUrl);

    $("runBtn").disabled = !activeTask || !imageUrl;

    setStatus(
      "Unable to open this image. Please try another file.",
      true
    );
  };

  img.src = newUrl;
}

// --------------------------------------------------
// EVENT LISTENERS
// --------------------------------------------------

$("imageUpload").addEventListener("change", event => {
  loadUploadedImage(event.target.files[0]);
});

document.querySelectorAll(".sample").forEach(button => {
  button.addEventListener("click", () => {
    if (!activeTask) openTask("classification");

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

// --------------------------------------------------
// LOAD THE CORRECT MODEL FOR EACH TASK
// --------------------------------------------------

async function getModel(task) {
  if (modelCache[task]) {
    return modelCache[task];
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
  } else {
    pipelineTask = "image-segmentation";
    modelName = "Xenova/detr-resnet-50-panoptic";
  }

  setStatus(
    `Loading the ${task} model. The first download may take a while...`
  );

  const pipeline = await loadAIEngine();
  const model = await pipeline(pipelineTask, modelName);

  modelCache[task] = model;

  return model;
}

// --------------------------------------------------
// IMAGE CANVAS HELPERS
// --------------------------------------------------

function createCanvasFromImage(img) {
  const canvas = document.createElement("canvas");

  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext("2d");

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

// --------------------------------------------------
// DISPLAY CONFIDENCE SCORES
// --------------------------------------------------

function addResultItem(label, score, index) {
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

// --------------------------------------------------
// DRAW DETECTION BOUNDING BOXES
// --------------------------------------------------

function drawBoxes(
  ctx,
  predictions,
  width,
  height,
  onlyBest = false
) {
  const valid = predictions.filter(item =>
    item &&
    item.box &&
    Number.isFinite(item.box.xmin) &&
    Number.isFinite(item.box.ymin) &&
    Number.isFinite(item.box.xmax) &&
    Number.isFinite(item.box.ymax)
  );

  const list = onlyBest
    ? valid.slice().sort((a, b) => b.score - a.score).slice(0, 1)
    : valid;

  ctx.lineWidth = Math.max(3, Math.round(width / 250));

  ctx.font =
    `bold ${Math.max(15, Math.round(width / 55))}px sans-serif`;

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
    const labelY = Math.max(0, y - 28);

    ctx.fillStyle = stroke;
    ctx.fillRect(x, labelY, labelWidth, 26);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x + 6, labelY + 18);
  });

  return list;
}

// --------------------------------------------------
// TASK 01: IMAGE CLASSIFICATION
// --------------------------------------------------

async function runClassification(runId) {
  const model = await getModel("classification");

  if (runId !== activeRun) return;

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
  img.style.width = "100%";
  img.style.height = "auto";

  $("resultCanvasWrap").appendChild(img);

  setStatus(
    `Best match: "${ranked[0].label}". Scores are model estimates, not guarantees.`
  );

  $("resultBadge").textContent = "COMPLETE";
}

// --------------------------------------------------
// TASKS 02 AND 03: OBJECT DETECTION
// --------------------------------------------------

async function runDetection(runId, single = false) {
  const model = await getModel(
    single ? "localization" : "detection"
  );

  if (runId !== activeRun) return;

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

  if (filtered.length === 0) {
    displayCanvas(canvas);

    $("results").replaceChildren();
    $("resultBadge").textContent = "NO DETECTIONS";

    setStatus(
      "No objects passed the confidence threshold. Try a clearer photo.",
      true
    );

    return;
  }

  const drawn = drawBoxes(
    ctx,
    filtered,
    canvas.width,
    canvas.height,
    single
  );

  displayCanvas(canvas);

  $("results").replaceChildren();

  drawn.forEach((item, index) => {
    addResultItem(item.label, item.score, index);
  });

  if (single) {
    setStatus(
      `Localization complete. Main prediction: "${drawn[0]?.label || "object"}".`
    );
  } else {
    setStatus(
      `Detection complete. ${drawn.length} object(s) shown with individual boxes.`
    );
  }

  $("resultBadge").textContent = "COMPLETE";
}

// --------------------------------------------------
// TASK 04: OUTLINE-BASED SEGMENTATION
// --------------------------------------------------


async function runSegmentation(runId) {
  const model = await getModel("segmentation");

  if (runId !== activeRun) return;

  setStatus("Predicting individual object masks...");

  const segments = await model(imageUrl);

  if (runId !== activeRun) return;

  if (!Array.isArray(segments) || segments.length === 0) {
    throw new Error("No segmentation masks were returned.");
  }

  const { canvas, ctx } = createCanvasFromImage(currentImage);
  const width = canvas.width;
  const height = canvas.height;

  $("results").replaceChildren();

  let count = 0;

  for (const segment of segments) {
    if (runId !== activeRun) return;

    if (!segment?.mask || !segment.label) continue;

    if (
      Number.isFinite(segment.score) &&
      segment.score < 0.5
    ) continue;

    const mask = segment.mask;
    const mw = mask.width;
    const mh = mask.height;
    const data = mask.data;

    if (!data || !mw || !mh) continue;

    const channels = mask.channels || 1;

    if (data.length < mw * mh * channels) continue;

    // Build a mask-sized canvas using the model's actual mask values.
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = mw;
    maskCanvas.height = mh;

    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) continue;

    const maskImage = maskCtx.createImageData(mw, mh);

    let minValue = Infinity;
    let maxValue = -Infinity;

    for (let i = 0; i < mw * mh; i++) {
      const value = Number(data[i * channels]);

      if (Number.isFinite(value)) {
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      }
    }

    if (!Number.isFinite(minValue) || maxValue <= minValue) {
      continue;
    }

    // Convert the mask to a binary foreground.
    const cutoff = minValue >= 0 && maxValue <= 1
      ? 0.5
      : minValue + (maxValue - minValue) * 0.5;

    const foreground = new Uint8Array(mw * mh);

    for (let i = 0; i < foreground.length; i++) {
      const value = Number(data[i * channels]);
      foreground[i] = value > cutoff ? 1 : 0;
    }

    // Create a transparent, colored outline only.
    const color = colors[count % colors.length];
    let hasOutline = false;

    for (let y = 0; y < mh; y++) {
      for (let x = 0; x < mw; x++) {
        const i = y * mw + x;
        if (!foreground[i]) continue;

        const edge =
          x === 0 || y === 0 ||
          x === mw - 1 || y === mh - 1 ||
          !foreground[i - 1] ||
          !foreground[i + 1] ||
          !foreground[i - mw] ||
          !foreground[i + mw];

        if (!edge) continue;

        const p = i * 4;
        maskImage.data[p] = color[0];
        maskImage.data[p + 1] = color[1];
        maskImage.data[p + 2] = color[2];
        maskImage.data[p + 3] = 255;
        hasOutline = true;
      }
    }

    if (!hasOutline) continue;

    maskCtx.putImageData(maskImage, 0, 0);

    // Scale the outline onto the original photograph.
    ctx.drawImage(maskCanvas, 0, 0, width, height);

    addResultItem(
      segment.label,
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
      "No usable masks were found. Try another photo or inspect the model output.",
      true
    );
    return;
  }

  $("resultBadge").textContent = "COMPLETE";

  setStatus(
    `${count} predicted object region(s) outlined. The original photograph remains visible.`
  );
}


// --------------------------------------------------
// RUN THE SELECTED COMPUTER-VISION TASK
// --------------------------------------------------

$("runBtn").addEventListener("click", async () => {
  if (!activeTask || !currentImage || !imageUrl) {
    setStatus("Choose a task and image first.", true);
    return;
  }

  const runId = ++activeRun;

  $("runBtn").disabled = true;
  $("resultBadge").textContent = "RUNNING";
  $("results").replaceChildren();

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

    if (runId === activeRun) {
      setStatus(
        "The model could not finish. Check your connection and try again. " +
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
