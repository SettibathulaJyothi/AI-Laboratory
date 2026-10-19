
const $ = (id) => document.getElementById(id);

const homeScreen = $("homeScreen");
const gameScreen = $("gameScreen");
const resultScreen = $("resultScreen");

let currentGame = "";
let score = 0;
let totalScore = 0;
let streak = 0;
let bestStreak = 0;
let correct = 0;
let attempts = 0;
let round = 1;
let timeLeft = 30;
let timerInterval = null;
let answered = false;
let lastQuestion = null;
let gameOver = false;

const games = {
  pixel: {
    name: "🌈 PIXEL POP",
    kicker: "MATCH THE RGB COLOR",
    questions: [
      { q: "Find the RED pixel!", visual: "🟥", caption: "R = 255, G = 0, B = 0", answer: "Red", choices: ["Red", "Blue", "Green", "Yellow"] },
      { q: "Which color is this?", visual: "🟦", caption: "R = 0, G = 0, B = 255", answer: "Blue", choices: ["Green", "Blue", "Purple", "Red"] },
      { q: "Find the GREEN pixel!", visual: "🟩", caption: "R = 0, G = 255, B = 0", answer: "Green", choices: ["Yellow", "Red", "Green", "Blue"] },
      { q: "Which color mixes RED + GREEN?", visual: "🟨", caption: "R = 255, G = 255, B = 0", answer: "Yellow", choices: ["Purple", "Yellow", "Blue", "Black"] },
      { q: "Find the WHITE pixel!", visual: "⬜", caption: "R = 255, G = 255, B = 255", answer: "White", choices: ["Black", "Blue", "White", "Green"] },
      { q: "Which color has all RGB values at zero?", visual: "⬛", caption: "R = 0, G = 0, B = 0", answer: "Black", choices: ["White", "Black", "Yellow", "Pink"] },
      { q: "RED + BLUE creates which color?", visual: "🟪", caption: "Mixing light colors", answer: "Magenta", choices: ["Green", "Orange", "Magenta", "Yellow"] },
      { q: "Find the ORANGE color!", visual: "🟠", caption: "A mix of red and green light", answer: "Orange", choices: ["Orange", "Blue", "White", "Black"] }
    ]
  },

  fruit: {
    name: "🍌 FRUIT FRENZY",
    kicker: "FRUIT VISION CHALLENGE",
    questions: [
      { q: "Where does this banana belong?", visual: "🍌", caption: "Bright yellow skin", answer: "Ripe", choices: ["Raw", "Ripe", "Rotten", "Unknown"] },
      { q: "Sort this fruit!", visual: "🍏", caption: "Green and firm", answer: "Raw", choices: ["Ripe", "Rotten", "Raw", "Unknown"] },
      { q: "What do you see?", visual: "🍌🟤", caption: "Dark brown spots and damaged skin", answer: "Rotten", choices: ["Raw", "Ripe", "Rotten", "Fresh"] },
      { q: "Classify this fruit!", visual: "🍎", caption: "Red apple", answer: "Apple", choices: ["Banana", "Apple", "Orange", "Mango"] },
      { q: "Which fruit is shown?", visual: "🍊", caption: "Round orange citrus fruit", answer: "Orange", choices: ["Apple", "Grape", "Orange", "Banana"] },
      { q: "Pick the correct fruit!", visual: "🥭", caption: "Tropical fruit", answer: "Mango", choices: ["Mango", "Apple", "Pear", "Grape"] },
      { q: "A green, unripe banana is usually…", visual: "🍌", caption: "Green peel", answer: "Raw", choices: ["Rotten", "Ripe", "Raw", "Overripe"] },
      { q: "Which one is a grape?", visual: "🍇", caption: "Small fruits in a bunch", answer: "Grapes", choices: ["Orange", "Grapes", "Apple", "Mango"] }
    ]
  },

  cluster: {
    name: "🦋 CLUSTER CLASH",
    kicker: "GROUP BY FEATURES",
    questions: [
      { q: "Which creature has SIX legs?", visual: "🦋", caption: "Look at the creature's features", answer: "Insect", choices: ["Mammal", "Insect", "Bird", "Fish"] },
      { q: "Which pair belongs together?", visual: "🐱 🐶", caption: "Group animals with similar features", answer: "Mammals", choices: ["Fish", "Insects", "Mammals", "Reptiles"] },
      { q: "A snake belongs to which group?", visual: "🐍", caption: "Scaly skin, no legs", answer: "Reptile", choices: ["Bird", "Mammal", "Reptile", "Insect"] },
      { q: "Which animal has feathers?", visual: "🦜", caption: "Find the matching feature", answer: "Bird", choices: ["Fish", "Bird", "Reptile", "Mammal"] },
      { q: "Which creature lives underwater and has gills?", visual: "🐟", caption: "Think about its features", answer: "Fish", choices: ["Fish", "Bird", "Mammal", "Insect"] },
      { q: "Which pair are both insects?", visual: "🐝 🦋", caption: "Find the shared group", answer: "Insects", choices: ["Mammals", "Insects", "Birds", "Fish"] },
      { q: "Which animal has fur and feeds its babies milk?", visual: "🐈", caption: "Find the animal group", answer: "Mammal", choices: ["Reptile", "Fish", "Mammal", "Insect"] },
      { q: "Which pair belongs to the bird group?", visual: "🦆 🦜", caption: "Group by shared features", answer: "Birds", choices: ["Birds", "Fish", "Reptiles", "Insects"] }
    ]
  },

  weather: {
    name: "🌦️ WEATHER RUSH",
    kicker: "PREDICT THE WEATHER",
    questions: [
      { q: "Which weather matches this scene?", visual: "☀️ 🏖️", caption: "Bright sunshine and clear skies", answer: "Sunny", choices: ["Rainy", "Cloudy", "Sunny", "Snowy"] },
      { q: "Predict the weather!", visual: "🌧️ ☔", caption: "Water falling from clouds", answer: "Rainy", choices: ["Sunny", "Rainy", "Windy", "Cloudy"] },
      { q: "What is covering the sky?", visual: "☁️ ☁️", caption: "The sun is hidden by clouds", answer: "Cloudy", choices: ["Sunny", "Snowy", "Cloudy", "Rainy"] },
      { q: "Which weather has strong moving air?", visual: "🌬️ 🍃", caption: "Leaves blowing around", answer: "Windy", choices: ["Windy", "Sunny", "Rainy", "Snowy"] },
      { q: "Which sensor measures temperature?", visual: "🌡️", caption: "It tells us how hot or cold it is", answer: "Temperature", choices: ["Humidity", "Pressure", "Temperature", "Wind speed"] },
      { q: "Which sensor measures moisture in the air?", visual: "💧", caption: "Water vapour in the atmosphere", answer: "Humidity", choices: ["Humidity", "Pressure", "Temperature", "Light"] },
      { q: "Which instrument measures air pressure?", visual: "🌍", caption: "A weather measurement", answer: "Barometer", choices: ["Thermometer", "Barometer", "Ruler", "Compass"] },
      { q: "What can weather AI do?", visual: "🤖 🌦️", caption: "It uses patterns in weather data", answer: "Predict weather", choices: ["Predict weather", "Stop the rain", "Move clouds", "Create sunshine"] }
    ]
  },

  face: {
    name: "👁️ LANDMARK HUNT",
    kicker: "FIND THE FACE FEATURE",
    questions: [
      { q: "Tap the answer for the eye landmark!", visual: "👀", caption: "Face landmark detection", answer: "Eye", choices: ["Ear", "Eye", "Chin", "Neck"] },
      { q: "Where is the nose?", visual: "👃", caption: "Look at the center of a face", answer: "Nose", choices: ["Nose", "Forehead", "Ear", "Chin"] },
      { q: "Find the mouth landmark!", visual: "👄", caption: "Below the nose", answer: "Mouth", choices: ["Eye", "Ear", "Mouth", "Hair"] },
      { q: "Which feature is on the side of the head?", visual: "👂", caption: "A facial feature", answer: "Ear", choices: ["Nose", "Ear", "Mouth", "Chin"] },
      { q: "Where is the chin?", visual: "🙂", caption: "The lower part of the face", answer: "Bottom of face", choices: ["Top of head", "Bottom of face", "Ear", "Hair"] },
      { q: "What do facial landmarks mark?", visual: "🔴 👁️ 🔴", caption: "Points on a face", answer: "Face points", choices: ["Weather", "Face points", "Pixels only", "Sound waves"] },
      { q: "What does a face mesh connect?", visual: "🕸️ 😀", caption: "A network of points", answer: "Landmarks", choices: ["Clouds", "Pixels only", "Landmarks", "Fruit"] },
      { q: "Which technology can detect facial landmarks?", visual: "📷 🤖", caption: "A computer vision task", answer: "Computer vision", choices: ["Computer vision", "Word processing", "Weather station", "Calculator"] }
    ]
  },

  boss: {
    name: "👾 AI BOSS BATTLE",
    kicker: "THE ULTIMATE AI CHALLENGE",
    questions: [
      { q: "Which AI learns from labelled examples?", visual: "📚 🤖", caption: "Training with known answers", answer: "Supervised learning", choices: ["Clustering", "Supervised learning", "Random guessing", "Drawing"] },
      { q: "Which AI method groups similar data without labels?", visual: "🟣 🔵 🟣", caption: "Discovering groups in data", answer: "Clustering", choices: ["Clustering", "Typing", "Printing", "Scanning"] },
      { q: "What is an image made of?", visual: "🖼️ 🔍", caption: "Tiny picture elements", answer: "Pixels", choices: ["Sounds", "Pixels", "Paragraphs", "Wires"] },
      { q: "What helps an AI model improve?", visual: "🤖 📈", caption: "Learning from examples", answer: "Training data", choices: ["Training data", "Random colors", "A keyboard", "A speaker"] },
      { q: "Which tool is used for image processing in Python?", visual: "🐍 🖼️", caption: "A popular computer vision library", answer: "OpenCV", choices: ["OpenCV", "Spreadsheet", "Calculator", "Text editor"] },
      { q: "Which task identifies an object in a picture?", visual: "🐶 📷", caption: "AI examines image patterns", answer: "Image classification", choices: ["Image classification", "Music playing", "Word counting", "Weather measuring"] },
      { q: "What is a model prediction?", visual: "🧠 💡", caption: "The model's output for an input", answer: "An AI result", choices: ["An AI result", "A power cable", "A photo album", "A screen"] },
      { q: "What is a common way to evaluate a classifier?", visual: "🎯 📊", caption: "Compare predictions with correct labels", answer: "Check accuracy", choices: ["Change the wallpaper", "Check accuracy", "Turn off the screen", "Add music"] }
    ]
  }
};

// Prevent the same question appearing twice in a row.
function getQuestion() {
  const pool = games[currentGame].questions;
  let question;

  do {
    question = pool[Math.floor(Math.random() * pool.length)];
  } while (pool.length > 1 && question === lastQuestion);

  lastQuestion = question;
  return { ...question, choices: [...question.choices].sort(() => Math.random() - 0.5) };
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function startGame(gameId) {
  clearInterval(timerInterval);

  currentGame = gameId;
  score = 0;
  streak = 0;
  bestStreak = 0;
  correct = 0;
  attempts = 0;
  round = 1;
  timeLeft = 30;
  gameOver = false;
  lastQuestion = null;

  homeScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  $("gameMode").textContent = games[gameId].name;
  $("timer").textContent = timeLeft;
  $("timerBar").style.width = "100%";
  $("gameScore").textContent = score;
  $("streak").textContent = streak;
  $("round").textContent = round;

  showQuestion();
  timerInterval = setInterval(tick, 1000);
}

function showQuestion() {
  if (gameOver) return;

  answered = false;
  const q = getQuestion();

  $("challengeKicker").textContent = games[currentGame].kicker;
  $("question").textContent = q.q;

  const visual = $("visual");
  visual.innerHTML = "";

  const emoji = document.createElement("div");
  emoji.className = "big-emoji";
  emoji.textContent = q.visual;
  visual.appendChild(emoji);

  const caption = document.createElement("div");
  caption.className = "visual-caption";
  caption.textContent = q.caption;
  visual.appendChild(caption);

  $("feedback").textContent = "";
  $("feedback").className = "feedback";
  $("nextBtn").classList.add("hidden");

  const answers = $("answers");
  answers.innerHTML = "";

  shuffle(q.choices).forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";

    // RGB color game gets color swatches.
    if (currentGame === "pixel") {
      const colors = {
        Red: "#ff3030", Blue: "#287bff", Green: "#20d980",
        Yellow: "#ffe44b", White: "#ffffff", Black: "#111111",
        Magenta: "#ff3bdb", Orange: "#ff8c24",
        Purple: "#9c58ed", Pink: "#ff79cb"
      };

      btn.classList.add("color-answer");

      const dot = document.createElement("span");
      dot.className = "color-dot";
      dot.style.background = colors[choice] || "#777";

      const label = document.createElement("span");
      label.textContent = choice;

      btn.append(dot, label);
    } else {
      btn.textContent = choice;
    }

    btn.addEventListener("click", () => checkAnswer(choice, q.answer, btn));
    answers.appendChild(btn);
  });
}

function checkAnswer(choice, answer, selectedButton) {
  if (answered || gameOver) return;
  answered = true;
  attempts++;

  const buttons = [...$("answers").querySelectorAll("button")];

  buttons.forEach(btn => {
    btn.disabled = true;
    const text = btn.textContent.trim();
    if (text === answer) btn.classList.add("correct");
  });

  if (choice === answer) {
    correct++;
    streak++;
    bestStreak = Math.max(bestStreak, streak);

    const points = 10 + Math.min((streak - 1) * 2, 10);
    score += points;
    totalScore += points;

    $("feedback").textContent =
      `🎉 CORRECT! +${points} POINTS`;
    $("feedback").className = "feedback good";

    selectedButton.classList.add("correct");
  } else {
    streak = 0;
    selectedButton.classList.add("wrong");
    $("feedback").textContent = `😅 NOT QUITE! Answer: ${answer}`;
    $("feedback").className = "feedback bad";
  }

  $("gameScore").textContent = score;
  $("streak").textContent = streak;
  $("totalScore").textContent = totalScore;
  $("topStreak").textContent = bestStreak;

  $("nextBtn").classList.remove("hidden");
}

function tick() {
  if (gameOver) return;

  timeLeft--;
  $("timer").textContent = timeLeft;
  $("timerBar").style.width = `${Math.max(0, timeLeft / 30 * 100)}%`;

  if (timeLeft <= 0) endGame();
}

function nextQuestion() {
  if (gameOver) return;
  round++;
  $("round").textContent = round;
  showQuestion();
}

function endGame() {
  gameOver = true;
  clearInterval(timerInterval);

  gameScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  $("finalScore").textContent = score;
  $("correctCount").textContent = correct;
  $("bestStreak").textContent = bestStreak;
  $("questionsCount").textContent = attempts;

  const accuracy = attempts ? Math.round(correct / attempts * 100) : 0;

  if (accuracy >= 85) {
    $("resultTitle").textContent = "AI ARCADE LEGEND!";
    $("resultMessage").textContent = "🔥 Incredible! You smashed the challenge!";
  } else if (accuracy >= 55) {
    $("resultTitle").textContent = "SUPER PLAYER!";
    $("resultMessage").textContent = "⚡ Great run! Ready to beat your score?";
  } else {
    $("resultTitle").textContent = "LEVEL UP TIME!";
    $("resultMessage").textContent = "🚀 One more round. You can beat your score!";
  }

  $("againBtn").textContent = "🔁 PLAY AGAIN";
}

function goHome() {
  clearInterval(timerInterval);
  gameOver = true;
  gameScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
}

// Game menu
document.querySelectorAll(".game-card").forEach(card => {
  card.addEventListener("click", () => startGame(card.dataset.game));
});

$("nextBtn").addEventListener("click", nextQuestion);
$("backBtn").addEventListener("click", goHome);
$("homeBtn").addEventListener("click", (event) => {
  event.preventDefault();
  goHome();
});
$("menuBtn").addEventListener("click", goHome);
$("againBtn").addEventListener("click", () => startGame(currentGame));

// Keyboard support: press Enter to advance after answering.
document.addEventListener("keydown", event => {
  if (event.key === "Enter" && answered && !gameOver &&
      !gameScreen.classList.contains("hidden")) {
    nextQuestion();
  }
});
