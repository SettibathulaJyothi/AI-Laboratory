const $ = (id) => document.getElementById(id);

const taskInfo = {
  classification: {
    title: "Classification",
    explanation: "Classification predicts one or more likely labels for the image. The model gives a confidence score for each label, but does not tell us the exact position of an object.",
    tag: "PREDICTED LABELS",
  },
  localisation: {
    title: "Classification + Localisation",
    explanation: "This demo shows real image-classification predictions plus an illustrative box. The box is not predicted by MobileNet; a true localisation model is needed to locate objects accurately.",
    tag: "REAL LABEL + ILLUSTRATIVE BOX",
  },
  detection: {
    title: "Object Detection",
    explanation: "True object detection finds each object and returns its class label and bounding box. This version classifies the whole uploaded image; it does not yet detect each object separately.",
    tag: "IMAGE CLASSIFICATION ONLY",
  },
  segmentation: {
    title: "Instance Segmentation",
    explanation: "True instance segmentation identifies the pixels belonging to each individual object. This version classifies the whole uploaded image; its coloured masks are illustrative, not model predictions.",
    tag: "IMAGE CLASSIFICATION ONLY",
  }
};

const samples = {
  cat: {
    title: "Cat", emoji: "🐈", type: "single",
    description: "A real photograph of a cat.",
    svg: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1000&q=85"
  },
  dog: {
    title: "Dog", emoji: "🐕", type: "single",
    description: "A real photograph of a dog.",
    svg: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=85"
  },
  car: {
    title: "Car", emoji: "🚙", type: "single",
    description: "A real photograph of a car.",
    svg: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=85"
  },
  street: {
    title: "Street scene", emoji: "🏙️", type: "multiple",
    description: "A real photograph of a city street.",
    svg: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1000&q=85"
  },
  animals: {
    title: "Wildlife", emoji: "🐘", type: "multiple",
    description: "A real photograph of wildlife.",
    svg: "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1000&q=85"
  }
};

function sceneSvg(kind) {
  const common = `<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#bce8ff"/><stop offset="1" stop-color="#e9f7ff"/></linearGradient><linearGradient id="grass" x2="0" y2="1"><stop stop-color="#79b86c"/><stop offset="1" stop-color="#39764b"/></linearGradient></defs><rect width="600" height="360" fill="url(#sky)"/>`;
  let body = "";
  if (kind === "cat") body = `<rect y="210" width="600" height="150" fill="url(#grass)"/><circle cx="460" cy="65" r="38" fill="#f9d978"/><ellipse cx="300" cy="250" rx="100" ry="75" fill="#d97735"/><circle cx="300" cy="170" r="77" fill="#ed9b50"/><path d="M238 122 L247 62 L285 111 M316 111 L357 62 L362 130" fill="#ed9b50" stroke="#a94d26" stroke-width="8"/><ellipse cx="271" cy="171" rx="10" ry="17" fill="#263a2d"/><ellipse cx="328" cy="171" rx="10" ry="17" fill="#263a2d"/><path d="M288 198 Q300 209 312 198" fill="none" stroke="#7b3d26" stroke-width="5" stroke-linecap="round"/><path d="M210 245 Q150 235 155 185" fill="none" stroke="#d97735" stroke-width="24" stroke-linecap="round"/>`;
  if (kind === "dog") body = `<rect y="225" width="600" height="135" fill="url(#grass)"/><ellipse cx="300" cy="245" rx="120" ry="70" fill="#b97946"/><circle cx="300" cy="165" r="76" fill="#c98b55"/><ellipse cx="236" cy="159" rx="28" ry="52" fill="#85522f"/><ellipse cx="364" cy="159" rx="28" ry="52" fill="#85522f"/><ellipse cx="274" cy="163" rx="9" ry="13" fill="#172d3c"/><ellipse cx="326" cy="163" rx="9" ry="13" fill="#172d3c"/><ellipse cx="300" cy="195" rx="26" ry="19" fill="#f5d9b5"/><ellipse cx="300" cy="187" rx="12" ry="9" fill="#27374a"/><path d="M285 211 Q300 225 315 211" fill="none" stroke="#75472e" stroke-width="4"/>`;
  if (kind === "car") body = `<rect y="230" width="600" height="130" fill="#8ac47a"/><rect x="0" y="260" width="600" height="100" fill="#566c7b"/><path d="M0 310 H600" stroke="#f4e6a5" stroke-width="5" stroke-dasharray="35 25"/><path d="M115 210 L165 135 Q177 120 200 120 H365 Q388 122 405 150 L450 210Z" fill="#1683bd"/><rect x="95" y="205" width="375" height="90" rx="22" fill="#1385c4"/><path d="M190 137 H280 V200 H151Z M293 137 H360 Q378 141 395 200 H293Z" fill="#c7efff"/><circle cx="180" cy="286" r="36" fill="#172b3a"/><circle cx="180" cy="286" r="17" fill="#d8e4ee"/><circle cx="390" cy="286" r="36" fill="#172b3a"/><circle cx="390" cy="286" r="17" fill="#d8e4ee"/><rect x="425" y="226" width="32" height="17" rx="5" fill="#ffe5a1"/>`;
  if (kind === "street") body = `<rect y="195" width="600" height="165" fill="#5c7181"/><path d="M0 285 H600" stroke="#f8e7a1" stroke-width="5" stroke-dasharray="40 25"/><rect x="30" y="65" width="105" height="140" fill="#b8c5d4"/><rect x="160" y="35" width="105" height="170" fill="#d0dbe5"/><rect x="440" y="55" width="110" height="150" fill="#c5d2df"/><g fill="#8ab4d3"><rect x="48" y="84" width="18" height="22"/><rect x="83" y="84" width="18" height="22"/><rect x="180" y="56" width="18" height="22"/><rect x="215" y="56" width="18" height="22"/></g><g><rect x="70" y="226" width="170" height="78" rx="18" fill="#e65d4f"/><path d="M105 229 L135 198 H202 L224 229Z" fill="#bde8fa"/><circle cx="111" cy="301" r="22" fill="#1e293b"/><circle cx="205" cy="301" r="22" fill="#1e293b"/></g><g><rect x="350" y="236" width="150" height="65" rx="17" fill="#f3c54c"/><path d="M380 237 L406 212 H460 L482 237Z" fill="#c5eafa"/><circle cx="386" cy="299" r="20" fill="#1e293b"/><circle cx="466" cy="299" r="20" fill="#1e293b"/></g><g fill="#263a4b"><circle cx="300" cy="200" r="17"/><rect x="287" y="216" width="26" height="64" rx="9"/><path d="M290 275 L278 314 M310 275 L322 314 M288 230 L268 254 M312 230 L331 251" stroke="#263a4b" stroke-width="10" stroke-linecap="round"/></g>`;
  if (kind === "animals") body = `<rect y="215" width="600" height="145" fill="url(#grass)"/><circle cx="500" cy="65" r="35" fill="#f9d978"/><g><ellipse cx="190" cy="245" rx="90" ry="58" fill="#a9a18a"/><circle cx="275" cy="205" r="43" fill="#bdb5a0"/><ellipse cx="246" cy="202" rx="25" ry="44" fill="#9c9582"/><path d="M292 214 Q330 225 306 265" fill="none" stroke="#a9a18a" stroke-width="16" stroke-linecap="round"/><path d="M144 286 V322 M213 286 V322" stroke="#88816f" stroke-width="20" stroke-linecap="round"/><circle cx="285" cy="197" r="5" fill="#27374a"/></g><g><ellipse cx="420" cy="265" rx="46" ry="30" fill="#bd8d55"/><circle cx="455" cy="230" r="26" fill="#d5a36b"/><path d="M434 212 L423 187 L447 204 M461 207 L479 188 L474 218" fill="#d5a36b"/><circle cx="463" cy="229" r="4" fill="#26374a"/></g>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360">${common}${body}</svg>`);
}

let currentSample = "cat";
let uploadedObjectUrl = null;
let uploadedName = "";
let classifierModel = null;
let modelLoadPromise = null;
let latestPredictions = null;
let classificationRequest = 0;

function setTask(task) {
  $("taskSelect").value = task;
  renderDemo();
  $("lab").scrollIntoView({ behavior: "smooth", block: "start" });
}
function activeTitle() {
  if (uploadedName) return uploadedName.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ") || "Uploaded image";
  return samples[currentSample].title;
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function escapeXml(s) { return escapeHtml(s); }

async function ensureModel() {
  if (classifierModel) return classifierModel;
  if (modelLoadPromise) return modelLoadPromise;
  if (!window.tf || !window.mobilenet) {
    throw new Error("The AI libraries could not load. Check your internet connection, then refresh the page.");
  }
  modelLoadPromise = (async () => {
    setStatus("Loading AI model…");
    classifierModel = await mobilenet.load({ version: 2, alpha: 1.0 });
    return classifierModel;
  })();
  try { return await modelLoadPromise; }
  catch (error) { modelLoadPromise = null; classifierModel = null; throw error; }
}

function setStatus(message, isError = false) {
  $("imageStatus").textContent = message;
  $("imageStatus").style.color = isError ? "#b42318" : "";
  $("imageStatus").style.background = isError ? "#ffebe9" : "";
}

function renderDemo() {
  const task = $("taskSelect").value;
  const info = taskInfo[task];
  const sample = samples[currentSample];
  const source = uploadedObjectUrl || sample.svg;
  $("imageStatus").textContent = uploadedName ? "Your image • local preview" : "Real sample photo";
  $("mainImage").alt = uploadedName ? "Uploaded image preview" : sample.title + " sample photograph";
  $("emptyState").classList.add("hidden");
  $("explanation").textContent = info.explanation;
  drawAnnotations(task, sample.type);

  // Set CORS before assigning remote sample photos so TensorFlow.js can read the pixels.
  const img = $("mainImage");
  img.crossOrigin = "anonymous";
  if (img.src !== new URL(source, window.location.href).href) {
    img.onload = () => {
      if (uploadedName || !latestPredictions) classifyCurrentImage();
    };
    img.onerror = () => {
      setStatus("Image failed to load", true);
      $("resultContent").innerHTML = `<div class="result-label">SAMPLE IMAGE UNAVAILABLE</div><div class="prediction-name">Could not load photo</div><p style="font-size:12px;color:#64748b">Check your internet connection or choose another sample. You can also upload an image from your device.</p>`;
    };
    img.src = source;
  }

  if (latestPredictions) {
    renderPredictions(latestPredictions, task);
  } else {
    $("resultContent").innerHTML = `<div class="result-label">AI CLASSIFIER</div><div class="prediction-name">Preparing image…</div><p style="font-size:12px;color:#64748b">The pretrained model will classify this real photo and show the top three labels.</p>`;
  }
}
function renderPredictions(predictions, task) {
  const info = taskInfo[task];
  const best = predictions[0];
  const pct = Math.max(0, Math.min(100, best.probability * 100));
  let content = `<div class="result-label">MOBILENET PREDICTION • REAL MODEL</div><div class="prediction-name">${escapeHtml(prettyLabel(best.className))}</div><div class="confidence-track"><div class="confidence-fill" style="width:${pct}%"></div></div><div class="confidence-caption">Model confidence: ${pct.toFixed(1)}%</div><span class="result-tag">${info.tag}</span><div class="object-list"><strong style="font-size:12px;margin-top:8px">Top predictions</strong>`;
  predictions.slice(0, 3).forEach((p, i) => {
    const confidence = (p.probability * 100).toFixed(1);
    content += `<div class="object-row"><span class="object-dot" style="background:${["#00a67b","#1677ed","#ff9d22"][i]}"></span><span>${escapeHtml(prettyLabel(p.className))}</span><span class="object-count">${confidence}%</span></div>`;
  });
  content += `</div>`;
  if (task === "localisation") content += `<p style="font-size:11px;color:#9a6700;margin-top:10px">Note: the box on the image is illustrative. MobileNet classifies the image but does not locate the object.</p>`;
  if (task === "detection" || task === "segmentation") content += `<p style="font-size:11px;color:#9a6700;margin-top:10px">This is whole-image classification, not true object detection or segmentation. Those require a separate model.</p>`;
  $("resultContent").innerHTML = content;
  $("explanation").textContent = info.explanation;
}

function prettyLabel(label) {
  return String(label).replace(/_/g, " ").replace(/\s+/g, " ").replace(/\b\w/g, ch => ch.toUpperCase());
}

async function classifyCurrentImage() {
  const requestId = ++classificationRequest;
  const img = $("mainImage");
  if (!img || !img.complete || !img.naturalWidth) return;
  $("resultContent").innerHTML = `<div class="result-label">AI CLASSIFIER</div><div class="prediction-name">Analysing photo…</div><p style="font-size:12px;color:#64748b">The first run may take a little longer while the model loads.</p>`;
  setStatus("Preparing AI model…");
  try {
    const model = await ensureModel();
    if (requestId !== classificationRequest) return;
    if (!img.complete || !img.naturalWidth) {
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("The selected image could not be opened."));
      });
    }
    setStatus("Classifying in browser…");
    const predictions = await model.classify(img, 3);
    if (requestId !== classificationRequest) return;
    latestPredictions = predictions;
    setStatus(uploadedName ? "Upload classified" : "Sample photo classified");
    renderPredictions(predictions, $("taskSelect").value);
  } catch (error) {
    if (requestId !== classificationRequest) return;
    setStatus("Could not classify image", true);
    $("resultContent").innerHTML = `<div class="result-label">CLASSIFICATION ERROR</div><div class="prediction-name">AI model unavailable</div><p style="font-size:12px;color:#64748b">${escapeHtml(error.message || "Please check your connection and try again.")}</p><button id="retryAnalyse" class="primary-button">Try again</button>`;
    $("retryAnalyse").addEventListener("click", classifyCurrentImage);
  }
}
function drawAnnotations(task, type) {
  const svg = $("annotationLayer");
  const isMulti = type === "multiple";
  let markup = "";
  if (task === "localisation" || task === "detection") {
    const boxes = (task === "localisation" || !isMulti)
      ? [{x:190,y:75,w:220,h:220,label:activeTitle().slice(0,18),color:"#ff9d22"}]
      : [{x:55,y:195,w:195,h:130,label:"Car",color:"#1677ed"},{x:335,y:200,w:180,h:120,label:"Car",color:"#ff9d22"},{x:270,y:140,w:70,h:165,label:"Person",color:"#b24ce5"},{x:405,y:155,w:65,h:150,label:"Person",color:"#00a980"}];
    markup = boxes.map(b=>`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="3" fill="none" stroke="${b.color}" stroke-width="5"/><rect x="${b.x}" y="${Math.max(4,b.y-25)}" width="${Math.min(b.w,100)}" height="24" rx="4" fill="${b.color}"/><text x="${b.x+7}" y="${Math.max(20,b.y-8)}" fill="#fff" font-size="15" font-weight="700">${escapeXml(b.label)}</text>`).join("");
  } else if (task === "segmentation") {
    const masks = isMulti ? [
      `<path d="M55 245 Q80 190 145 200 Q220 190 250 250 L240 310 L70 320Z" fill="#00c79b" fill-opacity=".45" stroke="#00a980" stroke-width="3"/>`,
      `<path d="M325 242 Q350 190 420 205 Q480 210 510 255 L500 310 L340 315Z" fill="#a78bfa" fill-opacity=".5" stroke="#7c3aed" stroke-width="3"/>`,
      `<path d="M265 140 Q285 120 310 145 L330 235 L315 280 L280 280 L260 210Z" fill="#ffb84d" fill-opacity=".6" stroke="#db8b16" stroke-width="3"/>`
    ].join("") : `<path d="M210 205 Q180 140 245 100 Q300 45 360 100 Q420 145 385 225 Q370 285 300 295 Q230 280 210 205Z" fill="#00c79b" fill-opacity=".45" stroke="#00a980" stroke-width="4"/>`;
    markup = masks;
  }
  svg.innerHTML = markup;
}

$("loadSample").addEventListener("click", () => {
  classificationRequest++;
  if (uploadedObjectUrl) { URL.revokeObjectURL(uploadedObjectUrl); uploadedObjectUrl = null; }
  uploadedName = "";
  latestPredictions = null;
  $("imageUpload").value = "";
  currentSample = $("sampleSelect").value;
  // Force a fresh photo load and fresh model prediction.
  $("mainImage").removeAttribute("src");
  renderDemo();
});

$("taskSelect").addEventListener("change", () => {
  drawAnnotations($("taskSelect").value, samples[currentSample].type);
  if (latestPredictions) renderPredictions(latestPredictions, $("taskSelect").value);
  else renderDemo();
});
document.querySelectorAll("[data-task]").forEach(button => button.addEventListener("click", () => setTask(button.dataset.task)));

$("imageUpload").addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (!file.type.match(/^image\/(png|jpeg|webp)$/)) { alert("Please choose a JPG, PNG, or WEBP image."); event.target.value = ""; return; }
  if (file.size > 10 * 1024 * 1024) { alert("Please choose an image smaller than 10 MB."); event.target.value = ""; return; }
  classificationRequest++;
  if (uploadedObjectUrl) URL.revokeObjectURL(uploadedObjectUrl);
  uploadedObjectUrl = URL.createObjectURL(file);
  uploadedName = file.name;
  latestPredictions = null;
  const img = $("mainImage");
  img.crossOrigin = "anonymous";
  img.onload = () => classifyCurrentImage();
  img.onerror = () => {
    setStatus("Image could not be opened", true);
    $("resultContent").innerHTML = `<p>We couldn't open this image. Try a different JPG, PNG, or WEBP file.</p>`;
  };
  img.src = uploadedObjectUrl;
  setStatus("Image loaded • waiting for AI");
});

$("revealHint").addEventListener("click", () => {
  $("hintText").classList.toggle("hidden");
  $("revealHint").textContent = $("hintText").classList.contains("hidden") ? "Reveal a hint ↗" : "Hide hint ↑";
});

$("checkQuiz").addEventListener("click", () => {
  const answer = $("quizSelect").value;
  const feedback = $("quizFeedback");
  if (!answer) { feedback.textContent = "Choose an answer first."; feedback.className = "quiz-feedback"; return; }
  if (answer === "segmentation") {
    feedback.textContent = "Correct! Instance segmentation labels each object and marks its pixels with a separate mask.";
    feedback.className = "quiz-feedback good";
  } else {
    feedback.textContent = "Not quite. Separate coloured pixel masks for each object indicate Instance Segmentation.";
    feedback.className = "quiz-feedback bad";
  }
});

renderDemo();
