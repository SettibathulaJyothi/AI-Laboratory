
"use strict";

// ==========================================================
// PIXEL EXPLORER - GRAYSCALE AND RGB LEARNING LAB
// All image processing is performed locally in the browser.
// ==========================================================

const $ = (id) => document.getElementById(id);

const imageCanvas = $("imageCanvas");
const imageCtx = imageCanvas.getContext("2d", { willReadFrequently: true });
const histogramCanvas = $("histogramCanvas");
const histogramCtx = histogramCanvas.getContext("2d");

const workingCanvas = document.createElement("canvas");
const workingCtx = workingCanvas.getContext("2d", {
  willReadFrequently: true
});

const MAX_DIMENSION = 800;
const MAX_UPLOAD_SIZE = 15 * 1024 * 1024;

let sourceData = null;
let currentMode = "original";
let currentImageName = "Garden scene";
let selectedPixel = { x: 0, y: 0 };
let hasSelectedPixel = false;
let histogramChannel = "gray";
let histogramCounts = new Uint32Array(256);
let imageObjectUrl = null;
let quizIndex = 0;
let quizScore = 0;
let answeredQuestions = 0;
let questionAnswered = false;

// ----------------------------------------------------------
// COLOR AND PIXEL UTILITIES
// ----------------------------------------------------------

function grayscale(r, g, b) {
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rgbString(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`;
}

function hexColor(r, g, b) {
  return "#" + [r, g, b]
    .map(v => v.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function readableTextColor(r, g, b) {
  return (0.299 * r + 0.587 * g + 0.114 * b) > 145
    ? "#17202b"
    : "#ffffff";
}

// ----------------------------------------------------------
// SAMPLE IMAGES - GENERATED LOCALLY, NO EXTERNAL IMAGE URLS
// ----------------------------------------------------------

function createSample(type) {
  const c = document.createElement("canvas");
  c.width = 480;
  c.height = 320;

  const ctx = c.getContext("2d");
  const w = c.width;
  const h = c.height;

  if (type === "garden") {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#79c8ed");
    sky.addColorStop(1, "#e6f5ff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Sun
    ctx.fillStyle = "#ffe27a";
    ctx.beginPath();
    ctx.arc(390, 54, 29, 0, Math.PI * 2);
    ctx.fill();

    // Distant hills
    ctx.fillStyle = "#a7d4a0";
    ctx.beginPath();
    ctx.moveTo(0, 220);
    ctx.quadraticCurveTo(110, 120, 225, 220);
    ctx.quadraticCurveTo(340, 140, 480, 210);
    ctx.lineTo(480, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Grass
    const grass = ctx.createLinearGradient(0, 210, 0, h);
    grass.addColorStop(0, "#62b96b");
    grass.addColorStop(1, "#237444");
    ctx.fillStyle = grass;
    ctx.fillRect(0, 210, w, 110);

    // Tree trunk
    ctx.fillStyle = "#81502f";
    ctx.fillRect(105, 123, 32, 130);

    // Tree crown
    [
      [121, 92, 55, "#32864b"],
      [84, 118, 42, "#45a75b"],
      [151, 120, 42, "#267943"],
      [119, 63, 36, "#4eaf61"]
    ].forEach(([x, y, r, color]) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Flowers
    for (let i = 0; i < 13; i++) {
      const x = 195 + (i * 37) % 265;
      const y = 240 + (i * 23) % 65;
      ctx.strokeStyle = "#26733a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + 4);
      ctx.lineTo(x, y + 16);
      ctx.stroke();

      ctx.fillStyle = ["#ffdc57", "#f08ab5", "#ffffff"][i % 3];
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Path
    ctx.fillStyle = "#d9c7a3";
    ctx.beginPath();
    ctx.moveTo(210, 320);
    ctx.lineTo(278, 225);
    ctx.lineTo(319, 225);
    ctx.lineTo(390, 320);
    ctx.fill();

  } else if (type === "sunset") {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#343c88");
    sky.addColorStop(0.36, "#e46d8d");
    sky.addColorStop(0.65, "#ffbd74");
    sky.addColorStop(1, "#f8e0a2");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Sun
    ctx.fillStyle = "#fff1b1";
    ctx.beginPath();
    ctx.arc(240, 169, 49, 0, Math.PI * 2);
    ctx.fill();

    // Water
    ctx.fillStyle = "#536f9e";
    ctx.fillRect(0, 208, w, 112);

    // Reflections
    for (let i = 0; i < 17; i++) {
      const y = 218 + i * 6;
      const width = 20 + ((i * 43) % 140);
      ctx.fillStyle = i % 2 ? "#f9bf98" : "#9bb6c8";
      ctx.fillRect(240 - width / 2, y, width, 2 + i % 3);
    }

    // Hills
    ctx.fillStyle = "#343c59";
    ctx.beginPath();
    ctx.moveTo(0, 222);
    ctx.lineTo(85, 156);
    ctx.lineTo(152, 220);
    ctx.lineTo(235, 174);
    ctx.lineTo(333, 231);
    ctx.lineTo(414, 163);
    ctx.lineTo(480, 216);
    ctx.lineTo(480, 245);
    ctx.lineTo(0, 245);
    ctx.fill();

    // Foreground
    ctx.fillStyle = "#252f49";
    ctx.fillRect(0, 275, w, 45);

  } else if (type === "fruit") {
    ctx.fillStyle = "#fff5e7";
    ctx.fillRect(0, 0, w, h);

    // Table
    ctx.fillStyle = "#d6a77b";
    ctx.fillRect(0, 228, w, 92);
    ctx.fillStyle = "#bd895e";
    ctx.fillRect(0, 240, w, 9);

    // Shadow
    ctx.fillStyle = "#d8c3ad";
    ctx.beginPath();
    ctx.ellipse(245, 233, 163, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Apple
    const apple = ctx.createRadialGradient(132, 128, 8, 153, 150, 80);
    apple.addColorStop(0, "#ff8585");
    apple.addColorStop(1, "#bb1f36");
    ctx.fillStyle = apple;
    ctx.beginPath();
    ctx.moveTo(143, 109);
    ctx.bezierCurveTo(86, 67, 45, 119, 74, 178);
    ctx.bezierCurveTo(91, 222, 137, 229, 151, 207);
    ctx.bezierCurveTo(181, 229, 224, 196, 226, 151);
    ctx.bezierCurveTo(231, 104, 186, 76, 151, 111);
    ctx.fill();

    // Apple leaf and stem
    ctx.fillStyle = "#3e8246";
    ctx.beginPath();
    ctx.ellipse(172, 94, 22, 9, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#65412d";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(151, 113);
    ctx.lineTo(157, 89);
    ctx.stroke();

    // Orange
    const orange = ctx.createRadialGradient(319, 120, 8, 341, 152, 67);
    orange.addColorStop(0, "#ffd36b");
    orange.addColorStop(1, "#ec791d");
    ctx.fillStyle = orange;
    ctx.beginPath();
    ctx.arc(340, 166, 63, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#488c43";
    ctx.beginPath();
    ctx.ellipse(347, 100, 20, 9, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Small green fruit
    ctx.fillStyle = "#9bc75d";
    ctx.beginPath();
    ctx.ellipse(263, 201, 37, 29, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#648b3c";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(262, 177);
    ctx.lineTo(266, 163);
    ctx.stroke();
  }

  return c;
}

// ----------------------------------------------------------
// LOAD IMAGE INTO A WORKING CANVAS
// ----------------------------------------------------------

function loadSourceCanvas(source, name) {
  let width = source.width || source.naturalWidth;
  let height = source.height || source.naturalHeight;

  if (!width || !height) {
    setStatus("This image could not be read. Please try another image.");
    return;
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));

  workingCanvas.width = width;
  workingCanvas.height = height;

  try {
    workingCtx.clearRect(0, 0, width, height);
    workingCtx.drawImage(source, 0, 0, width, height);
    sourceData = workingCtx.getImageData(0, 0, width, height);
  } catch (error) {
    console.error(error);
    setStatus("The browser could not read this image. Try a different file.");
    return;
  }

  currentImageName = name;
  selectedPixel = {
    x: Math.floor(width / 2),
    y: Math.floor(height / 2)
  };
  hasSelectedPixel = true;

  $("imageInfo").textContent =
    `${name} · ${width} × ${height} pixels` +
    (scale < 1 ? " · resized for performance" : "");

  $("imageDimensions").textContent = `${width} × ${height} px`;
  $("statWidth").textContent = width.toLocaleString();
  $("statHeight").textContent = height.toLocaleString();
  $("statPixels").textContent = (width * height).toLocaleString();

  $("canvasPlaceholder").style.display = "none";

  renderImage();
  updateInspector();
  updateHistogram();
  setStatus("Image ready. Click it to inspect individual pixels.");
}

function setStatus(message) {
  $("imageInfo").textContent = message;
}

// ----------------------------------------------------------
// RENDER ORIGINAL, GRAYSCALE AND RGB CHANNELS
// ----------------------------------------------------------

function renderImage() {
  if (!sourceData) return;

  const width = sourceData.width;
  const height = sourceData.height;
  const output = new ImageData(
    new Uint8ClampedArray(sourceData.data),
    width,
    height
  );
  const data = output.data;

  const modes = {
    original: {
      title: "Original RGB image",
      heading: "Original RGB image",
      description: "Each pixel stores separate Red, Green and Blue intensities.",
      formula: "Pixel = (R, G, B)",
      note: "Each 8-bit channel has 256 possible intensity values."
    },
    gray: {
      title: "Grayscale image",
      heading: "Brightness only",
      description: "Color is converted into a single weighted brightness value.",
      formula: "Gray = 0.299R + 0.587G + 0.114B",
      note: "0 represents black, 255 represents white, and intermediate values are gray."
    },
    red: {
      title: "Red channel",
      heading: "Red intensity",
      description: "Shows the red intensity at every pixel. Redder areas appear brighter.",
      formula: "R = 0 to 255",
      note: "The other two channels are removed from this view."
    },
    green: {
      title: "Green channel",
      heading: "Green intensity",
      description: "Shows the green intensity at every pixel. Greener areas appear brighter.",
      formula: "G = 0 to 255",
      note: "The other two channels are removed from this view."
    },
    blue: {
      title: "Blue channel",
      heading: "Blue intensity",
      description: "Shows the blue intensity at every pixel. Bluer areas appear brighter.",
      formula: "B = 0 to 255",
      note: "The other two channels are removed from this view."
    }
  };

  for (let i = 0; i < data.length; i += 4) {
    const r = sourceData.data[i];
    const g = sourceData.data[i + 1];
    const b = sourceData.data[i + 2];

    if (currentMode === "gray") {
      const gray = grayscale(r, g, b);
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    } else if (currentMode === "red") {
      data[i] = r;
      data[i + 1] = 0;
      data[i + 2] = 0;
    } else if (currentMode === "green") {
      data[i] = 0;
      data[i + 1] = g;
      data[i + 2] = 0;
    } else if (currentMode === "blue") {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = b;
    }
  }

  imageCanvas.width = width;
  imageCanvas.height = height;
  imageCtx.putImageData(output, 0, 0);

  const info = modes[currentMode];
  $("viewTitle").textContent = info.title;
  $("modeHeading").textContent = info.heading;
  $("modeDescription").textContent = info.description;
  $("modeFormula").textContent = info.formula;
  $("modeNote").textContent = info.note;

  document.querySelectorAll(".mode-btn").forEach(button => {
    const active = button.dataset.mode === currentMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  updateInspector();
}

// ----------------------------------------------------------
// PIXEL INSPECTOR AND 9 X 9 MATRIX
// ----------------------------------------------------------

function getPixel(x, y) {
  const width = sourceData.width;
  const index = (y * width + x) * 4;
  const d = sourceData.data;

  const r = d[index];
  const g = d[index + 1];
  const b = d[index + 2];

  return { r, g, b, gray: grayscale(r, g, b) };
}

function updateInspector() {
  if (!sourceData || !hasSelectedPixel) return;

  const { x, y } = selectedPixel;
  const p = getPixel(x, y);

  $("pixelR").textContent = p.r;
  $("pixelG").textContent = p.g;
  $("pixelB").textContent = p.b;
  $("pixelGray").textContent = p.gray;

  $("pixelCoordinates").textContent = `Coordinates: (${x}, ${y})`;
  $("pixelColorName").textContent = hexColor(p.r, p.g, p.b);
  $("pixelSwatch").style.background = rgbString(p.r, p.g, p.b);
  $("pixelSwatch").title = `RGB (${p.r}, ${p.g}, ${p.b})`;

  buildMatrix(x, y);
}

function buildMatrix(centerX, centerY) {
  const matrix = $("pixelMatrix");
  matrix.replaceChildren();

  const width = sourceData.width;
  const height = sourceData.height;

  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const x = centerX + dx;
      const y = centerY + dy;

      const cell = document.createElement("div");
      cell.className = "matrix-cell";

      if (x < 0 || x >= width || y < 0 || y >= height) {
        cell.style.background = "#e9edf3";
        cell.textContent = "—";
        cell.title = "Outside image boundaries";
        cell.setAttribute("aria-label", "Outside image boundaries");
      } else {
        const p = getPixel(x, y);
        cell.style.background = rgbString(p.r, p.g, p.b);
        cell.style.color = readableTextColor(p.r, p.g, p.b);
        cell.textContent = `${p.r},${p.g},${p.b}`;
        cell.title = `Pixel (${x}, ${y}) | RGB(${p.r}, ${p.g}, ${p.b}) | Gray ${p.gray}`;
        cell.setAttribute("aria-label", cell.title);

        if (x === centerX && y === centerY) {
          cell.classList.add("selected");
        }
      }

      matrix.appendChild(cell);
    }
  }
}

imageCanvas.addEventListener("click", (event) => {
  if (!sourceData) return;

  const rect = imageCanvas.getBoundingClientRect();
  const x = clamp(
    Math.floor((event.clientX - rect.left) * imageCanvas.width / rect.width),
    0,
    sourceData.width - 1
  );
  const y = clamp(
    Math.floor((event.clientY - rect.top) * imageCanvas.height / rect.height),
    0,
    sourceData.height - 1
  );

  selectedPixel = { x, y };
  hasSelectedPixel = true;
  updateInspector();
});

// ----------------------------------------------------------
// HISTOGRAM
// ----------------------------------------------------------

function updateHistogram() {
  if (!sourceData) return;

  histogramChannel = $("histMode").value;
  histogramCounts = new Uint32Array(256);

  const data = sourceData.data;
  let sum = 0;
  const totalPixels = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    let value;

    if (histogramChannel === "red") value = data[i];
    else if (histogramChannel === "green") value = data[i + 1];
    else if (histogramChannel === "blue") value = data[i + 2];
    else value = grayscale(data[i], data[i + 1], data[i + 2]);

    histogramCounts[value]++;
    sum += value;
  }

  const average = (sum / totalPixels).toFixed(1);
  const occupied = histogramCounts.reduce(
    (count, n) => count + (n > 0 ? 1 : 0), 0
  );

  $("histSummary").textContent =
    `Mean: ${average} · Used intensity levels: ${occupied}/256`;

  drawHistogram();
}

function drawHistogram() {
  const canvas = histogramCanvas;
  const rect = canvas.getBoundingClientRect();
  const cssWidth = Math.max(280, rect.width || 600);
  const cssHeight = 205;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);

  const ctx = histogramCtx;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  ctx.fillStyle = "#fbfcff";
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  const margin = { left: 37, right: 10, top: 12, bottom: 27 };
  const plotW = cssWidth - margin.left - margin.right;
  const plotH = cssHeight - margin.top - margin.bottom;

  const maxCount = Math.max(1, ...histogramCounts);
  const channelColors = {
    gray: "#65758b",
    red: "#e7444b",
    green: "#26954c",
    blue: "#3477e8"
  };
  const barColor = channelColors[histogramChannel];

  // Horizontal guide lines and labels
  ctx.font = "10px Arial";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= 4; i++) {
    const y = margin.top + (plotH * i / 4);
    ctx.strokeStyle = "#e5eaf1";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(cssWidth - margin.right, y);
    ctx.stroke();

    const count = Math.round(maxCount * (1 - i / 4));
    ctx.fillStyle = "#7a8798";
    ctx.fillText(count.toLocaleString(), margin.left - 5, y);
  }

  const step = plotW / 256;

  ctx.fillStyle = barColor;
  for (let i = 0; i < 256; i++) {
    const barH = (histogramCounts[i] / maxCount) * plotH;
    if (histogramCounts[i] === 0) continue;
    const x = margin.left + i * step;
    const y = margin.top + plotH - barH;
    ctx.fillRect(x, y, Math.max(1, step), barH);
  }

  // X-axis intensity labels
  ctx.fillStyle = "#65758b";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  [0, 64, 128, 192, 255].forEach(value => {
    const x = margin.left + (value / 255) * plotW;
    ctx.fillText(String(value), x, margin.top + plotH + 6);
  });

  ctx.strokeStyle = "#aeb9c8";
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top + plotH);
  ctx.lineTo(cssWidth - margin.right, margin.top + plotH);
  ctx.stroke();
}

$("histMode").addEventListener("change", updateHistogram);

// ----------------------------------------------------------
// MODE BUTTONS
// ----------------------------------------------------------

document.querySelectorAll(".mode-btn").forEach(button => {
  button.addEventListener("click", () => {
    currentMode = button.dataset.mode;
    renderImage();
  });
});

// ----------------------------------------------------------
// SAMPLE SELECTION AND IMAGE UPLOAD
// ----------------------------------------------------------


function selectSample(type) {
  const samples = {
    garden: {
      name: "Garden / Nature",
      src: "images/garden.jpg"
    },
    sunset: {
      name: "Sunset",
      src: "images/sunset.jpg"
    },
    fruit: {
      name: "Fruits",
      src: "images/fruits.jpg"
    }
  };

  const sample = samples[type];

  if (!sample) {
    setStatus("Sample image not found.");
    return;
  }

  setStatus("Loading " + sample.name + "...");

  const img = new Image();

  img.onload = function () {
    document.querySelectorAll(".sample-btn").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.sample === type
      );
    });

    currentMode = "original";
    loadSourceCanvas(img, sample.name);
  };

  img.onerror = function () {
    setStatus("Could not find " + sample.src +
      ". Check your images folder and filenames.");
  };

  img.src = sample.src;
}

 // Connect the Garden, Sunset and Fruit sample buttons
document.querySelectorAll(".sample-btn").forEach(button => {
  button.addEventListener("click", () => {
    selectSample(button.dataset.sample);
  });
});

// Handle image uploads
const imageInput = $("imageInput");

if (imageInput) {
  imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("Please select a valid image.");
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      setStatus("Image must be smaller than 15 MB.");
      event.target.value = "";
      return;
    }

    setStatus("Loading your image...");

    const imageUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      document.querySelectorAll(".sample-btn").forEach(button => {
        button.classList.remove("active");
      });

      currentMode = "original";
      loadSourceCanvas(img, file.name);

      URL.revokeObjectURL(imageUrl);
      event.target.value = "";
    };

    img.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      setStatus("Unable to open this image. Please try another.");
      event.target.value = "";
    };

    img.src = imageUrl;
  });
}

// ----------------------------------------------------------
// RGB COLOR MIXER
// ----------------------------------------------------------

const sliders = {
  red: $("redSlider"),
  green: $("greenSlider"),
  blue: $("blueSlider")
};

function updateMixer() {
  const r = Number(sliders.red.value);
  const g = Number(sliders.green.value);
  const b = Number(sliders.blue.value);

  $("redOutput").textContent = r;
  $("greenOutput").textContent = g;
  $("blueOutput").textContent = b;

  $("mixedColor").style.background = rgbString(r, g, b);
  $("hexValue").textContent = hexColor(r, g, b);
  $("rgbValue").textContent = `RGB (${r}, ${g}, ${b})`;

  const values = [
    ["Red", r],
    ["Green", g],
    ["Blue", b]
  ].sort((a, b) => b[1] - a[1]);

  let explanation;

  if (r === g && g === b) {
    explanation = r === 0
      ? "All channels are zero, so the result is black."
      : r === 255
        ? "All channels are at maximum intensity, producing white."
        : "Equal channel values produce a shade of gray.";
  } else if (values[0][1] === values[1][1]) {
    explanation = `${values[0][0]} and ${values[1][0]} are equally strong.`;
  } else {
    explanation = `${values[0][0]} has the highest intensity.`;
  }

  $("mixExplanation").textContent = explanation;
}

Object.values(sliders).forEach(slider => {
  slider.addEventListener("input", updateMixer);
});

const presets = {
  red: [255, 0, 0],
  green: [0, 255, 0],
  blue: [0, 0, 255],
  yellow: [255, 255, 0],
  cyan: [0, 255, 255],
  magenta: [255, 0, 255],
  white: [255, 255, 255],
  black: [0, 0, 0]
};

document.querySelectorAll(".preset-btn").forEach(button => {
  button.addEventListener("click", () => {
    const color = presets[button.dataset.color];
    sliders.red.value = color[0];
    sliders.green.value = color[1];
    sliders.blue.value = color[2];
    updateMixer();
  });
});

// ----------------------------------------------------------
// STUDENT QUIZ
// ----------------------------------------------------------

const questions = [
  {
    question: "What does a grayscale value of 0 represent?",
    options: ["Pure white", "Pure black", "Pure red", "Bright green"],
    answer: 1,
    explanation: "0 is black. A value of 255 represents white."
  },
  {
    question: "How many color channels are in a standard RGB pixel?",
    options: ["One", "Two", "Three", "Eight"],
    answer: 2,
    explanation: "RGB stands for Red, Green and Blue."
  },
  {
    question: "What is the RGB value for pure red?",
    options: [
      "(0, 0, 255)",
      "(255, 255, 0)",
      "(0, 255, 0)",
      "(255, 0, 0)"
    ],
    answer: 3,
    explanation: "Pure red has maximum red and zero green and blue."
  },
  {
    question: "How many possible values does an 8-bit channel have?",
    options: ["8", "16", "255", "256"],
    answer: 3,
    explanation: "Values run from 0 through 255, giving 256 possible values."
  },
  {
    question: "What does a histogram show?",
    options: [
      "The image file name",
      "The distribution of pixel intensities",
      "Only the image width",
      "The number of RGB channels"
    ],
    answer: 1,
    explanation: "A histogram counts how many pixels have each intensity."
  },
  {
    question: "Which RGB combination produces white?",
    options: [
      "(0, 0, 0)",
      "(255, 0, 0)",
      "(255, 255, 255)",
      "(0, 255, 0)"
    ],
    answer: 2,
    explanation: "White is produced when all three RGB channels are at 255."
  }
];

function renderQuestion() {
  questionAnswered = false;
  const q = questions[quizIndex];

  $("quizProgress").textContent =
    `QUESTION ${quizIndex + 1} OF ${questions.length}`;
  $("quizQuestion").textContent = q.question;
  $("quizFeedback").textContent = "";
  $("nextQuestion").disabled = true;
  $("nextQuestion").textContent =
    quizIndex === questions.length - 1 ? "See results →" : "Next question →";

  const options = $("quizOptions");
  options.replaceChildren();

  q.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option";
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;

    button.addEventListener("click", () => answerQuestion(index));
    options.appendChild(button);
  });

  updateScore();
}

function answerQuestion(selected) {
  if (questionAnswered) return;
  questionAnswered = true;

  const q = questions[quizIndex];
  const buttons = [...$("quizOptions").children];
  const correct = selected === q.answer;

  answeredQuestions++;

  if (correct) quizScore++;

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === q.answer) button.classList.add("correct");
    else if (index === selected) button.classList.add("incorrect");
  });

  $("quizFeedback").textContent =
    (correct ? "Correct! " : "Not quite. ") + q.explanation;

  $("quizFeedback").style.color = correct ? "#227b3f" : "#b52f36";
  $("nextQuestion").disabled = false;
  updateScore();
}

function updateScore() {
  $("quizScore").textContent =
    `Score: ${quizScore} / ${answeredQuestions}`;
}

$("nextQuestion").addEventListener("click", () => {
  if (!questionAnswered) return;

  if (quizIndex < questions.length - 1) {
    quizIndex++;
    renderQuestion();
  } else {
    showQuizResults();
  }
});

function showQuizResults() {
  const percent = Math.round((quizScore / questions.length) * 100);
  $("quizProgress").textContent = "QUIZ COMPLETE";
  $("quizQuestion").textContent =
    `You scored ${quizScore} out of ${questions.length}!`;
  $("quizOptions").replaceChildren();

  $("quizFeedback").textContent =
    percent >= 80
      ? "Excellent work! You understand the pixel basics."
      : percent >= 50
        ? "Good effort! Review the lesson and try again."
        : "Keep exploring the lab, then try the quiz again.";

  $("quizFeedback").style.color = "#245a9f";
  $("nextQuestion").disabled = true;
  $("nextQuestion").textContent = "Quiz completed";
}

$("restartQuiz").addEventListener("click", () => {
  quizIndex = 0;
  quizScore = 0;
  answeredQuestions = 0;
  renderQuestion();
});

// ----------------------------------------------------------
// RESIZE HISTOGRAM FOR RESPONSIVE LAYOUTS
// ----------------------------------------------------------

let resizeFrame = null;

window.addEventListener("resize", () => {
  if (resizeFrame) cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    if (sourceData) drawHistogram();
  });
});

// ----------------------------------------------------------
// INITIALIZE APPLICATION
// ----------------------------------------------------------

selectSample("garden");
updateMixer();
renderQuestion();


/* ==========================================================
   PIXEL EXPLORER ADVANCED UPGRADES
   1. Interactive RGB cube
   2. Pixel memory comparison
   3. Predict the pixel challenge
   ========================================================== */

// ----------------------------------------------------------
// 1. INTERACTIVE RGB CUBE
// ----------------------------------------------------------

const cubeCanvas = $("rgbCube");
const cubeCtx = cubeCanvas.getContext("2d");

const cubeSliders = {
  r: $("cubeR"),
  g: $("cubeG"),
  b: $("cubeB")
};

function drawRGBCube() {
  const ctx = cubeCtx;
  const w = cubeCanvas.width;
  const h = cubeCanvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#f5f8fd";
  ctx.fillRect(0, 0, w, h);

  // Isometric cube coordinates: R, G and B each range 0–255.
  const origin = { x: 245, y: 275 };
  const scale = 0.62;

  function project(r, g, b) {
    return {
      x: origin.x + (r - g) * scale,
      y: origin.y - b * scale - (r + g) * scale * 0.42
    };
  }

  function polygon(points, fill, stroke = "#8796aa") {
    ctx.beginPath();
    points.forEach((p, i) => {
      const v = project(p[0], p[1], p[2]);
      if (i === 0) ctx.moveTo(v.x, v.y);
      else ctx.lineTo(v.x, v.y);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Three visible faces of the RGB cube.
  polygon([
    [0, 0, 0], [255, 0, 0],
    [255, 0, 255], [0, 0, 255]
  ], "rgba(224, 70, 78, 0.16)");

  polygon([
    [0, 0, 0], [0, 255, 0],
    [0, 255, 255], [0, 0, 255]
  ], "rgba(48, 112, 218, 0.16)");

  polygon([
    [0, 0, 255], [255, 0, 255],
    [255, 255, 255], [0, 255, 255]
  ], "rgba(68, 174, 104, 0.16)");

  // Cube wireframe edges.
  const edges = [
    [[0,0,0],[255,0,0]],
    [[0,0,0],[0,255,0]],
    [[0,0,0],[0,0,255]],
    [[255,0,0],[255,255,0]],
    [[255,0,0],[255,0,255]],
    [[0,255,0],[255,255,0]],
    [[0,255,0],[0,255,255]],
    [[0,0,255],[255,0,255]],
    [[0,0,255],[0,255,255]],
    [[255,255,0],[255,255,255]],
    [[255,0,255],[255,255,255]],
    [[0,255,255],[255,255,255]]
  ];

  ctx.strokeStyle = "#7c8da4";
  ctx.lineWidth = 1.5;

  edges.forEach(edge => {
    const a = project(...edge[0]);
    const b = project(...edge[1]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  });

  // Draw the selected RGB coordinate.
  const r = Number(cubeSliders.r.value);
  const g = Number(cubeSliders.g.value);
  const b = Number(cubeSliders.b.value);
  const point = project(r, g, b);

  // Guide from the origin to the selected point.
  ctx.save();
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = "#566579";
  ctx.beginPath();
  const zero = project(0, 0, 0);
  ctx.moveTo(zero.x, zero.y);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = rgbString(r, g, b);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  // Axis labels.
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#cf3039";
  const redEnd = project(255, 0, 0);
  ctx.fillText("R", redEnd.x + 13, redEnd.y + 15);

  ctx.fillStyle = "#218447";
  const greenEnd = project(0, 255, 0);
  ctx.fillText("G", greenEnd.x - 13, greenEnd.y + 15);

  ctx.fillStyle = "#285fc0";
  const blueEnd = project(0, 0, 255);
  ctx.fillText("B", blueEnd.x - 3, blueEnd.y - 12);

  ctx.font = "12px Arial";
  ctx.fillStyle = "#65758b";
  ctx.fillText("0", zero.x - 12, zero.y + 14);
  ctx.textAlign = "left";
  ctx.fillText("255", redEnd.x + 5, redEnd.y + 32);
  ctx.fillText("255", greenEnd.x - 29, greenEnd.y + 32);
  ctx.fillText("255", blueEnd.x + 7, blueEnd.y - 2);

  $("cubeROut").textContent = r;
  $("cubeGOut").textContent = g;
  $("cubeBOut").textContent = b;

  $("cubeSwatch").style.background = rgbString(r, g, b);
  $("cubeHex").textContent = hexColor(r, g, b);
  $("cubeRGB").textContent = `RGB (${r}, ${g}, ${b})`;
}

Object.values(cubeSliders).forEach(slider => {
  slider.addEventListener("input", drawRGBCube);
});

$("cubeSync").addEventListener("click", () => {
  cubeSliders.r.value = sliders.red.value;
  cubeSliders.g.value = sliders.green.value;
  cubeSliders.b.value = sliders.blue.value;
  drawRGBCube();
});

drawRGBCube();


// ----------------------------------------------------------
// 2. MEMORY COMPARISON LAB
// ----------------------------------------------------------

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 ** 2) {
    return `${(bytes / 1024).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    })} KiB`;
  }
  if (bytes < 1024 ** 3) {
    return `${(bytes / (1024 ** 2)).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    })} MiB`;
  }

  return `${(bytes / (1024 ** 3)).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  })} GiB`;
}

function updateMemoryLab() {
  const width = Number($("memoryWidth").value);
  const height = Number($("memoryHeight").value);

  const valid =
    Number.isSafeInteger(width) &&
    Number.isSafeInteger(height) &&
    width >= 1 && height >= 1 &&
    width <= 100000 && height <= 100000 &&
    Number.isSafeInteger(width * height);

  if (!valid) {
    $("grayMemory").textContent = "Enter valid dimensions";
    $("rgbMemory").textContent = "Enter valid dimensions";
    $("grayBar").style.width = "0%";
    $("rgbBar").style.width = "0%";
    $("memoryExplanation").textContent =
      "Enter positive whole-number dimensions within the allowed range.";
    return;
  }

  const pixels = width * height;
  const grayBytes = pixels;       // 8 bits = 1 byte per pixel
  const rgbBytes = pixels * 3;    // 24 bits = 3 bytes per pixel

  $("grayMemory").textContent = formatBytes(grayBytes);
  $("rgbMemory").textContent = formatBytes(rgbBytes);

  // Use a relative bar scale that keeps both bars visible.
  $("grayBar").style.width = "33.333%";
  $("rgbBar").style.width = "100%";

  $("memoryExplanation").textContent =
    `${width.toLocaleString()} × ${height.toLocaleString()} = ` +
    `${pixels.toLocaleString()} pixels. ` +
    `Grayscale: ${pixels.toLocaleString()} bytes. ` +
    `RGB: ${(pixels * 3).toLocaleString()} bytes. ` +
    `RGB uses 3 times the pixel-data memory of grayscale.`;
}

$("memoryWidth").addEventListener("input", updateMemoryLab);
$("memoryHeight").addEventListener("input", updateMemoryLab);

$("useCurrentDimensions").addEventListener("click", () => {
  if (!sourceData) return;

  $("memoryWidth").value = sourceData.width;
  $("memoryHeight").value = sourceData.height;
  updateMemoryLab();
});

updateMemoryLab();


// ----------------------------------------------------------
// 3. PREDICT THE PIXEL CHALLENGE
// ----------------------------------------------------------

const predictionChallenges = [
  {
    rgb: [255, 0, 0],
    answer: "Red",
    options: ["Red", "Blue", "Green", "White"],
    explanation: "Red is 255; green and blue are zero."
  },
  {
    rgb: [255, 255, 0],
    answer: "Yellow",
    options: ["Purple", "Yellow", "Cyan", "Black"],
    explanation: "Red and green at 255 with blue at 0 produce yellow."
  },
  {
    rgb: [0, 255, 255],
    answer: "Cyan",
    options: ["Orange", "Cyan", "Red", "Gray"],
    explanation: "Green and blue at 255 with red at 0 produce cyan."
  },
  {
    rgb: [255, 0, 255],
    answer: "Magenta",
    options: ["Green", "Yellow", "Magenta", "Cyan"],
    explanation: "Red and blue at 255 with green at 0 produce magenta."
  },
  {
    rgb: [255, 255, 255],
    answer: "White",
    options: ["Black", "White", "Red", "Blue"],
    explanation: "All three channels at maximum intensity produce white."
  },
  {
    rgb: [0, 0, 0],
    answer: "Black",
    options: ["White", "Green", "Black", "Yellow"],
    explanation: "All three channels at zero intensity produce black."
  },
  {
    rgb: [0, 255, 0],
    answer: "Green",
    options: ["Red", "Green", "Blue", "Magenta"],
    explanation: "Only the green channel has maximum intensity."
  },
  {
    rgb: [0, 0, 255],
    answer: "Blue",
    options: ["Cyan", "Yellow", "Blue", "Green"],
    explanation: "Only the blue channel has maximum intensity."
  }
];

let predictionIndex = 0;
let predictionScore = 0;
let predictionAnswered = 0;
let predictionRevealed = false;

function renderPrediction() {
  predictionRevealed = false;

  const q = predictionChallenges[predictionIndex];
  const [r, g, b] = q.rgb;

  $("predictR").textContent = r;
  $("predictG").textContent = g;
  $("predictB").textContent = b;

  $("predictSwatch").style.background =
    "repeating-linear-gradient(45deg,#edf1f6,#edf1f6 10px,#e1e7ef 10px,#e1e7ef 20px)";

  $("predictQuestion").textContent = "What color do these RGB values produce?";
  $("predictFeedback").textContent = "";
  $("revealPredict").disabled = false;
  $("nextPredict").textContent =
    predictionIndex === predictionChallenges.length - 1
      ? "Finish challenge →"
      : "Next challenge →";

  const options = $("predictOptions");
  options.replaceChildren();

  q.options.forEach(option => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "predict-option";
    button.textContent = option;

    button.addEventListener("click", () => {
      if (predictionAnswered === predictionIndex + 1) return;

      predictionAnswered = predictionIndex + 1;
      predictionRevealed = true;

      const correct = option === q.answer;
      if (correct) predictionScore++;

      [...options.children].forEach(item => {
        item.disabled = true;
        if (item.textContent === q.answer) {
          item.classList.add("correct");
        } else if (item.textContent === option && !correct) {
          item.classList.add("incorrect");
        }
      });

      showPredictionAnswer(q, correct);
      updatePredictionScore();
    });

    options.appendChild(button);
  });
}

function showPredictionAnswer(q, answeredCorrectly) {
  const [r, g, b] = q.rgb;

  $("predictSwatch").style.background = rgbString(r, g, b);
  $("predictQuestion").textContent = `Answer: ${q.answer}`;
  $("predictFeedback").textContent =
    (answeredCorrectly ? "Correct! " : "Let's learn! ") + q.explanation;
  $("predictFeedback").style.color =
    answeredCorrectly ? "#227b3f" : "#245a9f";

  $("revealPredict").disabled = true;
}

$("revealPredict").addEventListener("click", () => {
  if (predictionRevealed) return;

  const q = predictionChallenges[predictionIndex];
  predictionRevealed = true;
  showPredictionAnswer(q, false);

  [...$("predictOptions").children].forEach(button => {
    button.disabled = true;
    if (button.textContent === q.answer) {
      button.classList.add("correct");
    }
  });

  $("predictFeedback").textContent =
    `The answer is ${q.answer}. ${q.explanation}`;
});

$("nextPredict").addEventListener("click", () => {
  if (predictionIndex < predictionChallenges.length - 1) {
    predictionIndex++;
    renderPrediction();
  } else {
    $("predictQuestion").textContent =
      `Challenge complete: ${predictionScore} / ${predictionChallenges.length}`;
    $("predictOptions").replaceChildren();
    $("predictSwatch").style.background = "#eaf2ff";
    $("predictFeedback").textContent =
      "Great work! Press Restart to try the challenges again.";
    $("predictFeedback").style.color = "#245a9f";

    $("nextPredict").textContent = "Restart challenge";
    $("nextPredict").onclick = () => {
      predictionIndex = 0;
      predictionScore = 0;
      predictionAnswered = 0;
      $("nextPredict").onclick = null;
      updatePredictionScore();
      renderPrediction();
    };
  }
});

function updatePredictionScore() {
  $("predictScore").textContent =
    `Score: ${predictionScore} / ${predictionAnswered}`;
}

renderPrediction();
