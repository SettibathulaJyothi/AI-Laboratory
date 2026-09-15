// ==========================================
// SUPERVISED LEARNING - FRUIT CLASSIFIER
// ==========================================

// ------------------------------
// 1. TRAINING DATA
// ------------------------------

const trainingData = [
    {
        fruit: "Apple",
        emoji: "🍎",
        weight: 200,
        size: "Medium"
    },
    {
        fruit: "Banana",
        emoji: "🍌",
        weight: 120,
        size: "Long"
    },
    {
        fruit: "Orange",
        emoji: "🍊",
        weight: 150,
        size: "Round"
    },
    {
        fruit: "Grapes",
        emoji: "🍇",
        weight: 5,
        size: "Small"
    }
];


// ------------------------------
// 2. SIZE VALUES
// ------------------------------

const sizeCodes = {
    Small: 0,
    Medium: 1,
    Long: 2,
    Round: 3
};


// ------------------------------
// 3. VARIABLES
// ------------------------------

let trained = false;

let selectedSize = "Long";


// ------------------------------
// 4. GET HTML ELEMENTS
// ------------------------------

const datasetEl =
    document.getElementById("dataset");

const weightSlider =
    document.getElementById("weightSlider");

const weightValue =
    document.getElementById("weightValue");

const sizeButtons =
    document.getElementById("sizeButtons");

const testDescription =
    document.getElementById("testDescription");

const testFruitEmoji =
    document.getElementById("testFruitEmoji");

const unknownFruit =
    document.getElementById("unknownFruit");

const trainBtn =
    document.getElementById("trainBtn");

const predictBtn =
    document.getElementById("predictBtn");

const resetBtn =
    document.getElementById("resetBtn");

const modelTitle =
    document.getElementById("modelTitle");

const modelStatus =
    document.getElementById("modelStatus");

const progressBar =
    document.getElementById("progressBar");

const progressText =
    document.getElementById("progressText");

const predictionPanel =
    document.getElementById("predictionPanel");

const predictionTitle =
    document.getElementById("predictionTitle");

const predictionEmoji =
    document.getElementById("predictionEmoji");

const predictionResult =
    document.getElementById("predictionResult");

const confidenceText =
    document.getElementById("confidenceText");

const confidenceBar =
    document.getElementById("confidenceBar");

const reasoning =
    document.getElementById("reasoning");

const neighbors =
    document.getElementById("neighbors");


// ==========================================
// 5. DISPLAY TRAINING DATA
// ==========================================

function renderDataset() {

    datasetEl.innerHTML = trainingData.map(item => {

        return `
            <div class="data-card">

                <div class="fruit-icon">
                    ${item.emoji}
                </div>

                <div>

                    <strong>
                        ${item.fruit}
                    </strong>

                    <small>
                        ${item.weight} grams • ${item.size}
                    </small>

                    <span class="label-pill">
                        LABEL:
                        ${item.fruit.toUpperCase()}
                    </span>

                </div>

            </div>
        `;

    }).join("");


    document.getElementById("dataCount").textContent =
        `${trainingData.length} labelled examples`;
}


// ==========================================
// 6. UPDATE TEST FRUIT
// ==========================================

function updateTestFruit() {

    const weight =
        Number(weightSlider.value);


    // Display weight

    weightValue.textContent =
        weight;


    // Display test description

    testDescription.textContent =
        `${weight} g • ${selectedSize}`;


    // Change visual fruit according to size

    let visualFruit;


    if (selectedSize === "Long") {

        visualFruit = "🍌";

    }

    else if (selectedSize === "Round") {

        visualFruit = "🍊";

    }

    else if (selectedSize === "Small") {

        visualFruit = "🍇";

    }

    else {

        visualFruit = "🍎";

    }


    testFruitEmoji.textContent =
        visualFruit;


    // Unknown before prediction

    unknownFruit.textContent =
        "❓";


    // Clear previous prediction

    if (trained) {

        predictionResult.textContent =
            "—";

        predictionEmoji.textContent =
            "🤖";

        predictionTitle.textContent =
            "Ready for another test";

        confidenceText.textContent =
            "—";

        confidenceBar.style.width =
            "0%";
    }
}


// ==========================================
// 7. FLOW INDICATOR
// ==========================================

function setFlow(step) {

    const steps =
        document.querySelectorAll(".flow-step");


    steps.forEach((element, index) => {

        element.classList.toggle(
            "done",
            index < step
        );


        element.classList.toggle(
            "active",
            index === step
        );

    });
}


// ==========================================
// 8. SIZE BUTTONS
// ==========================================

sizeButtons.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "button[data-size]"
            );


        if (!button) return;


        // Remove selection

        document
            .querySelectorAll(
                ".size-buttons button"
            )
            .forEach(btn => {

                btn.classList.remove(
                    "selected"
                );

            });


        // Select clicked button

        button.classList.add(
            "selected"
        );


        // Store selected size

        selectedSize =
            button.dataset.size;


        // Update UI

        updateTestFruit();


        // Move flow

        setFlow(2);

    }
);


// ==========================================
// 9. WEIGHT SLIDER
// ==========================================

weightSlider.addEventListener(
    "input",
    updateTestFruit
);


// ==========================================
// 10. TRAIN THE MODEL
// ==========================================

trainBtn.addEventListener(
    "click",
    function() {

        if (trained) return;


        trainBtn.disabled = true;


        modelTitle.textContent =
            "AI is learning...";


        modelStatus.textContent =
            "Comparing weight and size with the fruit labels.";


        setFlow(1);


        let progress = 0;


        const timer =
            setInterval(function() {

                progress += 5;


                progressBar.style.width =
                    `${progress}%`;


                progressText.textContent =
                    `${progress}%`;


                if (progress >= 100) {

                    clearInterval(timer);


                    trained = true;


                    trainBtn.textContent =
                        "✓ Model Trained";


                    modelTitle.textContent =
                        "Model is ready!";


                    modelStatus.textContent =
                        "The model learned patterns from the labelled fruit examples.";


                    trainBtn.style.background =
                        "#16a36a";


                    predictBtn.disabled =
                        false;


                    setFlow(2);

                }

            }, 45);

    }
);


// ==========================================
// 11. SUPERVISED LEARNING ALGORITHM
// ==========================================

function calculatePrediction(
    weight,
    size
) {

    /*
        We are using a simple
        Nearest Neighbour approach.

        The model compares the new fruit
        with the labelled training examples.
    */


    const distances =
        trainingData.map(item => {

            // Difference in weight

            const weightDistance =
                Math.abs(
                    weight - item.weight
                ) / 250;


            // Difference in size

            const sizeDistance =
                Math.abs(
                    sizeCodes[size] -
                    sizeCodes[item.size]
                ) / 3;


            /*
                Weight has more influence
                than size in this example.
            */

            const distance =
                (weightDistance * 0.72) +
                (sizeDistance * 0.28);


            return {

                ...item,

                distance: distance

            };

        });


    // Sort closest → farthest

    distances.sort(
        (a, b) =>
            a.distance - b.distance
    );


    /*
        Take the three closest examples.
    */

    const top =
        distances.slice(0, 3);


    const scores = {};


    // Calculate influence of each fruit

    top.forEach(item => {

        const score =
            1 /
            (item.distance + 0.05);


        scores[item.fruit] =
            (scores[item.fruit] || 0) +
            score;

    });


    // Sort predictions

    const ranked =
        Object.entries(scores)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    // Best prediction

    const winner =
        ranked[0][0];


    // Total score

    const total =
        ranked.reduce(
            (sum, entry) =>
                sum + entry[1],
            0
        );


    // Confidence

    const confidence =
        Math.round(
            (ranked[0][1] / total) * 100
        );


    return {

        winner: winner,

        confidence: confidence,

        neighbors: top

    };
}


// ==========================================
// 12. SHOW PREDICTION
// ==========================================

function showPrediction() {

    // Make sure model is trained

    if (!trained) {

        modelStatus.textContent =
            "Please train the model first.";

        trainBtn.focus();

        return;
    }


    // Get test values

    const weight =
        Number(weightSlider.value);


    const result =
        calculatePrediction(
            weight,
            selectedSize
        );


    // Get fruit information

    const winnerData =
        trainingData.find(
            item =>
                item.fruit ===
                result.winner
        );


    // Update flow

    setFlow(3);


    // Update prediction area

    predictionTitle.textContent =
        "Prediction complete!";


    predictionEmoji.textContent =
        winnerData.emoji;


    predictionResult.textContent =
        result.winner;


    confidenceText.textContent =
        `${result.confidence}%`;


    confidenceBar.style.width =
        `${result.confidence}%`;


    // Find closest example

    const nearest =
        result.neighbors[0];


    // Explain decision

    reasoning.innerHTML = `

        <b>
            🔍 How did the AI decide?
        </b>

        <p>

            The new fruit is

            <b>
                ${weight} g
            </b>

            and

            <b>
                ${selectedSize}
            </b>.

            The closest learned example is

            <b>
                ${nearest.fruit}
                (${nearest.weight} g,
                ${nearest.size})
            </b>.

            The model compares several
            nearby examples and chooses
            the strongest matching label.

        </p>

    `;


    // Show nearest examples

    neighbors.innerHTML = `

        <span
            class="tag"
            style="width:100%; margin-bottom:2px;"
        >

            NEAREST LEARNED EXAMPLES

        </span>

        ${result.neighbors.map(
            (item, index) => {

                return `

                    <span class="neighbor">

                        ${index + 1}.
                        ${item.emoji}
                        ${item.fruit}
                        •
                        ${item.weight}g
                        •
                        ${item.size}

                    </span>

                `;

            }
        ).join("")}

    `;


    // Prediction animation

    predictionPanel.classList.remove(
        "highlight"
    );


    // Force browser reflow

    void predictionPanel.offsetWidth;


    predictionPanel.classList.add(
        "highlight"
    );


    setFlow(3);

}


// ==========================================
// 13. PREDICT BUTTON
// ==========================================

predictBtn.addEventListener(
    "click",
    showPrediction
);


// ==========================================
// 14. RESET APPLICATION
// ==========================================

resetBtn.addEventListener(
    "click",
    function() {

        trained = false;


        selectedSize =
            "Long";


        // Reset weight

        weightSlider.value =
            120;


        // Reset size

        document
            .querySelectorAll(
                ".size-buttons button"
            )
            .forEach(btn => {

                btn.classList.toggle(
                    "selected",
                    btn.dataset.size ===
                    "Long"
                );

            });


        // Reset train button

        trainBtn.disabled =
            false;


        trainBtn.textContent =
            "🧠 Train Model";


        trainBtn.style.background =
            "";


        predictBtn.disabled =
            false;


        // Reset model

        modelTitle.textContent =
            "Model is waiting";


        modelStatus.textContent =
            "Train the model to let it learn from the labelled examples.";


        // Reset progress

        progressBar.style.width =
            "0%";


        progressText.textContent =
            "0%";


        // Reset prediction

        predictionTitle.textContent =
            "Prediction appears here";


        predictionEmoji.textContent =
            "🤖";


        predictionResult.textContent =
            "—";


        confidenceText.textContent =
            "—";


        confidenceBar.style.width =
            "0%";


        // Reset explanation

        reasoning.innerHTML = `

            <b>
                🔍 How did the AI decide?
            </b>

            <p>
                Train the model and test
                an unknown fruit to see
                the reasoning.
            </p>

        `;


        // Remove neighbors

        neighbors.innerHTML =
            "";


        // Update test fruit

        updateTestFruit();


        // Reset flow

        setFlow(0);

    }
);


// ==========================================
// 15. START APPLICATION
// ==========================================

renderDataset();

updateTestFruit();

setFlow(0);