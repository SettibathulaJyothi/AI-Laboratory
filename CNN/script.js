
"use strict";

const $ = id => document.getElementById(id);

// ---------------- NAVIGATION ----------------

function go(page) {
  document.querySelectorAll(".page").forEach(section => {
    section.classList.toggle("active", section.id === page);
  });

  document.querySelectorAll("nav button").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  if (page === "relu") drawReluGraph();
  if (page === "cnn") drawStage();
}

document.querySelectorAll("nav button").forEach(button => {
  button.addEventListener("click", () => go(button.dataset.page));
});

// ---------------- CONVOLUTION ----------------

const presets = {
  edge: {
    values: [0, -1, 0, -1, 4, -1, 0, -1, 0],
    text: "This Laplacian-style kernel responds to intensity changes in multiple directions."
  },
  sharpen: {
    values: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    text: "Sharpening emphasizes the center relative to neighboring pixels."
  },
  blur: {
    values: Array(9).fill(1 / 9),
    text: "This averaging kernel smooths local differences and can blur fine details."
  }
};

let imageReady = false;

const original = $("original");
const filtered = $("filtered");

const octx = original.getContext("2d", {
  willReadFrequently: true
});

const fctx = filtered.getContext("2d", {
  willReadFrequently: true
});

function createKernelGrid(values) {
  const grid = $("kernelGrid");
  grid.innerHTML = "";

  values.forEach((value, index) => {
    const input = document.createElement("input");

    input.type = "number";
    input.step = "any";
    input.value = Number(value.toFixed(3));
    input.setAttribute("aria-label", "Kernel value " + (index + 1));

    input.addEventListener("input", () => {
      $("kernelPreset").value = "custom";
      $("kernelExplanation").textContent =
        "Change the nine values to design your own filter.";
    });

    grid.appendChild(input);
  });
}

function kernelValues() {
  return [...$("kernelGrid").querySelectorAll("input")]
    .map(input => {
      const value = Number(input.value);
      return Number.isFinite(value) ? value : 0;
    });
}

function chooseKernel() {
  const key = $("kernelPreset").value;

  if (presets[key]) {
    createKernelGrid(presets[key].values);
    $("kernelExplanation").textContent = presets[key].text;
  } else {
    $("kernelExplanation").textContent =
      "Change the nine values to design your own filter.";
  }

  applyConvolution();
}

function resetKernel() {
  $("kernelPreset").value = "edge";
  chooseKernel();
}

$("kernelPreset").addEventListener("change", chooseKernel);
$("applyKernel").addEventListener("click", applyConvolution);
$("resetKernel").addEventListener("click", resetKernel);

// Create a sample image without needing an internet connection.

function drawPlaceholder() {
  const w = original.width;
  const h = original.height;

  const gradient = octx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, "#e7eaf0");
  gradient.addColorStop(1, "#a8b0c1");

  octx.fillStyle = gradient;
  octx.fillRect(0, 0, w, h);

  octx.fillStyle = "#f7f7fa";
  octx.beginPath();
  octx.arc(250, 40, 24, 0, Math.PI * 2);
  octx.fill();

  const buildings = [
    [8, 110, 45, 130],
    [52, 75, 52, 165],
    [107, 100, 37, 140],
    [148, 50, 60, 190],
    [213, 85, 38, 155],
    [258, 118, 52, 122]
  ];

  buildings.forEach(([x, y, bw, bh], i) => {
    octx.fillStyle = ["#555e72", "#717b8e", "#414b60"][i % 3];
    octx.fillRect(x, y, bw, bh);

    octx.fillStyle = "#d7dce7";

    for (let wx = x + 7; wx < x + bw - 5; wx += 13) {
      for (let wy = y + 9; wy < y + bh - 6; wy += 17) {
        octx.fillRect(wx, wy, 5, 7);
      }
    }
  });

  octx.fillStyle = "#394359";
  octx.fillRect(0, 224, w, 16);

  imageReady = true;
  applyConvolution();
  drawStage();
}

// Load an optional real sample photograph.

$("loadSample").addEventListener("click", () => {
  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = () => {
    octx.clearRect(0, 0, original.width, original.height);
    octx.drawImage(img, 0, 0, original.width, original.height);

    imageReady = true;
    applyConvolution();
    drawStage();
  };

  img.onerror = () => {
    alert(
      "The sample photo could not load. Please upload an image from your computer."
    );
  };

  img.src =
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=320&h=240&q=80";
});

// Upload a photograph from the computer.

$("imageUpload").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please choose an image file.");
    return;
  }

  const url = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    octx.clearRect(0, 0, original.width, original.height);
    octx.drawImage(img, 0, 0, original.width, original.height);

    URL.revokeObjectURL(url);

    imageReady = true;
    applyConvolution();
    drawStage();
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
    alert("Unable to open this image. Please try another image.");
  };

  img.src = url;
});

function applyConvolution() {
  if (!imageReady) return;

  const w = original.width;
  const h = original.height;

  const data = octx.getImageData(0, 0, w, h).data;
  const gray = new Float32Array(w * h);

  for (let i = 0; i < w * h; i++) {
    gray[i] =
      0.299 * data[i * 4] +
      0.587 * data[i * 4 + 1] +
      0.114 * data[i * 4 + 2];
  }

  const kernel = kernelValues();
  const output = fctx.createImageData(w, h);

  const centerX = Math.floor(w / 2);
  const centerY = Math.floor(h / 2);

  let centerSum = 0;
  const centerParts = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;

      for (let ky = 0; ky < 3; ky++) {
        for (let kx = 0; kx < 3; kx++) {
          const px = Math.max(0, Math.min(w - 1, x + kx - 1));
          const py = Math.max(0, Math.min(h - 1, y + ky - 1));

          const pixel = gray[py * w + px];
          const weight = kernel[ky * 3 + kx];

          sum += pixel * weight;

          if (x === centerX && y === centerY) {
            centerParts.push(
              `${pixel.toFixed(0)} × ${weight.toFixed(2)}`
            );
          }
        }
      }

      if (x === centerX && y === centerY) {
        centerSum = sum;
      }

      const value = Math.max(0, Math.min(255, Math.round(sum)));
      const index = (y * w + x) * 4;

      output.data[index] = value;
      output.data[index + 1] = value;
      output.data[index + 2] = value;
      output.data[index + 3] = 255;
    }
  }

  fctx.putImageData(output, 0, 0);

  $("mathResult").textContent = centerSum.toFixed(2);

  $("mathDetails").textContent =
    "At the center pixel: " +
    centerParts.join(" + ") +
    " = " +
    centerSum.toFixed(2) +
    ". The displayed value is clipped to 0–255.";

  $("convResult").textContent =
    `Applied a 3 × 3 kernel to ${w} × ${h} pixels. ` +
    "The output shows the filter response.";

  drawStage();
}

// ---------------- RELU ----------------

function relu(x) {
  return Math.max(0, x);
}

function calculateRelu() {
  const x = Number($("reluInput").value);

  if ($("reluInput").value.trim() === "" || !Number.isFinite(x)) {
    $("reluExplanation").textContent = "Please enter a valid number.";
    return;
  }

  const result = relu(x);
  $("reluResult").textContent = result;

  if (x < 0) {
    $("reluExplanation").textContent =
      "The input is negative, so ReLU outputs zero.";
  } else if (x > 0) {
    $("reluExplanation").textContent =
      "The input is positive, so ReLU keeps the value unchanged.";
  } else {
    $("reluExplanation").textContent =
      "The input is zero, so the output is also zero.";
  }
}

$("calculateRelu").addEventListener("click", calculateRelu);

$("reluInput").addEventListener("keydown", event => {
  if (event.key === "Enter") calculateRelu();
});

$("reluSlider").addEventListener("input", () => {
  const x = Number($("reluSlider").value);

  $("sliderValue").textContent = x;
  $("sliderOutput").textContent = relu(x);
});

function drawReluGraph() {
  const canvas = $("reluGraph");
  const ctx = canvas.getContext("2d");

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  const X = x => w / 2 + x * 11;
  const Y = y => h - 28 - y * 13;

  ctx.strokeStyle = "#a9afc4";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(10, Y(0));
  ctx.lineTo(w - 8, Y(0));
  ctx.moveTo(X(0), 10);
  ctx.lineTo(X(0), h - 15);
  ctx.stroke();

  ctx.fillStyle = "#777d93";
  ctx.font = "11px Arial";
  ctx.fillText("0", X(0) + 5, Y(0) - 5);
  ctx.fillText("Input", w - 40, Y(0) - 8);
  ctx.fillText("Output", X(0) + 6, 14);

  ctx.strokeStyle = "#7158e8";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(X(-10), Y(0));
  ctx.lineTo(X(0), Y(0));
  ctx.lineTo(X(10), Y(10));
  ctx.stroke();
}

// ---------------- POOLING ----------------

let poolValues = [
  1, 3, 2, 4,
  5, 6, 1, 2,
  7, 2, 9, 4,
  3, 8, 2, 6
];

function renderPool() {
  const input = $("poolInput");
  const activeElement = document.activeElement;
  const activeIndex = [...input.children].indexOf(activeElement);
  const cursorPosition =
    activeElement && activeElement.selectionStart !== null
      ? activeElement.selectionStart
      : null;

  input.innerHTML = "";

  poolValues.forEach((value, index) => {
    const el = document.createElement("input");

    el.type = "number";
    el.step = "any";
    el.value = value;
    el.setAttribute("aria-label", "Feature map value " + (index + 1));

    el.addEventListener("input", () => {
      const number = Number(el.value);
      poolValues[index] = Number.isFinite(number) ? number : 0;

      // Update only the output while typing.
      renderPoolOutput();
    });

    input.appendChild(el);
  });

  if (activeIndex >= 0 && input.children[activeIndex]) {
    input.children[activeIndex].focus();

    if (cursorPosition !== null) {
      try {
        input.children[activeIndex].setSelectionRange(
          cursorPosition,
          cursorPosition
        );
      } catch (error) {
        // Some number inputs do not support cursor positioning.
      }
    }
  }

  renderPoolOutput();
}

function renderPoolOutput() {
  const method = $("poolMethod").value;
  const results = [];

  for (let y = 0; y < 4; y += 2) {
    for (let x = 0; x < 4; x += 2) {
      const values = [
        poolValues[y * 4 + x],
        poolValues[y * 4 + x + 1],
        poolValues[(y + 1) * 4 + x],
        poolValues[(y + 1) * 4 + x + 1]
      ];

      const result = method === "max"
        ? Math.max(...values)
        : values.reduce((a, b) => a + b, 0) / 4;

      results.push({ values, result });
    }
  }

  const output = $("poolOutput");
  output.innerHTML = "";

  results.forEach(item => {
    const cell = document.createElement("div");

    cell.style.cssText =
      "padding:24px 4px;text-align:center;border-radius:10px;" +
      "background:#e6e2ff;font-size:22px;font-weight:800;" +
      "color:#5142aa;overflow-wrap:anywhere";

    cell.textContent = Number(item.result.toFixed(2));
    output.appendChild(cell);
  });

  const first = results[0].values;
  const firstResult = results[0].result;

  if (method === "max") {
    $("poolExplain").textContent =
      "Each region keeps its largest value. The first window outputs " +
      firstResult + ".";
    $("poolMath").textContent =
      `First window: max(${first.join(", ")}) = ${firstResult}`;
  } else {
    $("poolExplain").textContent =
      "Each region averages its four values. The first window outputs " +
      firstResult.toFixed(2) + ".";
    $("poolMath").textContent =
      `First window: (${first.join(" + ")}) ÷ 4 = ` +
      firstResult.toFixed(2);
  }
}

function randomPool() {
  poolValues = Array.from(
    { length: 16 },
    () => Math.floor(Math.random() * 20)
  );

  renderPool();
}

function resetPool() {
  poolValues = [
    1, 3, 2, 4,
    5, 6, 1, 2,
    7, 2, 9, 4,
    3, 8, 2, 6
  ];

  renderPool();
}

$("poolMethod").addEventListener("change", renderPoolOutput);
$("randomPool").addEventListener("click", randomPool);
$("resetPool").addEventListener("click", resetPool);

// ---------------- CNN JOURNEY ----------------

const stages = [
  [
    "Stage 1: Input image",
    "The CNN receives an image represented by numerical pixel values.",
    "Color images commonly contain red, green, and blue channels."
  ],
  [
    "Stage 2: Convolution",
    "A filter examines local regions and produces a feature map.",
    "Early filters may learn to detect edges and simple patterns."
  ],
  [
    "Stage 3: ReLU",
    "ReLU replaces negative feature-map values with zero.",
    "It introduces non-linearity, allowing the network to learn more complex functions."
  ],
  [
    "Stage 4: Pooling",
    "Pooling summarizes local regions, often reducing spatial dimensions.",
    "Max pooling keeps the maximum; average pooling calculates a mean."
  ],
  [
    "Stage 5: Classification",
    "A trained classification head uses learned features to calculate class scores.",
    "This demo does not run a trained classifier."
  ]
];

let stage = 0;

function drawStage() {
  if (!imageReady) return;

  const canvas = $("stageCanvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (stage === 0) {
    ctx.drawImage(original, 0, 0);
  } else if (stage === 1 || stage === 2) {
    const src = fctx.getImageData(
      0, 0, filtered.width, filtered.height
    );

    if (stage === 2) {
      for (let i = 0; i < src.data.length; i += 4) {
        const value = Math.max(0, src.data[i]);

        src.data[i] = value;
        src.data[i + 1] = value;
        src.data[i + 2] = value;
      }
    }

    ctx.putImageData(src, 0, 0);
  } else if (stage === 3) {
    const src = fctx.getImageData(
      0, 0, filtered.width, filtered.height
    );

    ctx.fillStyle = "#eee";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Illustrate a smaller spatial representation.
    const cellSize = 4;

    for (let y = 0; y < canvas.height; y += cellSize) {
      for (let x = 0; x < canvas.width; x += cellSize) {
        const index = (y * canvas.width + x) * 4;
        const value = src.data[index];

        ctx.fillStyle = `rgb(${value},${value},${value})`;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  } else {
    ctx.fillStyle = "#f1efff";
    ctx.fillRect(0, 0, 320, 240);

    ctx.fillStyle = "#5144a7";
    ctx.font = "bold 17px Arial";
    ctx.fillText("Illustrative class scores", 20, 35);

    const bars = [
      ["Class A", 0.82],
      ["Class B", 0.48],
      ["Class C", 0.21]
    ];

    bars.forEach(([label, value], index) => {
      const y = 70 + index * 52;

      ctx.fillStyle = "#62677c";
      ctx.font = "12px Arial";
      ctx.fillText(label, 20, y);

      ctx.fillStyle = "#dcd8fa";
      ctx.fillRect(95, y - 13, 190, 18);

      ctx.fillStyle = "#7158e8";
      ctx.fillRect(95, y - 13, 190 * value, 18);

      ctx.fillStyle = "#35305e";
      ctx.fillText(Math.round(value * 100) + "%", 292, y);
    });

    ctx.fillStyle = "#777";
    ctx.font = "11px Arial";
    ctx.fillText("Illustration only — not model predictions", 15, 224);
  }

  $("stageTitle").textContent = stages[stage][0];
  $("stageDescription").textContent = stages[stage][1];
  $("stageFact").textContent = stages[stage][2];

  $("prevStage").disabled = stage === 0;
  $("nextStage").disabled = stage === stages.length - 1;

  $("nextStage").textContent =
    stage === stages.length - 1
      ? "Journey complete ✓"
      : "Next stage →";
}

function changeStage(delta) {
  stage = Math.max(
    0,
    Math.min(stages.length - 1, stage + delta)
  );

  drawStage();
}

function resetJourney() {
  stage = 0;
  drawStage();
}

$("prevStage").addEventListener("click", () => changeStage(-1));
$("nextStage").addEventListener("click", () => changeStage(1));
$("resetJourney").addEventListener("click", resetJourney);

// ---------------- QUIZ ----------------

const questions = [
  {
    q: "1. What is a kernel in a CNN?",
    a: [
      "A small filter of numbers",
      "A computer keyboard",
      "The final prediction"
    ],
    correct: 0,
    why: "A kernel is a small array of weights used to calculate feature maps."
  },
  {
    q: "2. What does ReLU do to -7?",
    a: ["Returns -7", "Returns 7", "Returns 0"],
    correct: 2,
    why: "ReLU(x) = max(0, x), so negative values become zero."
  },
  {
    q: "3. What does Max Pooling do?",
    a: [
      "Adds every pixel in the image",
      "Keeps the largest value in each region",
      "Turns every value negative"
    ],
    correct: 1,
    why: "Max pooling selects the maximum within each pooling window."
  },
  {
    q: "4. Why use convolution?",
    a: [
      "To detect local patterns and features",
      "To guarantee a correct answer",
      "To make every pixel white"
    ],
    correct: 0,
    why: "Convolution helps learn useful patterns from local image regions."
  },
  {
    q: "5. What does a classification head do?",
    a: [
      "Takes the photograph",
      "Only removes negative pixels",
      "Uses learned features to produce class scores"
    ],
    correct: 2,
    why: "A classification head maps learned features to scores for possible classes."
  },
  {
    q: "6. What is the main purpose of pooling?",
    a: [
      "Increase the original image resolution",
      "Summarize regions and often reduce spatial dimensions",
      "Add more colors to every pixel"
    ],
    correct: 1,
    why: "Pooling reduces spatial dimensions while summarizing local information."
  }
];

function startQuiz() {
  $("quizArea").innerHTML = "";
  $("quizScore").textContent = "Your score: —";
  $("quizFeedback").innerHTML = "";

  questions.forEach((question, index) => {
    const block = document.createElement("div");
    block.className = "quiz-question";

    const title = document.createElement("h3");
    title.textContent = question.q;
    block.appendChild(title);

    question.a.forEach((answer, answerIndex) => {
      const label = document.createElement("label");
      label.className = "quiz-option";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "q" + index;
      radio.value = answerIndex;

      label.append(radio, document.createTextNode(answer));
      block.appendChild(label);
    });

    $("quizArea").appendChild(block);
  });
}

function checkQuiz() {
  let score = 0;
  let answered = 0;

  const explanations = [];

  questions.forEach((question, index) => {
    const selected = document.querySelector(
      `input[name="q${index}"]:checked`
    );

    if (selected) {
      answered++;

      if (Number(selected.value) === question.correct) {
        score++;

        explanations.push(
          `${index + 1}. Correct! ${question.why}`
        );
      } else {
        explanations.push(
          `${index + 1}. Incorrect. Correct answer: ` +
          `${question.a[question.correct]}. ${question.why}`
        );
      }
    } else {
      explanations.push(
        `${index + 1}. Not answered. Correct answer: ` +
        `${question.a[question.correct]}. ${question.why}`
      );
    }
  });

  $("quizScore").textContent =
    `Your score: ${score} / ${questions.length}`;

  const feedback = $("quizFeedback");
  feedback.innerHTML = "";

  if (answered < questions.length) {
    const summary = document.createElement("p");
    summary.textContent =
      `You answered ${answered} of ${questions.length} questions.`;
    feedback.appendChild(summary);
  }

  explanations.forEach(text => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    feedback.appendChild(paragraph);
  });
}

$("checkQuiz").addEventListener("click", checkQuiz);
$("tryQuizAgain").addEventListener("click", startQuiz);

// ---------------- INITIALIZE APPLICATION ----------------

function initializeApp() {
  chooseKernel();
  drawPlaceholder();
  calculateRelu();
  drawReluGraph();
  renderPool();
  startQuiz();
}

initializeApp();
