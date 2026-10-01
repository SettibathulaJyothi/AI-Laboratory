/* =========================================
   AI DATA ACQUISITION & TRAINING LAB
========================================= */


/* =========================================
   DATA
========================================= */

let dataset = [];

let aiTrained = false;


/*
    SAMPLE DATA

    Category A = smaller values
    Category B = larger values
*/

const sampleData = [

    { f1: 10, f2: 15, category: "A" },
    { f1: 12, f2: 18, category: "A" },
    { f1: 15, f2: 20, category: "A" },
    { f1: 18, f2: 22, category: "A" },
    { f1: 20, f2: 25, category: "A" },
    { f1: 22, f2: 28, category: "A" },

    { f1: 70, f2: 75, category: "B" },
    { f1: 75, f2: 80, category: "B" },
    { f1: 80, f2: 85, category: "B" },
    { f1: 85, f2: 90, category: "B" },
    { f1: 90, f2: 95, category: "B" },
    { f1: 95, f2: 100, category: "B" }

];


/* =========================================
   ELEMENTS
========================================= */

const sampleDataBtn =
    document.getElementById("sampleDataBtn");

const userDataBtn =
    document.getElementById("userDataBtn");

const dataForm =
    document.getElementById("dataForm");

const addDataBtn =
    document.getElementById("addDataBtn");

const clearDataBtn =
    document.getElementById("clearDataBtn");

const dataPreview =
    document.getElementById("dataPreview");

const dataTable =
    document.getElementById("dataTable");

const dataCount =
    document.getElementById("dataCount");

const continueExploreBtn =
    document.getElementById("continueExploreBtn");

const trainStepBtn =
    document.getElementById("trainStepBtn");

const trainBtn =
    document.getElementById("trainBtn");

const predictionStepBtn =
    document.getElementById("predictionStepBtn");

const predictBtn =
    document.getElementById("predictBtn");

const restartBtn =
    document.getElementById("restartBtn");

const backToDataBtn =
    document.getElementById("backToDataBtn");



/* =========================================
   STEP NAVIGATION
========================================= */

function goToStep(stepNumber) {

    document
        .querySelectorAll(".lesson")
        .forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


    document
        .getElementById(`step${stepNumber}`)
        .classList.add("active-section");


    /* Update progress indicators */

    document
        .querySelectorAll(".step")
        .forEach((step, index) => {

            step.classList.remove("active");
            step.classList.remove("completed");


            if (index + 1 < stepNumber) {

                step.classList.add(
                    "completed"
                );

            }


            if (index + 1 === stepNumber) {

                step.classList.add(
                    "active"
                );

            }

        });


    /* Update progress bar */

    const progress =
        ((stepNumber - 1) / 3) * 100;


    document.getElementById(
        "progressBar"
    ).style.width = progress + "%";


    /* Scroll to top */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}



/* =========================================
   SAMPLE DATA
========================================= */

sampleDataBtn.addEventListener(
    "click",
    function() {

        /*
            Make a fresh copy so the
            original sample data never changes.
        */

        dataset = sampleData.map(item => ({
            ...item
        }));


        renderDataset();


        dataPreview.classList.remove(
            "hidden"
        );


        dataForm.classList.add(
            "hidden"
        );

    }
);



/* =========================================
   USER DATA OPTION
========================================= */

userDataBtn.addEventListener(
    "click",
    function() {

        dataForm.classList.remove(
            "hidden"
        );


        dataPreview.classList.remove(
            "hidden"
        );


        renderDataset();


        /*
            Scroll directly to form
        */

        setTimeout(() => {

            dataForm.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }, 100);

    }
);



/* =========================================
   ADD USER DATA
========================================= */

addDataBtn.addEventListener(
    "click",
    function() {

        const f1 =
            Number(
                document.getElementById(
                    "feature1"
                ).value
            );


        const f2 =
            Number(
                document.getElementById(
                    "feature2"
                ).value
            );


        const category =
            document.getElementById(
                "category"
            ).value;


        /*
            Validate
        */

        if (
            document.getElementById(
                "feature1"
            ).value === "" ||

            document.getElementById(
                "feature2"
            ).value === ""
        ) {

            alert(
                "Please enter both features."
            );

            return;

        }


        /*
            Add to dataset
        */

        dataset.push({

            f1: f1,

            f2: f2,

            category: category

        });


        /*
            Clear inputs
        */

        document.getElementById(
            "feature1"
        ).value = "";

        document.getElementById(
            "feature2"
        ).value = "";


        /*
            Update table
        */

        renderDataset();

    }
);



/* =========================================
   CLEAR DATA
========================================= */

clearDataBtn.addEventListener(
    "click",
    function() {

        dataset = [];

        renderDataset();

    }
);



/* =========================================
   DISPLAY DATA
========================================= */

function renderDataset() {

    dataTable.innerHTML = "";


    dataset.forEach(
        (item, index) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${item.f1}
                </td>

                <td>
                    ${item.f2}
                </td>

                <td>
                    ${
                        item.category === "A"
                        ? "🔵 Category A"
                        : "🟠 Category B"
                    }
                </td>

                <td>

                    <button
                        class="delete-row"
                        onclick="deleteData(${index})"
                    >
                        Delete
                    </button>

                </td>

            `;


            dataTable.appendChild(row);

        }
    );


    dataCount.textContent =
        `${dataset.length} examples`;

}



/* =========================================
   DELETE ONE ROW
========================================= */

function deleteData(index) {

    dataset.splice(index, 1);

    renderDataset();

}



/* =========================================
   STEP 1 → STEP 2
========================================= */

continueExploreBtn.addEventListener(
    "click",
    function() {

        if (dataset.length < 2) {

            alert(
                "Please add at least 2 training examples."
            );

            return;

        }


        /*
            Need both categories
            for meaningful prediction.
        */

        const hasA =
            dataset.some(
                item => item.category === "A"
            );

        const hasB =
            dataset.some(
                item => item.category === "B"
            );


        if (!hasA || !hasB) {

            alert(
                "Please add at least one example from Category A and one from Category B."
            );

            return;

        }


        updateExploration();

        goToStep(2);

    }
);



/* =========================================
   EXPLORE DATA
========================================= */

function updateExploration() {

    const categoryA =
        dataset.filter(
            item => item.category === "A"
        ).length;


    const categoryB =
        dataset.filter(
            item => item.category === "B"
        ).length;


    document.getElementById(
        "totalData"
    ).textContent =
        dataset.length;


    document.getElementById(
        "categoryACount"
    ).textContent =
        categoryA;


    document.getElementById(
        "categoryBCount"
    ).textContent =
        categoryB;


    createChart(
        categoryA,
        categoryB
    );

}



/* =========================================
   CHART
========================================= */

function createChart(
    categoryA,
    categoryB
) {

    const chart =
        document.getElementById(
            "dataChart"
        );


    chart.innerHTML = "";


    const max =
        Math.max(
            categoryA,
            categoryB,
            1
        );


    const categories = [

        {
            value: categoryA,
            name: "Category A"
        },

        {
            value: categoryB,
            name: "Category B"
        }

    ];


    categories.forEach(item => {

        const bar =
            document.createElement(
                "div"
            );


        bar.className = "bar";


        const height =
            Math.max(
                30,
                (item.value / max) * 180
            );


        bar.style.height =
            height + "px";


        bar.innerHTML = `

            <span>
                ${item.value}
            </span>

            <small>
                ${item.name}
            </small>

        `;


        chart.appendChild(bar);

    });

}



/* =========================================
   STEP 2 → STEP 3
========================================= */

trainStepBtn.addEventListener(
    "click",
    function() {

        goToStep(3);

    }
);



/* =========================================
   BACK TO DATA
========================================= */

backToDataBtn.addEventListener(
    "click",
    function() {

        goToStep(1);

    }
);



/* =========================================
   TRAIN AI
========================================= */

trainBtn.addEventListener(
    "click",
    function() {

        if (dataset.length < 2) {

            alert(
                "Please provide training data first."
            );

            goToStep(1);

            return;

        }


        trainBtn.disabled = true;


        document
            .getElementById("brain")
            .classList.add("learning");


        document
            .getElementById("trainingLog")
            .classList.remove("hidden");


        const trainingBar =
            document.getElementById(
                "trainingBar"
            );


        const percentage =
            document.getElementById(
                "trainingPercentage"
            );


        const title =
            document.getElementById(
                "trainingTitle"
            );


        const text =
            document.getElementById(
                "trainingText"
            );


        title.textContent =
            "AI is learning...";


        text.textContent =
            "Analyzing your training examples...";


        let progress = 0;


        const interval =
            setInterval(function() {

                progress += 2;


                trainingBar.style.width =
                    progress + "%";


                percentage.textContent =
                    progress + "%";


                /*
                    Change explanation
                    during training
                */

                if (progress === 30) {

                    text.textContent =
                        "Finding patterns...";

                }


                if (progress === 60) {

                    text.textContent =
                        "Comparing categories...";

                }


                if (progress === 85) {

                    text.textContent =
                        "Building the prediction model...";

                }


                if (progress >= 100) {

                    clearInterval(interval);


                    aiTrained = true;


                    document
                        .getElementById("brain")
                        .classList.remove(
                            "learning"
                        );


                    title.textContent =
                        "Training Complete!";


                    text.textContent =
                        "The AI has learned from your data.";


                    document
                        .getElementById(
                            "trainingComplete"
                        )
                        .classList.remove(
                            "hidden"
                        );

                }

            }, 60);

    }
);



/* =========================================
   STEP 3 → STEP 4
========================================= */

predictionStepBtn.addEventListener(
    "click",
    function() {

        goToStep(4);

    }
);



/* =========================================
   PREDICTION
========================================= */

predictBtn.addEventListener(
    "click",
    function() {

        if (!aiTrained) {

            alert(
                "Please train the AI first."
            );

            return;

        }


        const f1Input =
            document.getElementById(
                "predictFeature1"
            );


        const f2Input =
            document.getElementById(
                "predictFeature2"
            );


        if (
            f1Input.value === "" ||
            f2Input.value === ""
        ) {

            alert(
                "Please enter both features."
            );

            return;

        }


        const f1 =
            Number(f1Input.value);


        const f2 =
            Number(f2Input.value);


        /*
            Separate the data
        */

        const categoryA =
            dataset.filter(
                item =>
                    item.category === "A"
            );


        const categoryB =
            dataset.filter(
                item =>
                    item.category === "B"
            );


        /*
            Calculate the center
            of each category.
        */

        const centerA =
            calculateAverage(categoryA);


        const centerB =
            calculateAverage(categoryB);


        /*
            Calculate distance
            from new data to
            each category.
        */

        const distanceA =
            calculateDistance(
                f1,
                f2,
                centerA
            );


        const distanceB =
            calculateDistance(
                f1,
                f2,
                centerB
            );


        /*
            AI prediction
        */

        let prediction;


        if (distanceA <= distanceB) {

            prediction = "A";

        } else {

            prediction = "B";

        }


        showPrediction(
            prediction,
            distanceA,
            distanceB
        );

    }
);



/* =========================================
   AVERAGE
========================================= */

function calculateAverage(data) {

    if (data.length === 0) {

        return {
            f1: 0,
            f2: 0
        };

    }


    let totalF1 = 0;

    let totalF2 = 0;


    data.forEach(item => {

        totalF1 += item.f1;

        totalF2 += item.f2;

    });


    return {

        f1:
            totalF1 / data.length,

        f2:
            totalF2 / data.length

    };

}



/* =========================================
   DISTANCE
========================================= */

function calculateDistance(
    f1,
    f2,
    center
) {

    return Math.sqrt(

        Math.pow(
            f1 - center.f1,
            2
        )

        +

        Math.pow(
            f2 - center.f2,
            2
        )

    );

}



/* =========================================
   SHOW RESULT
========================================= */

function showPrediction(
    prediction,
    distanceA,
    distanceB
) {

    const label =
        document.getElementById(
            "predictionLabel"
        );


    const explanation =
        document.getElementById(
            "predictionExplanation"
        );


    const result =
        document.getElementById(
            "predictionResult"
        );


    label.textContent =
        prediction === "A"
        ? "🔵 Category A"
        : "🟠 Category B";


    explanation.innerHTML = `

        The AI compared your new data
        with the patterns it learned.

        <br><br>

        <strong>
            Prediction:
            Category ${prediction}
        </strong>

    `;


    /*
        Show decision information
    */

    document
        .getElementById("decisionBox")
        .classList.remove("hidden");


    document.getElementById(
        "distanceA"
    ).textContent =
        `Distance: ${distanceA.toFixed(2)}`;


    document.getElementById(
        "distanceB"
    ).textContent =
        `Distance: ${distanceB.toFixed(2)}`;


    /*
        Change result icon
    */

    document.querySelector(
        ".result-icon"
    ).textContent = "🎯";


    /*
        Small animation
    */

    result.animate(
        [
            {
                transform: "scale(0.95)",
                opacity: 0.5
            },

            {
                transform: "scale(1)",
                opacity: 1
            }
        ],
        {
            duration: 400
        }
    );

}



/* =========================================
   RESTART
========================================= */

restartBtn.addEventListener(
    "click",
    function() {

        dataset = [];

        aiTrained = false;


        renderDataset();


        dataForm.classList.add(
            "hidden"
        );


        dataPreview.classList.add(
            "hidden"
        );


        document.getElementById(
            "trainingBar"
        ).style.width = "0%";


        document.getElementById(
            "trainingPercentage"
        ).textContent = "0%";


        document.getElementById(
            "trainingComplete"
        ).classList.add(
            "hidden"
        );


        document.getElementById(
            "trainingLog"
        ).classList.add(
            "hidden"
        );


        document.getElementById(
            "decisionBox"
        ).classList.add(
            "hidden"
        );


        document.getElementById(
            "predictionLabel"
        ).textContent = "?";


        document.getElementById(
            "predictionExplanation"
        ).textContent =
            'Enter new data and click "Ask AI to Predict".';


        document.querySelector(
            ".result-icon"
        ).textContent = "🤖";


        document.getElementById(
            "brain"
        ).classList.remove(
            "learning"
        );


        trainBtn.disabled = false;


        goToStep(1);

    }
);



/* =========================================
   START
========================================= */

goToStep(1);