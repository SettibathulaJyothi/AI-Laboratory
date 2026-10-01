/* =====================================================
   MACHINE LEARNING MODEL EVALUATION LAB
   GUIDED STEP-BY-STEP VERSION
===================================================== */


/* =====================================================
   ELEMENTS
===================================================== */

const cards = {

    dataset:
        document.getElementById("dataset"),

    trainingData:
        document.getElementById("trainingData"),

    trainAlgorithm:
        document.getElementById("trainAlgorithm"),

    model:
        document.getElementById("model"),

    testingData:
        document.getElementById("testingData"),

    mlAlgorithm:
        document.getElementById("mlAlgorithm"),

    prediction:
        document.getElementById("prediction"),

    evaluation:
        document.getElementById("evaluation"),

    successfulModel:
        document.getElementById("successfulModel")

};


const resultArea =
    document.getElementById("resultArea");

const yesBtn =
    document.getElementById("yesBtn");

const noBtn =
    document.getElementById("noBtn");

const retrainLoop =
    document.getElementById("retrainLoop");

const finalMessage =
    document.getElementById("finalMessage");

const resetBtn =
    document.getElementById("resetBtn");

const explanationTitle =
    document.getElementById("explanationTitle");

const explanationText =
    document.getElementById("explanationText");

const explanationIcon =
    document.getElementById("explanationIcon");

const conceptText =
    document.getElementById("conceptText");

const currentStepLabel =
    document.getElementById("currentStepLabel");

const progressText =
    document.getElementById("progressText");


/* =====================================================
   STEP INFORMATION
===================================================== */

const stepInfo = {

    dataset: {

        step: "STEP 1",

        icon: "🗂️",

        title:
            "Start with the Dataset",

        text:
            "A dataset is a collection of examples. These examples provide the information an AI system needs to discover patterns.",

        concept:
            "AI needs examples before it can learn."

    },


    trainingData: {

        step: "STEP 2",

        icon: "📚",

        title:
            "Training Data",

        text:
            "Training data is the part of the dataset given to the machine learning algorithm so it can learn patterns and relationships.",

        concept:
            "Training data teaches the model."

    },


    trainAlgorithm: {

        step: "STEP 3",

        icon: "⚙️",

        title:
            "Train the ML Algorithm",

        text:
            "The machine learning algorithm examines the training examples and searches for useful patterns. During training, the system adjusts itself based on the data.",

        concept:
            "Training is the learning stage."

    },


    model: {

        step: "STEP 4",

        icon: "🧠",

        title:
            "The Model Has Learned",

        text:
            "After training, the learned patterns are stored in a model. The model can now use what it learned to make predictions on new data.",

        concept:
            "A trained model contains learned patterns."

    },


    testingData: {

        step: "STEP 5",

        icon: "🧪",

        title:
            "Testing Data",

        text:
            "Testing data contains examples that the model did not use during training. It helps us see how well the model works on new information.",

        concept:
            "Testing checks whether learning works on unseen examples."

    },


    mlAlgorithm: {

        step: "STEP 6",

        icon: "⚡",

        title:
            "Apply the Learned Model",

        text:
            "The trained model processes the testing example and uses the patterns it learned during training.",

        concept:
            "The model uses what it learned to analyze new data."

    },


    prediction: {

        step: "STEP 7",

        icon: "🔮",

        title:
            "Make a Prediction",

        text:
            "The model produces a prediction based on the patterns it learned from the training data.",

        concept:
            "Prediction is the model's answer."

    },


    evaluation: {

        step: "STEP 8",

        icon: "🔍",

        title:
            "Evaluate the Prediction",

        text:
            "Now we compare the model's prediction with the expected answer. This tells us whether the model performed correctly.",

        concept:
            "Evaluation measures how well the model performs."

    },


    successfulModel: {

        step: "FINAL",

        icon: "🏆",

        title:
            "Successful Model",

        text:
            "If the model produces the expected prediction, the model has successfully completed this evaluation example.",

        concept:
            "A model should be tested and evaluated before we trust its results."

    }

};


/* =====================================================
   STEP ORDER
===================================================== */

const stepOrder = [

    "dataset",
    "trainingData",
    "trainAlgorithm",
    "model",
    "testingData",
    "mlAlgorithm",
    "prediction",
    "evaluation",
    "successfulModel"

];


/* =====================================================
   STATE
===================================================== */

let currentIndex = 0;


/* =====================================================
   SHOW EXPLANATION
===================================================== */

function showExplanation(id) {

    const info = stepInfo[id];

    if (!info) return;

    explanationIcon.textContent =
        info.icon;

    explanationTitle.textContent =
        info.title;

    explanationText.textContent =
        info.text;

    conceptText.textContent =
        info.concept;

    currentStepLabel.textContent =
        info.step;


    if (id === "successfulModel") {

        progressText.textContent =
            "COMPLETE";

    } else {

        progressText.textContent =
            `${Math.min(currentIndex + 1, 8)} / 8`;

    }

}


/* =====================================================
   UNLOCK CARD
===================================================== */

function unlock(id) {

    const card = cards[id];

    if (!card) return;


    card.classList.remove(
        "locked"
    );

    card.classList.add(
        "available"
    );


    const lock =
        card.querySelector(".lock-icon");


    if (lock) {

        lock.textContent =
            "👆";

    }

}


/* =====================================================
   COMPLETE CARD
===================================================== */

function complete(id) {

    const card = cards[id];

    if (!card) return;

    card.classList.remove(
        "active"
    );

    card.classList.add(
        "completed"
    );

}


/* =====================================================
   ACTIVATE CARD
===================================================== */

function activate(id) {

    const card = cards[id];

    if (!card) return;

    card.classList.add(
        "active"
    );

    showExplanation(id);

}


/* =====================================================
   ⭐ AUTO MOVE TO NEXT STEP
===================================================== */

function goToNextStep(nextId) {

    const nextCard =
        cards[nextId];

    if (!nextCard) return;


    /*
       Small delay makes the transition
       feel natural after clicking.
    */

    setTimeout(() => {

        nextCard.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });


        /*
           Highlight the next step
           after scrolling.
        */

        setTimeout(() => {

            nextCard.classList.add(
                "active"
            );

            /*
               Remove active after a short
               highlight period.
            */

            setTimeout(() => {

                if (
                    !nextCard.classList.contains(
                        "completed"
                    )
                ) {

                    nextCard.classList.remove(
                        "active"
                    );

                }

            }, 1400);

        }, 600);

    }, 350);

}


/* =====================================================
   HANDLE CARD CLICK
===================================================== */

function handleCardClick(id) {

    const card =
        cards[id];


    /*
       Locked cards cannot be clicked.
    */

    if (
        card.classList.contains(
            "locked"
        )
    ) {

        return;

    }


    /* ================================================
       FINAL SUCCESSFUL MODEL
    ================================================ */

    if (
        id ===
        "successfulModel"
    ) {

        activate(id);

        finalMessage.classList.add(
            "show"
        );

        card.classList.add(
            "unlocked"
        );

        setTimeout(() => {

            finalMessage.scrollIntoView({

                behavior: "smooth",

                block: "center"

            });

        }, 300);

        return;

    }


    /* ================================================
       SHOW CURRENT STEP
    ================================================ */

    activate(id);


    /* ================================================
       STEP 1 → STEP 2
    ================================================ */

    if (id === "dataset") {

        complete(id);

        unlock(
            "trainingData"
        );

        currentIndex = 1;

        goToNextStep(
            "trainingData"
        );

        return;

    }


    /* ================================================
       STEP 2 → STEP 3
    ================================================ */

    if (id === "trainingData") {

        complete(id);

        unlock(
            "trainAlgorithm"
        );

        currentIndex = 2;

        goToNextStep(
            "trainAlgorithm"
        );

        return;

    }


    /* ================================================
       STEP 3 → STEP 4
    ================================================ */

    if (id === "trainAlgorithm") {

        complete(id);

        unlock(
            "model"
        );

        currentIndex = 3;

        goToNextStep(
            "model"
        );

        return;

    }


    /* ================================================
       STEP 4 → STEP 5
    ================================================ */

    if (id === "model") {

        complete(id);

        unlock(
            "testingData"
        );

        currentIndex = 4;

        goToNextStep(
            "testingData"
        );

        return;

    }


    /* ================================================
       STEP 5 → STEP 6
    ================================================ */

    if (id === "testingData") {

        complete(id);

        unlock(
            "mlAlgorithm"
        );

        currentIndex = 5;

        goToNextStep(
            "mlAlgorithm"
        );

        return;

    }


    /* ================================================
       STEP 6 → STEP 7
    ================================================ */

    if (id === "mlAlgorithm") {

        complete(id);

        unlock(
            "prediction"
        );

        currentIndex = 6;

        goToNextStep(
            "prediction"
        );

        return;

    }


    /* ================================================
       STEP 7 → STEP 8
    ================================================ */

    if (id === "prediction") {

        complete(id);

        unlock(
            "evaluation"
        );

        currentIndex = 7;

        goToNextStep(
            "evaluation"
        );

        return;

    }


    /* ================================================
       STEP 8 → EVALUATION QUESTION
    ================================================ */

    if (id === "evaluation") {

        complete(id);

        currentIndex = 8;

        resultArea.classList.add(
            "show"
        );


        /*
           Automatically move to the
           YES / NO question.
        */

        setTimeout(() => {

            resultArea.scrollIntoView({

                behavior: "smooth",

                block: "center"

            });

        }, 350);

    }

}


/* =====================================================
   ADD CLICK EVENTS
===================================================== */

Object.keys(cards).forEach(id => {

    cards[id].addEventListener(
        "click",
        () => handleCardClick(id)
    );

});


/* =====================================================
   YES — CORRECT
===================================================== */

yesBtn.addEventListener(
    "click",
    () => {

        yesBtn.style.transform =
            "scale(1.05)";

        yesBtn.style.boxShadow =
            "0 0 40px rgba(69,224,155,.35)";

        noBtn.style.opacity =
            ".35";


        retrainLoop.classList.remove(
            "show"
        );


        /*
           Show success after a
           small animation.
        */

        setTimeout(() => {

            unlock(
                "successfulModel"
            );

            cards.successfulModel.classList.add(
                "unlocked"
            );


            showExplanation(
                "successfulModel"
            );


            /*
               Automatically move to
               Successful Model.
            */

            cards.successfulModel.scrollIntoView({

                behavior: "smooth",

                block: "center"

            });


            setTimeout(() => {

                finalMessage.classList.add(
                    "show"
                );

            }, 700);


        }, 500);

    }
);


/* =====================================================
   NO — INCORRECT
===================================================== */

noBtn.addEventListener(
    "click",
    () => {

        noBtn.style.transform =
            "scale(1.05)";

        noBtn.style.boxShadow =
            "0 0 40px rgba(255,111,125,.3)";

        yesBtn.style.opacity =
            ".35";


        /*
           Explanation
        */

        explanationIcon.textContent =
            "🔄";

        explanationTitle.textContent =
            "The Model Needs More Training";

        explanationText.textContent =
            "The prediction was not correct. The model can be improved by returning to training and learning from more or better examples.";

        conceptText.textContent =
            "Wrong prediction → improve training → test again.";


        /*
           Show loop.
        */

        retrainLoop.classList.add(
            "show"
        );


        /*
           Unlock training again.
        */

        unlock(
            "trainAlgorithm"
        );


        /*
           Remove previous success.
        */

        finalMessage.classList.remove(
            "show"
        );


        cards.successfulModel.classList.remove(
            "available",
            "unlocked"
        );

        cards.successfulModel.classList.add(
            "locked"
        );


        /*
           Automatically move back
           to training.
        */

        setTimeout(() => {

            cards.trainAlgorithm.scrollIntoView({

                behavior: "smooth",

                block: "center"

            });


            cards.trainAlgorithm.classList.add(
                "active"
            );


        }, 500);

    }
);


/* =====================================================
   RESET
===================================================== */

resetBtn.addEventListener(
    "click",
    resetExperiment
);


function resetExperiment() {

    currentIndex = 0;


    Object.keys(cards).forEach(id => {

        const card =
            cards[id];


        card.classList.remove(
            "active",
            "completed",
            "available",
            "unlocked"
        );


        card.classList.add(
            "locked"
        );


        const lock =
            card.querySelector(
                ".lock-icon"
            );


        if (lock) {

            lock.textContent =
                "🔒";

        }

    });


    /*
       Dataset is the starting point.
    */

    cards.dataset.classList.remove(
        "locked"
    );

    cards.dataset.classList.add(
        "available"
    );


    /*
       Hide evaluation.
    */

    resultArea.classList.remove(
        "show"
    );


    retrainLoop.classList.remove(
        "show"
    );


    finalMessage.classList.remove(
        "show"
    );


    /*
       Reset answer buttons.
    */

    yesBtn.style.transform = "";

    yesBtn.style.boxShadow = "";

    yesBtn.style.opacity = "1";


    noBtn.style.transform = "";

    noBtn.style.boxShadow = "";

    noBtn.style.opacity = "1";


    /*
       Reset explanation.
    */

    showExplanation(
        "dataset"
    );


    /*
       Go to top.
    */

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =====================================================
   INITIAL STATE
===================================================== */

showExplanation(
    "dataset"
);