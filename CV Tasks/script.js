
import { pipeline, env } from
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

env.allowLocalModels = false;

const $ = id => document.getElementById(id);

const taskInfo = {
  classification: {
    number: "TASK 01",
    title: "Single-object classification",
    description: "Predict the main image classes and compare their scores.",
    lesson: "Classification answers WHAT is in an image. It does not tell us the object's exact location.",
    key: "OUTPUT → LABELS + SCORES"
  },
  localization: {
    number: "TASK 02",
    title: "Classification + localization",
    description: "Predict an object's class and locate it with a bounding box.",
    lesson: "Localization adds WHERE to classification. This demo uses the highest-scoring detected object as the main object.",
    key: "OUTPUT → MAIN LABEL + BOUNDING BOX"
  },
  detection: {
    number: "TASK 03",
    title: "Multiple-object detection",
    description: "Find several objects and draw a separate bounding box around each.",
    lesson: "Object detection identifies WHAT and WHERE for each detected object. Boxes are rectangular approximations, not exact object outlines.",
    key: "OUTPUT → LABELS + BOXES"
  },
  segmentation: {
    number: "TASK 04",
    title: "Instance segmentation",
    description: "Generate pixel masks for individual image segments.",
    lesson: "Segmentation follows predicted pixel regions rather than just rectangles. This pretrained model performs panoptic segmentation, which combines individual object instances with background regions.",
    key: "OUTPUT → LABELS + PIXEL MASKS"
  }
};

const sampleImages = [
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=85"
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

function setStatus(message, error = false) {
  $("status").textContent = message;
  $("status").classList.toggle("error", error);
}

function showHome() {
  activeRun++;
  activeTask = null;
  $("home").hidden = false;
  $("workspace").hidden = true;
}

function openTask(task) {
  activeTask = task;
  $("home").hidden = true;
  $("workspace").hidden = false;

  const info = taskInfo[task];
  $("taskEyebrow").textContent = info.number;
  $("taskTitle").textContent = info.title;
  $("taskDescription").textContent = info.description;
  $("learningContent").replaceChildren();

  const h3 = document.createElement("h3");
  h3.textContent = "What should you notice?";

  const p = document.createElement("p");
  p.textContent = info.lesson;

  const key = document.createElement("span");
  key.className = "learning-key";
  key.textContent = info.key;

  $("learningContent").append(h3, p, key);

  $("resultBadge").textContent = "WAITING";
  $("results").replaceChildren();
  $("resultCanvasWrap").replaceChildren();

  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.innerHTML = "<span>✨</span><p>Your model output will appear here.</p>";
  $("resultCanvasWrap").appendChild(empty);

  if (currentImage) {
    showImagePreview(currentImage);
  }

  setStatus("Choose an image, then run the selected task.");
}

function showImagePreview(img) {
  currentImage = img;
  $("preview").replaceChildren();
  const preview = document.createElement("img");
  preview.src = img.src;
  preview.alt = "Selected photograph";
  $("preview").appendChild(preview);
  $("runBtn").disabled = false;
}

function loadRemoteImage(url) {
  setStatus("Loading photograph...");

  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = () => {
    if (imageUrl && imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }

    imageUrl = url;
    showImagePreview(img);
    setStatus("Image ready. Run the model when you are ready.");
  };

  img.onerror = () => {
    setStatus("This sample could not load. Try uploading a photo instead.", true);
  };

  img.src = url;
}

function loadUploadedImage(file) {
  if (!file) return;

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    setStatus("Please upload a JPG, PNG, or WEBP image.", true);
    return;
  }

  if (imageUrl && imageUrl.startsWith("blob:")) {
    URL.revokeObjectURL(imageUrl);
  }

  imageUrl = URL.createObjectURL(file);

  const img = new Image();
  img.onload = () => {
    showImagePreview(img);
    setStatus("Your image is ready. Select Run computer vision.");
  };

  img.onerror = () => {
    setStatus("Unable to open this image. Please try another file.", true);
  };

  img.src = imageUrl;
}

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

$("backBtn").addEventListener("click", showHome);

async function getModel(task) {
  if (modelCache[task]) return modelCache[task];

  let pipelineTask;
  let modelName;

  if (task === "classification") {
  pipelineTask = "image-classification";
  modelName = "onnx-community/mobilenet_v2_1.0_224";
  } else if (task === "localization" || task === "detection") {
    pipelineTask = "object-detection";
    modelName = "Xenova/detr-resnet-50";
  } else {
    pipelineTask = "image-segmentation";
    modelName = "Xenova/detr-resnet-50-panoptic";
  }

  setStatus("Downloading the pretrained AI model. The first load may take a while...");

  const model = await pipeline(pipelineTask, modelName);
  modelCache[task] = model;
  return model;
}

function createCanvasFromImage(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return { canvas, ctx };
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
    : "";

  line.append(name, percent);

  const track = document.createElement("div");
  track.className = "score-track";

  const fill = document.createElement("div");
  fill.className = "score-fill";
  fill.style.width = `${Math.max(0, Math.min(100, (score || 0) * 100))}%`;
  fill.style.background = `linear-gradient(90deg, rgb(${colors[index % colors.length].join(",")}), #8c82ff)`;

  track.appendChild(fill);
  item.append(line, track);
  $("results").appendChild(item);
}

function displayCanvas(canvas) {
  $("resultCanvasWrap").replaceChildren();
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  canvas.style.display = "block";
  $("resultCanvasWrap").appendChild(canvas);
}

function drawBoxes(ctx, predictions, width, height, onlyBest = false) {
  const list = onlyBest
    ? predictions.slice().sort((a, b) => b.score - a.score).slice(0, 1)
    : predictions;

  ctx.lineWidth = Math.max(3, Math.round(width / 250));
  ctx.font = `bold ${Math.max(15, Math.round(width / 55))}px sans-serif`;

  list.forEach((prediction, index) => {
    const { xmin, ymin, xmax, ymax } = prediction.box;
    const color = colors[index % colors.length];
    const stroke = `rgb(${color.join(",")})`;

    ctx.strokeStyle = stroke;
    ctx.fillStyle = stroke;
    ctx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin);

    const label = `${prediction.label} ${(prediction.score * 100).toFixed(0)}%`;
    const labelWidth = ctx.measureText(label).width + 12;
    const labelY = Math.max(0, ymin - 28);

    ctx.fillRect(xmin, labelY, labelWidth, 26);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, xmin + 6, labelY + 18);
  });

  return list;
}

async function runClassification(runId) {
  const model = await getModel("classification");
  if (runId !== activeRun) return;

  setStatus("Classifying the image...");
  const predictions = await model(imageUrl);

  if (runId !== activeRun) return;

  $("results").replaceChildren();

  predictions.slice(0, 5).forEach((item, index) => {
    addResultItem(item.label, item.score, index);
  });

  $("resultCanvasWrap").replaceChildren();
  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = "Original image without detection boxes";
  img.style.width = "100%";
  img.style.height = "auto";
  $("resultCanvasWrap").appendChild(img);

  setStatus("Classification complete. These are model scores, not guarantees.");
  $("resultBadge").textContent = "COMPLETE";
}

async function runDetection(runId, single = false) {
  const model = await getModel(single ? "localization" : "detection");
  if (runId !== activeRun) return;

  setStatus("Detecting objects and calculating bounding boxes...");
  const predictions = await model(imageUrl, { threshold: 0.35 });

  if (runId !== activeRun) return;

  const { canvas, ctx } = createCanvasFromImage(currentImage);
  const filtered = predictions.filter(p => p.score >= 0.35);

  if (filtered.length === 0) {
    displayCanvas(canvas);
    $("results").replaceChildren();
    setStatus("No objects passed the confidence threshold. Try a clearer image.", true);
    $("resultBadge").textContent = "NO DETECTIONS";
    return;
  }

  const drawn = drawBoxes(ctx, filtered, canvas.width, canvas.height, single);
  displayCanvas(canvas);
  $("results").replaceChildren();

  drawn.forEach((item, index) => {
    addResultItem(item.label, item.score, index);
  });

  if (single) {
    setStatus("Localization complete. The box marks the highest-scoring detected object.");
  } else {
    setStatus(`Detection complete. ${drawn.length} object(s) shown with individual boxes.`);
  }

  $("resultBadge").textContent = "COMPLETE";
}

function getMaskData(mask) {
  if (!mask || !mask.data || !mask.width || !mask.height) {
    throw new Error("The segmentation model returned a mask in an unexpected format.");
  }
  return mask;
}

async function runSegmentation(runId) {
  const model = await getModel("segmentation");
  if (runId !== activeRun) return;

  setStatus("Finding pixel regions. Segmentation can take longer than detection.");

  const segments = await model(imageUrl, {
    threshold: 0.5,
    mask_threshold: 0.5,
    subtask: "panoptic"
  });

  if (runId !== activeRun) return;

  const { canvas, ctx } = createCanvasFromImage(currentImage);
  const width = canvas.width;
  const height = canvas.height;

  const overlay = ctx.createImageData(width, height);
  let visibleSegments = 0;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (!segment.mask || !segment.label) continue;

    const mask = getMaskData(segment.mask);
    const mw = mask.width;
    const mh = mask.height;
    const channels = mask.channels || 1;
    const color = colors[visibleSegments % colors.length];
    let painted = false;

    for (let y = 0; y < height; y++) {
      const my = Math.min(mh - 1, Math.floor(y * mh / height));

      for (let x = 0; x < width; x++) {
        const mx = Math.min(mw - 1, Math.floor(x * mw / width));
        const maskIndex = (my * mw + mx) * channels;
        const value = mask.data[maskIndex];

        if (value > 127) {
          const idx = (y * width + x) * 4;

          overlay.data[idx] = color[0];
          overlay.data[idx + 1] = color[1];
          overlay.data[idx + 2] = color[2];
          overlay.data[idx + 3] = 100;
          painted = true;
        }
      }
    }

    if (painted) {
      visibleSegments++;
      addResultItem(segment.label, segment.score, visibleSegments - 1);
    }
  }

  if (visibleSegments === 0) {
    setStatus("No visible segments were returned. Try another photo.", true);
    $("resultBadge").textContent = "NO MASKS";
    displayCanvas(canvas);
    return;
  }

  ctx.putImageData(overlay, 0, 0);
  displayCanvas(canvas);

  setStatus(
    `${visibleSegments} segment mask(s) displayed. This is panoptic segmentation: it can include object instances and background regions.`
  );
  $("resultBadge").textContent = "COMPLETE";
}

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
    } else {
      await runSegmentation(runId);
    }
  } catch (error) {
    console.error(error);
    if (runId === activeRun) {
      setStatus(
        "The model could not finish. Check your internet connection, reload the page, and try again. Details: " +
        (error?.message || "unknown error"),
        true
      );
      $("resultBadge").textContent = "ERROR";
    }
  } finally {
    if (runId === activeRun) $("runBtn").disabled = false;
  }
});
