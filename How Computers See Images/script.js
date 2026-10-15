"use strict";

const $ = id => document.getElementById(id);
const originalCanvas = $("originalCanvas");
const originalCtx = originalCanvas.getContext("2d", { willReadFrequently: true });

const channelCanvases = {
  r: $("redCanvas"),
  g: $("greenCanvas"),
  b: $("blueCanvas")
};

const channelContexts = {
  r: channelCanvases.r.getContext("2d"),
  g: channelCanvases.g.getContext("2d"),
  b: channelCanvases.b.getContext("2d")
};

let sourceImageData = null;
let currentWidth = 480;
let currentHeight = 360;
let selectedPixel = null;

function setStatus(message) {
  $("imageStatus").textContent = message;
}

function drawChannels() {
  if (!sourceImageData) return;
  const { data, width, height } = sourceImageData;

  const output = {
    r: channelContexts.r.createImageData(width, height),
    g: channelContexts.g.createImageData(width, height),
    b: channelContexts.b.createImageData(width, height)
  };

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];

    output.r.data[i] = r;
    output.r.data[i + 1] = r;
    output.r.data[i + 2] = r;
    output.r.data[i + 3] = a;

    output.g.data[i] = g;
    output.g.data[i + 1] = g;
    output.g.data[i + 2] = g;
    output.g.data[i + 3] = a;

    output.b.data[i] = b;
    output.b.data[i + 1] = b;
    output.b.data[i + 2] = b;
    output.b.data[i + 3] = a;
  }

  for (const key of ["r", "g", "b"]) {
    const canvas = channelCanvases[key];
    canvas.width = width;
    canvas.height = height;
    channelContexts[key].putImageData(output[key], 0, 0);
  }
}

function drawPixelMarker() {
  if (!selectedPixel || !sourceImageData) return;
  const { x, y } = selectedPixel;

  originalCtx.save();
  originalCtx.strokeStyle = "#ffffff";
  originalCtx.lineWidth = Math.max(2, currentWidth / 240);
  originalCtx.beginPath();
  originalCtx.arc(x + 0.5, y + 0.5,
    Math.max(5, Math.min(currentWidth, currentHeight) / 35),
    0, Math.PI * 2);
  originalCtx.stroke();
  originalCtx.strokeStyle = "#272044";
  originalCtx.lineWidth = 1;
  originalCtx.stroke();
  originalCtx.restore();
}

function inspectPixel(x, y) {
  if (!sourceImageData) return;
  x = Math.max(0, Math.min(currentWidth - 1, x));
  y = Math.max(0, Math.min(currentHeight - 1, y));

  const i = (y * currentWidth + x) * 4;
  const d = sourceImageData.data;
  const r = d[i], g = d[i + 1], b = d[i + 2];

  selectedPixel = { x, y };
  $("pixelR").textContent = r;
  $("pixelG").textContent = g;
  $("pixelB").textContent = b;
  $("pixelSwatch").style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  $("pixelLocation").textContent = `Pixel position: (${x}, ${y}) · RGB (${r}, ${g}, ${b})`;

  originalCtx.putImageData(sourceImageData, 0, 0);
  drawPixelMarker();
}

function loadImage(img, description) {
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  if (!width || !height) {
    setStatus("Unable to read this image.");
    return;
  }

  const scale = Math.min(1, 640 / Math.max(width, height));
  currentWidth = Math.max(1, Math.round(width * scale));
  currentHeight = Math.max(1, Math.round(height * scale));

  originalCanvas.width = currentWidth;
  originalCanvas.height = currentHeight;
  originalCtx.drawImage(img, 0, 0, currentWidth, currentHeight);

  try {
    sourceImageData = originalCtx.getImageData(0, 0, currentWidth, currentHeight);
  } catch (error) {
    sourceImageData = null;
    setStatus("Could not process this image. Please try another.");
    return;
  }

  selectedPixel = null;
  $("pixelR").textContent = "—";
  $("pixelG").textContent = "—";
  $("pixelB").textContent = "—";
  $("pixelSwatch").style.backgroundColor = "#eeeaf7";
  $("pixelLocation").textContent = "Click a pixel to inspect its RGB values.";

  drawChannels();
  setStatus(`${description} · ${currentWidth} × ${currentHeight} pixels`);
}

const samplePhotos = {
  landscape: {
    name: "Real mountain landscape",
    url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=960&q=85"
  },
  fruits: {
    name: "Real fruit photo",
    url: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=960&q=85"
  },
  cat: {
    name: "Real cat photo",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=960&q=85"
  }
};

function loadSamplePhoto(key) {
  const sample = samplePhotos[key];
  const img = new Image();
  img.crossOrigin = "anonymous";
  setStatus(`Loading ${sample.name.toLowerCase()}…`);
  img.onload = () => loadImage(img, `${sample.name} loaded`);
  img.onerror = () => setStatus("The sample photo could not load. Check your internet connection or upload a photo from your computer.");
  img.src = sample.url;
}


function loadImageFromUrl() {
  const field = $("imageUrlInput");
  const url = field.value.trim();
  if (!url) {
    setStatus("Paste a direct image URL first.");
    field.focus();
    return;
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    setStatus("That URL does not look valid. Please paste a full https:// image link.");
    return;
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    setStatus("Please use an http:// or https:// image URL.");
    return;
  }

  const img = new Image();
  img.crossOrigin = "anonymous";
  setStatus("Loading image from URL…");
  img.onload = () => {
    try {
      loadImage(img, "Image URL loaded");
    } catch (error) {
      setStatus("This host does not allow pixel access (CORS). Try a direct image URL from another host or upload the image instead.");
    }
  };
  img.onerror = () => setStatus("Could not load this URL. Use a direct image link ending in .jpg, .jpeg, .png or .webp, and check that the image is public.");
  img.src = url;
}

$("loadUrlBtn").addEventListener("click", loadImageFromUrl);
$("imageUrlInput").addEventListener("keydown", event => {
  if (event.key === "Enter") loadImageFromUrl();
});

originalCanvas.addEventListener("click", event => {
  if (!sourceImageData) return;
  const rect = originalCanvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) * currentWidth / rect.width);
  const y = Math.floor((event.clientY - rect.top) * currentHeight / rect.height);
  inspectPixel(x, y);
});

$("sampleLandscapeBtn").addEventListener("click", () => loadSamplePhoto("landscape"));
$("sampleFruitBtn").addEventListener("click", () => loadSamplePhoto("fruits"));
$("sampleCatBtn").addEventListener("click", () => loadSamplePhoto("cat"));

$("resetPixelBtn").addEventListener("click", () => {
  selectedPixel = null;
  if (sourceImageData) originalCtx.putImageData(sourceImageData, 0, 0);
  $("pixelR").textContent = "—";
  $("pixelG").textContent = "—";
  $("pixelB").textContent = "—";
  $("pixelSwatch").style.backgroundColor = "#eeeaf7";
  $("pixelLocation").textContent = "Click a pixel to inspect its RGB values.";
});

$("imageInput").addEventListener("change", event => {
  const input = event.target;
  const file = input.files[0];
  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    setStatus("Please select a JPG, PNG or WEBP image.");
    input.value = "";
    return;
  }

  if (file.size > 15 * 1024 * 1024) {
    setStatus("Image is too large. Maximum size is 15 MB.");
    input.value = "";
    return;
  }

  const url = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    loadImage(img, `Uploaded: ${file.name}`);
    URL.revokeObjectURL(url);
    input.value = "";
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
    setStatus("Unable to open this image. Please try another.");
    input.value = "";
  };

  setStatus("Loading your image...");
  img.src = url;
});

function updateMixer() {
  const r = Number($("mixR").value);
  const g = Number($("mixG").value);
  const b = Number($("mixB").value);

  $("mixRVal").textContent = r;
  $("mixGVal").textContent = g;
  $("mixBVal").textContent = b;
  $("mixPreview").style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  $("rgbCode").textContent = `RGB (${r}, ${g}, ${b})`;

  const hex = "#" + [r, g, b]
    .map(value => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  $("hexCode").textContent = `HEX ${hex}`;
}

["mixR", "mixG", "mixB"].forEach(id => {
  $(id).addEventListener("input", updateMixer);
});

function setMixer(r, g, b) {
  $("mixR").value = r;
  $("mixG").value = g;
  $("mixB").value = b;
  updateMixer();
}

$("redPreset").addEventListener("click", () => setMixer(255, 0, 0));
$("greenPreset").addEventListener("click", () => setMixer(0, 255, 0));
$("bluePreset").addEventListener("click", () => setMixer(0, 0, 255));
$("whitePreset").addEventListener("click", () => setMixer(255, 255, 255));
$("blackPreset").addEventListener("click", () => setMixer(0, 0, 0));

const questions = [
  {
    q: "What RGB values represent pure blue?",
    options: ["A. (255, 0, 0)", "B. (0, 0, 255)", "C. (255, 255, 255)"],
    answer: 1,
    why: "Correct! Blue is at maximum intensity; red and green are zero."
  },
  {
    q: "What does an intensity value of 0 mean?",
    options: ["A. Maximum intensity", "B. No intensity in that channel", "C. Always white"],
    answer: 1,
    why: "Correct! Zero means that channel contributes no intensity."
  },
  {
    q: "Which RGB values produce white?",
    options: ["A. (0, 0, 0)", "B. (255, 0, 0)", "C. (255, 255, 255)"],
    answer: 2,
    why: "Correct! All three channels at maximum intensity produce white."
  },
  {
    q: "What is a pixel?",
    options: ["A. A tiny picture element", "B. A type of keyboard", "C. A sound wave"],
    answer: 0,
    why: "Correct! Pixels are the tiny picture elements that make up an image."
  }
];

let questionIndex = 0;
let answered = false;

function renderQuestion() {
  const question = questions[questionIndex];
  answered = false;

  $("quizQuestion").textContent =
    `Question ${questionIndex + 1} of ${questions.length}: ${question.q}`;
  $("quizFeedback").textContent = "";
  $("quizOptions").replaceChildren();

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.textContent = option;

    button.addEventListener("click", () => {
      if (answered) return;
      answered = true;

      if (index === question.answer) {
        $("quizFeedback").textContent = "✅ " + question.why;
        $("quizFeedback").style.color = "#13844c";
      } else {
        $("quizFeedback").textContent =
          "❌ Not quite! Think about the RGB channel values.";
        $("quizFeedback").style.color = "#c33b50";
      }

      $("quizOptions").querySelectorAll("button").forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = "0.7";
      });
    });

    $("quizOptions").appendChild(button);
  });

  $("nextQuestion").textContent =
    questionIndex === questions.length - 1 ? "↻ Start Again" : "Next Question →";
}

$("nextQuestion").addEventListener("click", () => {
  questionIndex = (questionIndex + 1) % questions.length;
  renderQuestion();
});

updateMixer();
renderQuestion();
// Start with a real photograph instead of a drawn/vector illustration.
loadSamplePhoto("landscape");
