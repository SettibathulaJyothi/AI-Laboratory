/* =========================================
   MACHINE LEARNING INTERACTIVE DEMO
========================================= */


const inputCanvas =
    document.getElementById("inputCanvas");

const outputCanvas =
    document.getElementById("outputCanvas");

const inputCtx =
    inputCanvas.getContext("2d");

const outputCtx =
    outputCanvas.getContext("2d");


const trainBtn =
    document.getElementById("trainBtn");

const addBtn =
    document.getElementById("addBtn");

const resetBtn =
    document.getElementById("resetBtn");

const clusterSlider =
    document.getElementById("clusterSlider");

const clusterValue =
    document.getElementById("clusterValue");

const legend =
    document.getElementById("legend");

const resultMessage =
    document.getElementById("resultMessage");

const trainingText =
    document.getElementById("trainingText");

const progressBox =
    document.getElementById("progressBox");

const progressBar =
    document.getElementById("progressBar");

const progressPercent =
    document.getElementById("progressPercent");

const gear =
    document.getElementById("gear");


/* =========================================
   COLORS
========================================= */

const colors = [

    "#ef4444",

    "#22b66b",

    "#2474e8",

    "#f59e0b",

    "#9b51e0"

];


/* =========================================
   DATA
========================================= */

let points = [];

let trainedPoints = [];

let isTraining = false;


/* =========================================
   CREATE INITIAL DATA
========================================= */

function createInitialData() {

    points = [];

    /*
       Three natural groups are created.
       Students can see that the data has
       hidden patterns even though there
       are no labels.
    */

    createGroup(2.5, 3.5, 38);

    createGroup(5.2, 7.0, 38);

    createGroup(7.6, 3.2, 38);

    drawInput();

    drawOutput();

    updateLegend();

}


function createGroup(cx, cy, amount) {

    for(let i = 0; i < amount; i++) {

        let x =
            cx +
            randomGaussian() * 0.9;

        let y =
            cy +
            randomGaussian() * 0.9;

        x = Math.max(0.5, Math.min(9.5, x));

        y = Math.max(0.5, Math.min(9.5, y));

        points.push({

            x: x,

            y: y,

            cluster: null

        });

    }

}


/* =========================================
   RANDOM GAUSSIAN
========================================= */

function randomGaussian() {

    let u = 0;
    let v = 0;

    while(u === 0)
        u = Math.random();

    while(v === 0)
        v = Math.random();

    return Math.sqrt(
        -2.0 * Math.log(u)
    ) *
    Math.cos(
        2.0 * Math.PI * v
    );

}


/* =========================================
   CANVAS GRAPH
========================================= */

function setupCanvas(ctx, canvas) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    /*
       Background
    */

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
       Grid
    */

    ctx.strokeStyle = "#e5e9f2";

    ctx.lineWidth = 1;

    for(let i = 0; i <= 10; i++) {

        let x =
            45 +
            i *
            ((canvas.width - 65) / 10);

        let y =
            20 +
            i *
            ((canvas.height - 65) / 10);


        ctx.beginPath();

        ctx.moveTo(
            x,
            20
        );

        ctx.lineTo(
            x,
            canvas.height - 45
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            45,
            canvas.height - y + 20
        );

        ctx.lineTo(
            canvas.width - 20,
            canvas.height - y + 20
        );

        ctx.stroke();

    }


    /*
       Axes
    */

    ctx.strokeStyle = "#667085";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
        45,
        20
    );

    ctx.lineTo(
        45,
        canvas.height - 45
    );

    ctx.lineTo(
        canvas.width - 20,
        canvas.height - 45
    );

    ctx.stroke();


    /*
       Axis labels
    */

    ctx.fillStyle = "#667085";

    ctx.font = "13px Arial";

    for(let i = 0; i <= 10; i += 2) {

        let x =
            45 +
            i *
            ((canvas.width - 65) / 10);

        let y =
            canvas.height -
            45 -
            i *
            ((canvas.height - 65) / 10);


        ctx.fillText(
            i,
            x - 4,
            canvas.height - 25
        );

        ctx.fillText(
            i,
            22,
            y + 5
        );

    }

}


/* =========================================
   CONVERT DATA → CANVAS
========================================= */

function toCanvasX(x, canvas) {

    return (
        45 +
        x *
        ((canvas.width - 65) / 10)
    );

}


function toCanvasY(y, canvas) {

    return (
        canvas.height -
        45 -
        y *
        ((canvas.height - 65) / 10)
    );

}


/* =========================================
   DRAW INPUT
========================================= */

function drawInput() {

    setupCanvas(
        inputCtx,
        inputCanvas
    );


    points.forEach(point => {

        let x =
            toCanvasX(
                point.x,
                inputCanvas
            );

        let y =
            toCanvasY(
                point.y,
                inputCanvas
            );


        inputCtx.beginPath();

        inputCtx.arc(
            x,
            y,
            4,
            0,
            Math.PI * 2
        );


        /*
           Before training everything
           looks the same.
        */

        inputCtx.fillStyle =
            "#3f78df";

        inputCtx.fill();

    });

}


/* =========================================
   DRAW OUTPUT
========================================= */

function drawOutput() {

    setupCanvas(
        outputCtx,
        outputCanvas
    );


    trainedPoints.forEach(point => {

        let x =
            toCanvasX(
                point.x,
                outputCanvas
            );

        let y =
            toCanvasY(
                point.y,
                outputCanvas
            );


        outputCtx.beginPath();

        outputCtx.arc(
            x,
            y,
            5,
            0,
            Math.PI * 2
        );


        let cluster =
            point.cluster ?? 0;


        outputCtx.fillStyle =
            colors[
                cluster %
                colors.length
            ];


        outputCtx.fill();

    });

}


/* =========================================
   K-MEANS STYLE LEARNING
========================================= */

function trainModel() {

    if(isTraining)
        return;

    isTraining = true;

    trainBtn.disabled = true;

    gear.classList.add("training");

    progressBox.classList.remove(
        "hidden"
    );

    trainingText.textContent =
        "AI is looking for patterns...";

    let clusterCount =
        Number(
            clusterSlider.value
        );


    /*
       Copy data.
    */

    trainedPoints =
        points.map(p => ({
            x: p.x,
            y: p.y,
            cluster: null
        }));


    /*
       Create initial centroids.
    */

    let centroids =
        [];


    for(
        let i = 0;
        i < clusterCount;
        i++
    ) {

        let randomPoint =
            trainedPoints[
                Math.floor(
                    Math.random() *
                    trainedPoints.length
                )
            ];


        centroids.push({

            x: randomPoint.x,

            y: randomPoint.y

        });

    }


    let iteration = 0;

    const maxIterations = 8;


    function iterationStep() {

        iteration++;


        /*
           STEP 1
           Assign every point to
           nearest centroid.
        */

        trainedPoints.forEach(point => {

            let closest = 0;

            let smallestDistance =
                Infinity;


            centroids.forEach(
                (center, index) => {

                    let dx =
                        point.x -
                        center.x;

                    let dy =
                        point.y -
                        center.y;

                    let distance =
                        dx * dx +
                        dy * dy;


                    if(
                        distance <
                        smallestDistance
                    ) {

                        smallestDistance =
                            distance;

                        closest =
                            index;

                    }

                }
            );


            point.cluster =
                closest;

        });


        /*
           STEP 2
           Move centroids.
        */

        centroids.forEach(
            (center, index) => {

                let group =
                    trainedPoints.filter(
                        p =>
                        p.cluster === index
                    );


                if(group.length > 0) {

                    center.x =
                        group.reduce(
                            (sum, p) =>
                            sum + p.x,
                            0
                        ) /
                        group.length;


                    center.y =
                        group.reduce(
                            (sum, p) =>
                            sum + p.y,
                            0
                        ) /
                        group.length;

                }

            }
        );


        /*
           Animate progress.
        */

        let percent =
            Math.round(
                (iteration /
                maxIterations) *
                100
            );


        progressBar.style.width =
            percent + "%";

        progressPercent.textContent =
            percent + "%";


        trainingText.textContent =
            `Learning patterns... Step ${iteration} of ${maxIterations}`;


        drawOutput();


        if(
            iteration <
            maxIterations
        ) {

            setTimeout(
                iterationStep,
                450
            );

        }
        else {

            finishTraining();

        }

    }


    iterationStep();

}


/* =========================================
   FINISH TRAINING
========================================= */

function finishTraining() {

    isTraining = false;

    trainBtn.disabled = false;

    gear.classList.remove(
        "training"
    );


    trainingText.textContent =
        "🎉 Training complete!";


    resultMessage.innerHTML = `
        <span>✓</span>
        <div>
            <strong>Model trained successfully!</strong><br>
            The AI discovered ${
                clusterSlider.value
            } patterns in the data.
        </div>
    `;


    drawOutput();

    updateLegend();

}


/* =========================================
   LEGEND
========================================= */

function updateLegend() {

    let count =
        Number(
            clusterSlider.value
        );


    legend.innerHTML = "";


    for(
        let i = 0;
        i < count;
        i++
    ) {

        let item =
            document.createElement(
                "div"
            );

        item.className =
            "legend-item";


        item.innerHTML = `

            <span
                class="legend-dot"
                style="
                    background:
                    ${colors[i]};
                "
            ></span>

            Cluster ${i + 1}

        `;


        legend.appendChild(
            item
        );

    }

}


/* =========================================
   ADD RANDOM DATA
========================================= */

function addRandomPoint() {

    let point = {

        x:
            1 +
            Math.random() * 8,

        y:
            1 +
            Math.random() * 8,

        cluster: null

    };


    points.push(point);


    /*
       Existing training result becomes
       outdated when new data is added.
    */

    trainedPoints = [];


    drawInput();

    drawOutput();


    resultMessage.innerHTML = `
        <span>+</span>
        New data added.
        Train the model again!
    `;


    trainingText.textContent =
        "New data detected — train again.";

}


/* =========================================
   RESET
========================================= */

function resetApp() {

    isTraining = false;

    trainBtn.disabled = false;

    gear.classList.remove(
        "training"
    );

    progressBox.classList.add(
        "hidden"
    );

    progressBar.style.width =
        "0%";

    progressPercent.textContent =
        "0%";

    trainingText.textContent =
        "Click \"Train Model\" to let the AI learn.";

    resultMessage.innerHTML = `
        <span>✓</span>
        Train the model to discover patterns!
    `;


    createInitialData();

}


/* =========================================
   EVENTS
========================================= */

trainBtn.addEventListener(
    "click",
    trainModel
);


addBtn.addEventListener(
    "click",
    addRandomPoint
);


resetBtn.addEventListener(
    "click",
    resetApp
);


clusterSlider.addEventListener(
    "input",
    () => {

        clusterValue.textContent =
            clusterSlider.value;

        /*
           Changing clusters means the
           previous result is no longer
           considered final.
        */

        trainedPoints = [];

        drawOutput();

        updateLegend();

        resultMessage.innerHTML = `
            <span>!</span>
            Choose ${
                clusterSlider.value
            } clusters and train the model.
        `;

    }
);


/* =========================================
   START
========================================= */

createInitialData();