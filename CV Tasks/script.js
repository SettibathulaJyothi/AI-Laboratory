
import { pipeline, env } from
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

env.allowLocalModels = false;

const $ = id => document.getElementById(id);

// --------------------------------------------------
// TASK INFORMATION
// --------------------------------------------------

const taskInfo = {
  classification: {
    number: "TASK 01",
    title: "Single-object classification",
    description: "Predict image classes and compare their scores.",
    lesson: "Classification answers WHAT may be in an image. It does not tell us the object's exact location.",
    key: "OUTPUT → LABELS + SCORES"
  },
  localization: {
    number: "TASK 02",
    title: "Classification + localization",
    description: "Predict an object's class and locate it with a bounding box.",
    lesson: "Localization adds WHERE to classification. This demo displays the highest-scoring detected object.",
    key: "OUTPUT → MAIN LABEL + BOUNDING BOX"
  },
  detection: {
    number: "TASK 03",
    title: "Multiple-object detection",
    description: "Find multiple objects and draw a separate box around each.",
    lesson: "Object detection identifies WHAT and WHERE for each recognized object. Boxes approximate object locations.",
    key: "OUTPUT → LABELS + BOXES"
  },
  segmentation: {
    number: "TASK 04",
    title: "Instance segmentation",
    description: "Generate pixel masks for image regions.",
    lesson: "Segmentation identifies predicted pixel regions. This model performs panoptic segmentation, which may include objects and background regions.",
    key: "OUTPUT → LABELS + PIXEL MASKS"
  }
};

// --------------------------------------------------
// REAL SAMPLE PHOTOGRAPHS
// The sample buttons in your HTML use data-image URLs.
// --------------------------------------------------

const sampleImages = [
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=85"
];

// --------------------------------------------------
// DAILY-OBJECT CLASSIFICATION LABELS
// CLIP compares the image with these candidate labels.
// Add more labels whenever you need them.
// --------------------------------------------------

const GENERAL_LABELS = [
  // People and animals
  "person", "human face", "dog", "puppy", "golden retriever",
  "German shepherd", "Labrador retriever", "cat", "kitten",
  "tiger", "lion", "elephant", "horse", "cow", "sheep",
  "goat", "rabbit", "monkey", "bear", "fox", "deer",
  "zebra", "giraffe", "squirrel", "mouse", "rat", "bird",
  "eagle", "parrot", "owl", "peacock", "pigeon", "crow",
  "duck", "chicken", "penguin", "fish", "shark", "turtle",
  "snake", "frog", "butterfly", "bee", "spider",

  // Everyday school and office objects
  "book", "notebook", "textbook", "paper", "pen", "pencil",
  "marker", "eraser", "ruler", "calculator", "scissors",
  "glue bottle", "school bag", "backpack", "pencil case",
  "stapler", "paper clip", "whiteboard", "chalkboard",

  // Household objects
  "water bottle", "plastic bottle", "glass bottle",
  "cup", "coffee mug", "glass", "plate", "bowl",
  "spoon", "fork", "knife", "chair", "sofa", "table",
  "desk", "bed", "lamp", "fan", "clock", "wall clock",
  "refrigerator", "microwave oven", "television",
  "remote control", "umbrella", "key", "wallet",
  "handbag", "suitcase", "towel", "toothbrush", "comb",
  "soap bottle", "tissue box", "basket", "toy", "teddy bear",

  // Computers and electronics
  "laptop computer", "desktop computer", "computer monitor",
  "keyboard", "computer mouse", "mobile phone", "smartphone",
  "tablet", "camera", "headphones", "earphones", "speaker",
  "charger", "power bank", "television remote",

  // Vehicles
  "car", "sports car", "bus", "truck", "motorcycle",
  "bicycle", "train", "airplane", "helicopter", "boat",
  "ship", "tractor", "traffic light", "stop sign",

  // Food and fruit
  "apple", "banana", "orange", "mango", "grapes",
  "watermelon", "strawberry", "pineapple", "lemon",
  "tomato", "potato", "carrot", "broccoli", "bread",
  "cake", "pizza", "hamburger", "sandwich", "rice",
  "egg", "ice cream", "coffee", "tea", "milk carton",
  "food container",

  // Clothing and accessories
  "shirt", "dress", "jacket", "trousers", "hat", "shoe",
  "sneaker", "sandal", "watch", "sunglasses", "belt",

  // Furniture, nature and places
  "flower", "rose", "sunflower", "tree", "grass", "forest",
  "mountain", "river", "waterfall", "beach", "building",
  "house", "bridge", "road", "garden", "cloud", "sunset",

  // Sports and other objects
  "football", "basketball", "tennis racket", "guitar",
  "piano", "ball", "musical instrument", "plant pot",
  "broom", "bucket", "paint brush", "toolbox"
];

// --------------------------------------------------
// STATE AND MODEL CACHE
// --------------------------------------------------

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
// STATUS
// --------------------------------------------------

function setStatus(message, error = false) {
  $("status").textContent = message;
  $("status").classList.toggle("error", error);
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

function showHome() {
  activeRun++;
  activeTask = null;

  $("home").hidden = false;
  $("workspace").hidden = true;
  $("runBtn").disabled = !currentImage || !imageUrl;
}

// --------------------------------------------------
// TASK NAVIGATION
// --------------------------------------------------

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

// --------------------------------------------------
// IMAGE PREVIEW
// --------------------------------------------------

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
// UPLOAD AN IMAGE
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
// CONNECT THE HTML CONTROLS
// --------------------------------------------------

$("imageUpload").addEventListener("change", event => {
  loadUploadedImage(event.target.files[0]);
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

  const model = await pipeline(pipelineTask, modelName);

  modelCache[task] = model;
  return model;
}

// --------------------------------------------------
// CANVAS AND RESULT HELPERS
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
// DRAW DETECTION BOXES
// --------------------------------------------------

function drawBoxes(ctx, predictions, width, height, onlyBest = false) {
  const validPredictions = predictions.filter(item =>
    item &&
    item.box &&
    Number.isFinite(item.box.xmin) &&
    Number.isFinite(item.box.ymin) &&
    Number.isFinite(item.box.xmax) &&
    Number.isFinite(item.box.ymax)
  );

  const list = onlyBest
    ? validPredictions
        .slice()
        .sort((a, b) => b.score - a.score)
        .slice(0, 1)
    : validPredictions;

  ctx.lineWidth = Math.max(3, Math.round(width / 250));
  ctx.font = `bold ${Math.max(15, Math.round(width / 55))}px sans-serif`;

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
// TASK 01: DAILY-OBJECT CLASSIFICATION WITH CLIP
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
    throw new Error("The model returned no usable classification scores.");
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

  const best = ranked[0];

  setStatus(
    `Best match: "${best.label}". Compare the other matches too. These scores do not guarantee correctness.`
  );

  $("resultBadge").textContent = "COMPLETE";
}

// --------------------------------------------------
// TASKS 02 AND 03: DETR OBJECT DETECTION
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

    setStatus(
      "No objects passed the confidence threshold. Try a clearer photo with recognizable objects.",
      true
    );

    $("resultBadge").textContent = "NO DETECTIONS";
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
      `Localization complete. Showing the highest-scoring detected object: "${drawn[0]?.label || "object"}".`
    );
  } else {
    setStatus(
      `Detection complete. ${drawn.length} object(s) shown with individual boxes.`
    );
  }

  $("resultBadge").textContent = "COMPLETE";
}

// --------------------------------------------------
// TASK 04: PANOPTIC SEGMENTATION
// --------------------------------------------------

function getMaskData(mask) {
  if (
    !mask ||
    !mask.data ||
    !Number.isFinite(mask.width) ||
    !Number.isFinite(mask.height) ||
    mask.width <= 0 ||
    mask.height <= 0
  ) {
    throw new Error(
      "The segmentation model returned an unsupported mask format."
    );
  }

  return mask;
}

async function runSegmentation(runId) {
  const model = await getModel("segmentation");

  if (runId !== activeRun) return;

  setStatus("Finding pixel regions. This may take a little longer...");

  // The model card documents this standard pipeline call.
  const segments = await model(imageUrl);

  if (runId !== activeRun) return;

  if (!Array.isArray(segments) || segments.length === 0) {
    throw new Error("The segmentation model returned no segments.");
  }

  const { canvas, ctx } = createCanvasFromImage(currentImage);

  const width = canvas.width;
  const height = canvas.height;

  const overlay = ctx.createImageData(width, height);

  $("results").replaceChildren();

  let visibleSegments = 0;

  for (const segment of segments) {
    if (runId !== activeRun) return;

    if (!segment || !segment.mask || !segment.label) {
      continue;
    }

    const mask = getMaskData(segment.mask);

    const data = mask.data;
    const maskWidth = mask.width;
    const maskHeight = mask.height;
    const channels = mask.channels || 1;

    // Mask values may be normalized or 8-bit.
    // Determine the threshold from the returned data.
    let maxValue = 0;

    for (let i = 0; i < data.length; i += channels) {
      if (Number.isFinite(data[i])) {
        maxValue = Math.max(maxValue, data[i]);
      }
    }

    const cutoff = maxValue <= 1 ? 0.5 : 127;
    const color = colors[visibleSegments % colors.length];

    let painted = false;

    for (let y = 0; y < height; y++) {
      const maskY = Math.min(
        maskHeight - 1,
        Math.floor(y * maskHeight / height)
      );

      for (let x = 0; x < width; x++) {
        const maskX = Math.min(
          maskWidth - 1,
          Math.floor(x * maskWidth / width)
        );

        const maskIndex =
          (maskY * maskWidth + maskX) * channels;

        const value = data[maskIndex];

        if (value > cutoff) {
          const pixelIndex = (y * width + x) * 4;

          overlay.data[pixelIndex] = color[0];
          overlay.data[pixelIndex + 1] = color[1];
          overlay.data[pixelIndex + 2] = color[2];
          overlay.data[pixelIndex + 3] = 105;

          painted = true;
        }
      }
    }

    if (painted) {
      addResultItem(
        segment.label,
        Number.isFinite(segment.score) ? segment.score : 0,
        visibleSegments
      );

      visibleSegments++;
    }
  }

  if (runId !== activeRun) return;

  if (visibleSegments === 0) {
    displayCanvas(canvas);

    setStatus(
      "No visible masks were found. Try another photograph.",
      true
    );

    $("resultBadge").textContent = "NO MASKS";
    return;
  }

  ctx.putImageData(overlay, 0, 0);
  displayCanvas(canvas);

  setStatus(
    `${visibleSegments} segment(s) displayed. Colors show predicted pixel regions, which may include background regions.`
  );

  $("resultBadge").textContent = "COMPLETE";
}

// --------------------------------------------------
// RUN THE SELECTED TASK
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
        "The model could not finish. Check your internet connection and try again. Details: " +
        (error?.message || "Unknown error"),
        true
      );

      $("resultBadge").textContent = "ERROR";
    }
  } finally {
    if (runId === activeRun) {
      $("runBtn").disabled = !currentImage || !imageUrl || !activeTask;
    }
  }
});
