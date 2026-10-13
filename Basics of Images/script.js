
const $ = id => document.getElementById(id);

const lessons = {
  image: {
    number: "01 / 04",
    title: "Basics of Images",
    intro: "A digital image is represented by rows and columns of tiny picture elements called pixels.",
    heading: "Think of an image as a grid",
    theory: "Each pixel stores colour or brightness information. Together, pixels form the picture that you see.",
    fact: "A digital image can be represented as a grid of pixels.",
    experiment: "Explore a real image"
  },
  pixels: {
    number: "02 / 04",
    title: "Basics of Pixels",
    intro: "Pixel is short for picture element. It is a small unit of a digital image.",
    heading: "Zoom in to explore pixels",
    theory: "Each pixel stores a colour or brightness value. This lab samples your photograph into a grid so you can inspect the colours in different regions.",
    fact: "Each square in this experiment represents a sampled region, not necessarily one original pixel.",
    experiment: "Inspect pixel colours"
  },
  resolution: {
    number: "03 / 04",
    title: "Image Resolution",
    intro: "Resolution describes an image's dimensions in pixels: width multiplied by height.",
    heading: "Resolution = width × height",
    theory: "An image measuring 100 × 100 pixels contains 10,000 pixels. A 1920 × 1080 image contains 2,073,600 pixels, or about 2.07 megapixels.",
    fact: "More pixels can preserve finer detail, but do not automatically guarantee better image quality.",
    experiment: "Compare resolution"
  },
  values: {
    number: "04 / 04",
    title: "Pixel Values and Bits",
    intro: "Colour images often use red, green and blue (RGB) values to represent colours.",
    heading: "How does a computer store colour?",
    theory: "In a common 8-bit RGB image, each channel can have a value from 0 to 255. The three channels combine to represent millions of possible colours.",
    fact: "Eight bits provide 2⁸ = 256 possible values for each channel.",
    experiment: "Mix your own RGB colour"
  }
};

const topicNames = Object.keys(lessons);
const labs = {
  image: $("imageLab"),
  pixels: $("pixelLab"),
  resolution: $("resolutionLab"),
  values: $("valuesLab")
};

let currentTopic = "image";
let currentImageURL = null;

function openTopic(topic) {
  currentTopic = topic;
  const lesson = lessons[topic];

  document.querySelectorAll(".topic-card").forEach(button => {
    button.classList.toggle("active", button.dataset.topic === topic);
  });

  $("lessonNumber").textContent = lesson.number;
  $("lessonTitle").textContent = lesson.title;
  $("lessonIntro").textContent = lesson.intro;
  $("theoryHeading").textContent = lesson.heading;
  $("theoryText").textContent = lesson.theory;
  $("factText").innerHTML = "<b>Remember:</b> " + lesson.fact;
  $("experimentTitle").textContent = lesson.experiment;

  Object.entries(labs).forEach(([name, element]) => {
    element.classList.toggle("hidden", name !== topic);
  });

  const index = topicNames.indexOf(topic);
  $("previousTopic").disabled = index === 0;
  $("nextTopic").textContent =
    index === topicNames.length - 1 ? "Back to images ↻" : "Next topic →";

  if (topic === "pixels") makePixelGrid();
  if (topic === "resolution") updateResolution();
}

document.querySelectorAll(".topic-card").forEach(button => {
  button.addEventListener("click", () => openTopic(button.dataset.topic));
});

$("previousTopic").addEventListener("click", () => {
  const index = topicNames.indexOf(currentTopic);
  if (index > 0) openTopic(topicNames[index - 1]);
});

$("nextTopic").addEventListener("click", () => {
  const index = topicNames.indexOf(currentTopic);
  openTopic(topicNames[(index + 1) % topicNames.length]);
});

// Load a real photo supplied in the images folder or by the student.
const sampleImage = $("sampleImage");

function refreshImageLabs() {
  if (!sampleImage.complete || !sampleImage.naturalWidth) return;
  makePixelGrid();
  updateResolution();
}

sampleImage.addEventListener("load", refreshImageLabs);

sampleImage.addEventListener("error", () => {
  $("imageMessage").textContent =
    "Image not found. Add images/tree.jpg beside your HTML file, or upload a photograph below.";
  $("selectedPixelInfo").textContent = "Please upload a photograph.";
});

sampleImage.addEventListener("click", () => {
  $("imageMessage").textContent =
    "This real photograph is represented digitally by pixels. Open Basics of Pixels to inspect sampled colours, or Image Resolution to compare pixel dimensions.";
});

$("photoUpload").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    $("imageMessage").textContent = "Please choose a valid image file.";
    return;
  }

  if (file.size > 15 * 1024 * 1024) {
    $("imageMessage").textContent = "Please choose an image smaller than 15 MB.";
    event.target.value = "";
    return;
  }

  if (currentImageURL) URL.revokeObjectURL(currentImageURL);
  currentImageURL = URL.createObjectURL(file);

  sampleImage.onload = () => {
    $("imageMessage").textContent =
      "Your photograph is ready! Explore its sampled pixel colours and resolution.";
    refreshImageLabs();
  };

  sampleImage.onerror = () => {
    $("imageMessage").textContent = "This image could not be opened. Please try another image.";
  };

  sampleImage.src = currentImageURL;
});

// Sample the real image into a grid and report actual RGB values
// for the centre-cropped regions shown in this learning experiment.
const zoomRange = $("zoomRange");
const pixelGrid = $("pixelGrid");

function rgbToHex(r, g, b) {
  return "#" + [r, g, b]
    .map(value => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function makePixelGrid() {
  if (!sampleImage.complete || !sampleImage.naturalWidth) {
    $("selectedPixelInfo").textContent =
      "Upload a photograph or add images/tree.jpg.";
    return;
  }

  const n = Number(zoomRange.value);
  pixelGrid.innerHTML = "";
  pixelGrid.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
  pixelGrid.style.gridTemplateRows = `repeat(${n}, 1fr)`;
  $("zoomLabel").textContent = `${n} × ${n}`;

  const canvas = document.createElement("canvas");
  canvas.width = n;
  canvas.height = n;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  const width = sampleImage.naturalWidth;
  const height = sampleImage.naturalHeight;

  // Crop to a square, then sample it into n × n regions.
  const side = Math.min(width, height);
  const sx = (width - side) / 2;
  const sy = (height - side) / 2;

  context.drawImage(sampleImage, sx, sy, side, side, 0, 0, n, n);

  const data = context.getImageData(0, 0, n, n).data;

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const i = (y * n + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const colour = `rgb(${r}, ${g}, ${b})`;

      const square = document.createElement("button");
      square.type = "button";
      square.className = "pixel";
      square.style.background = colour;
      square.setAttribute("aria-label", `Row ${y + 1}, column ${x + 1}`);

      square.addEventListener("click", () => {
        $("selectedSwatch").style.background = colour;
        $("selectedPixelTitle").textContent =
          `Pixel sample: row ${y + 1}, column ${x + 1}`;
        $("selectedPixelInfo").textContent =
          `RGB (${r}, ${g}, ${b}) · Hex ${rgbToHex(r, g, b)}`;
      });

      pixelGrid.appendChild(square);
    }
  }

  const firstSquare = pixelGrid.querySelector("button");
  if (firstSquare) firstSquare.click();
}

zoomRange.addEventListener("input", makePixelGrid);

// Resolution experiment: resample the current photo to different dimensions.
const resolutions = [
  { w: 16, name: "Very low detail", explanation: "A small grid has fewer samples, so fine details can disappear." },
  { w: 32, name: "Low detail", explanation: "This grid contains more samples, but details may still look blocky." },
  { w: 64, name: "Medium detail", explanation: "This grid provides more samples to represent image details." },
  { w: 128, name: "High detail", explanation: "More samples can preserve finer details that exist in the source photo." },
  { w: 256, name: "Very high detail", explanation: "This grid contains many samples. The source photo still limits the detail available." }
];

function updateResolution() {
  const level = Number($("resolutionRange").value) - 1;
  const resolution = resolutions[level];
  const w = resolution.w;
  const total = w * w;
  const canvas = $("lowPreview");
  const context = canvas.getContext("2d");

  $("resolutionLabel").textContent = `${w} × ${w}`;
  $("resolutionName").textContent = resolution.name;
  $("resolutionDimensions").textContent = `${w} × ${w} pixels`;
  $("pixelCount").textContent = total.toLocaleString("en-US");
  $("megapixels").textContent = (total / 1000000).toFixed(4) + " MP";
  $("resolutionExplain").textContent = resolution.explanation;

  canvas.width = w;
  canvas.height = w;
  context.imageSmoothingEnabled = level >= 2;

  if (sampleImage.complete && sampleImage.naturalWidth) {
    const width = sampleImage.naturalWidth;
    const height = sampleImage.naturalHeight;
    const side = Math.min(width, height);

    context.drawImage(
      sampleImage,
      (width - side) / 2,
      (height - side) / 2,
      side,
      side,
      0,
      0,
      w,
      w
    );
  } else {
    context.fillStyle = "#e5edf8";
    context.fillRect(0, 0, w, w);
  }
}

$("resolutionRange").addEventListener("input", updateResolution);

// RGB colour experiment
function updateRGB() {
  const r = Number($("redRange").value);
  const g = Number($("greenRange").value);
  const b = Number($("blueRange").value);

  $("redValue").textContent = r;
  $("greenValue").textContent = g;
  $("blueValue").textContent = b;
  $("rgbPreview").style.background = `rgb(${r}, ${g}, ${b})`;
  $("rgbValue").textContent = `${r}, ${g}, ${b}`;
}

["redRange", "greenRange", "blueRange"].forEach(id => {
  $(id).addEventListener("input", updateRGB);
});

// Short quiz
const questions = [
  {
    question: "What is a pixel?",
    options: ["A type of computer", "A tiny picture element", "A file folder"],
    answer: 1,
    explanation: "Correct! A pixel is a picture element in a digital image."
  },
  {
    question: "How many pixels are in a 100 × 100 image?",
    options: ["200", "1,000", "10,000"],
    answer: 2,
    explanation: "Correct! 100 × 100 = 10,000 pixels."
  },
  {
    question: "What values can a typical 8-bit channel store?",
    options: ["0 to 15", "0 to 255", "1 to 100"],
    answer: 1,
    explanation: "Correct! An 8-bit channel has 256 possible values: 0 through 255."
  },
  {
    question: "What does image resolution describe?",
    options: ["Only the filename", "Pixel dimensions", "The camera brand"],
    answer: 1,
    explanation: "Correct! Image resolution describes the image's pixel dimensions."
  }
];

let questionIndex = 0;
let answered = false;

function showQuestion() {
  answered = false;
  const question = questions[questionIndex];
  $("quizQuestion").textContent = question.question;
  $("quizFeedback").textContent = "Choose an answer to check your understanding.";

  const options = $("quizOptions");
  options.innerHTML = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.textContent = option;

    button.addEventListener("click", () => {
      if (answered) return;
      answered = true;

      const correct = index === question.answer;
      button.classList.add(correct ? "correct" : "incorrect");

      if (correct) {
        $("quizFeedback").textContent = question.explanation;
      } else {
        $("quizFeedback").textContent =
          "Not quite. " + question.explanation;
      }

      [...options.children].forEach((item, i) => {
        item.disabled = true;
        if (i === question.answer) item.classList.add("correct");
      });
    });

    options.appendChild(button);
  });
}

$("nextQuestion").addEventListener("click", () => {
  questionIndex = (questionIndex + 1) % questions.length;
  showQuestion();
});

// Start the app
openTopic("image");
updateRGB();
showQuestion();

if (sampleImage.complete && sampleImage.naturalWidth) {
  refreshImageLabs();
}
