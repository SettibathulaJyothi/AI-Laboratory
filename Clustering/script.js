/* =========================================================
   MYSTERY CREATURE CLUSTERING LAB
   STABLE VERSION
========================================================= */


/* =========================================================
   CREATURE DATA
========================================================= */

const creatures = [

    {
        id: 1,
        name: "Garden Lizard",
        type: "Reptile",
        size: 3,
        legs: 4,
        wings: 0,
        body: 4,
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/(Calotes%20versicolor)%20Garden%20Lizard%20at%20Madhurawada.jpg",
        description: "A common garden lizard with four legs and an elongated body."
    },

    {
        id: 2,
        name: "House Gecko",
        type: "Reptile",
        size: 2,
        legs: 4,
        wings: 0,
        body: 3,
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Common%20gecko%20lizard%20(2014).jpg",
        description: "A small gecko commonly seen around buildings and walls."
    },

    {
        id: 3,
        name: "Chameleon",
        type: "Reptile",
        size: 3,
        legs: 4,
        wings: 0,
        body: 4,
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chameleon%20(India,%202015).jpg",
        description: "A reptile with four legs and an unusual body shape."
    },

    {
        id: 4,
        name: "Indian Python",
        type: "Reptile",
        size: 5,
        legs: 0,
        wings: 0,
        body: 5,
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Python%20molurus.jpg",
        description: "A large snake with a long body and no legs."
    },

    {
        id: 5,
        name: "Green Keelback",
        type: "Reptile",
        size: 4,
        legs: 0,
        wings: 0,
        body: 5,
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Green%20Keelback%20(Macropisthodon%20plumbicolor).jpg",
        description: "A green snake with an elongated body."
    },

    {
        id: 6,
        name: "Wolf Snake",
        type: "Reptile",
        size: 4,
        legs: 0,
        wings: 0,
        body: 5,
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Common%20Wolf%20Snake%20Lycodon%20aulicus%20(Linnaeus,%201758)%20DSCN0389%2005.jpg",
        description: "A slender snake with a long body and no legs."
    },

    {
        id: 7,
        name: "Praying Mantis",
        type: "Insect",
        size: 2,
        legs: 6,
        wings: 2,
        body: 3,
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Closeup%20shot%20of%20Small%20Brown%20Praying%20Mantis.jpg",
        description: "An insect with six legs and powerful front legs."
    },

    {
        id: 8,
        name: "Blister Beetle",
        type: "Insect",
        size: 2,
        legs: 6,
        wings: 2,
        body: 2,
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Blister%20Beetle%20(48919636782).jpg",
        description: "A beetle with six legs and a compact body."
    },

    {
        id: 9,
        name: "Dragonfly",
        type: "Insect",
        size: 2,
        legs: 6,
        wings: 4,
        body: 3,
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Eastern%20Amberwing%20(Perithemis%20tenera).jpg",
        description: "A flying insect with six legs and four wings."
    },

    {
        id: 10,
        name: "Butterfly",
        type: "Insect",
        size: 2,
        legs: 6,
        wings: 4,
        body: 3,
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Butterfly.jpg",
        description: "A colourful winged insect with six legs."
    },

    {
        id: 11,
        name: "Ant",
        type: "Insect",
        size: 1,
        legs: 6,
        wings: 0,
        body: 2,
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ant%20on%20flower.jpg",
        description: "A small social insect with six legs."
    },

    {
        id: 12,
        name: "Cuckoo Bee",
        type: "Insect",
        size: 2,
        legs: 6,
        wings: 2,
        body: 2,
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Cuckoo%20Bee%20(Thyreus%20species)%20W%20IMG%204228.jpg",
        description: "A bee with six legs and wings."
    }

];


/* =========================================================
   VARIABLES
========================================================= */

let currentCreatures = [...creatures];

let clusterCount = 2;

let trained = false;

let assignments = {};

let challengeIndex = 0;

let challengeScore = 0;

let challengeAnswered = false;

let challengeCreatureData = null;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const grid = document.getElementById("creatureGrid");

const trainBtn = document.getElementById("trainBtn");

const addBtn = document.getElementById("addBtn");

const resetBtn = document.getElementById("resetBtn");

const slider = document.getElementById("clusterSlider");

const clusterValue = document.getElementById("clusterValue");

const clusters = document.getElementById("clusters");

const status = document.getElementById("status");


/* =========================================================
   INITIALIZE
========================================================= */

renderCreatures();

showWaitingMessage();

showChallengeWaiting();


/* =========================================================
   SLIDER
========================================================= */

slider.addEventListener("input", function () {

    clusterCount = Number(this.value);

    clusterValue.textContent = clusterCount;

    trained = false;

    assignments = {};
    challengeCreatureData = null;

    status.textContent =
        "🟠 Cluster number changed — train AI again";

    showWaitingMessage();

    showChallengeWaiting();

});


/* =========================================================
   RENDER CREATURES
========================================================= */

function renderCreatures() {

    grid.innerHTML = "";

    currentCreatures.forEach(creature => {

        const card = document.createElement("div");

        card.className = "creature";

        card.dataset.id = creature.id;

        card.innerHTML = `

            <img
                src="${creature.image}"
                alt="${creature.name}"
                loading="lazy"
            >

            <div class="creature-info">

                <div class="creature-name">
                    ${creature.name}
                </div>

                <div class="creature-type">
                    ${creature.type}
                </div>

            </div>

        `;

        if (assignments[creature.id] !== undefined) {

            const tag = document.createElement("div");

            tag.className = "cluster-tag";

            tag.textContent =
                "Group " + (assignments[creature.id] + 1);

            card.appendChild(tag);

        }

        card.addEventListener("click", function () {

            openCreature(creature);

        });

        grid.appendChild(card);

    });

}


/* =========================================================
   WAITING MESSAGE
========================================================= */

function showWaitingMessage() {

    clusters.innerHTML = `

        <div class="empty-result">

            <div>👀</div>

            <h3>Waiting for AI...</h3>

            <p>
                Click <b>Train AI</b>
                to discover hidden patterns.
            </p>

        </div>

    `;

}


/* =========================================================
   NORMALIZE FEATURES
========================================================= */

function normalize(value, min, max) {

    return (value - min) / (max - min);

}


function getFeatures(creature) {

    return [

        normalize(creature.size, 1, 5),

        normalize(creature.legs, 0, 6),

        normalize(creature.wings, 0, 4),

        normalize(creature.body, 2, 5)

    ];

}


/* =========================================================
   DISTANCE
========================================================= */

function distance(a, b) {

    let total = 0;

    const weights = [
        1,
        1.5,
        1.5,
        1
    ];

    for (let i = 0; i < a.length; i++) {

        const difference = a[i] - b[i];

        total +=
            difference *
            difference *
            weights[i];

    }

    return Math.sqrt(total);

}


/* =========================================================
   CREATE INITIAL CENTROIDS
========================================================= */

function createCentroids(data) {

    const centroids = [];

    /*
        Select evenly separated data points.
        This makes 2, 3 and 4 clusters stable.
    */

    for (let i = 0; i < clusterCount; i++) {

        const position =
            Math.floor(
                i *
                (data.length - 1) /
                (clusterCount - 1)
            );

        centroids.push(
            [...data[position].features]
        );

    }

    return centroids;

}


/* =========================================================
   RUN CLUSTERING
========================================================= */

function runClustering() {

    assignments = {};

    const data =
        currentCreatures.map(creature => {

            return {

                creature: creature,

                features:
                    getFeatures(creature)

            };

        });


    if (!data.length)
        return;


    let centroids =
        createCentroids(data);


    /*
        K-MEANS ITERATIONS
    */

    for (let iteration = 0; iteration < 30; iteration++) {

        const groups =
            Array.from(
                { length: clusterCount },
                () => []
            );


        /*
            STEP 1:
            Assign each creature
            to nearest centroid.
        */

        data.forEach(item => {

            let nearestGroup = 0;

            let nearestDistance = Infinity;


            centroids.forEach(
                (centroid, index) => {

                    const d =
                        distance(
                            item.features,
                            centroid
                        );


                    if (d < nearestDistance) {

                        nearestDistance = d;

                        nearestGroup = index;

                    }

                }
            );


            assignments[
                item.creature.id
            ] = nearestGroup;


            groups[
                nearestGroup
            ].push(item);

        });


        /*
            STEP 2:
            Recalculate centroids.
        */

        groups.forEach(
            (group, index) => {

                if (!group.length)
                    return;


                const newCenter =
                    [0, 0, 0, 0];


                group.forEach(item => {

                    for (
                        let i = 0;
                        i < 4;
                        i++
                    ) {

                        newCenter[i] +=
                            item.features[i];

                    }

                });


                for (
                    let i = 0;
                    i < 4;
                    i++
                ) {

                    newCenter[i] /=
                        group.length;

                }


                centroids[index] =
                    newCenter;

            }
        );

    }

}


/* =========================================================
   AVERAGE
========================================================= */

function average(group, property) {

    if (!group.length)
        return 0;

    let total = 0;

    group.forEach(creature => {

        total += creature[property];

    });

    return total / group.length;

}


/* =========================================================
   DESCRIBE GROUP
========================================================= */

function describeGroup(group) {

    if (!group.length) {

        return {
            title: "No creatures",
            clues: []
        };

    }


    const legs =
        average(group, "legs");

    const wings =
        average(group, "wings");
    const size =
        average(group, "size");
    const body =
        average(group, "body");

    const clues = [];


    /* LEGS */

    if (legs < 1) {

        clues.push("🐍 No legs");

    }

    else if (legs >= 5) {

        clues.push("🦵 Six legs");

    }

    else if (legs >= 3) {

        clues.push("🦎 Four legs");

    }


    /* WINGS */

    if (wings >= 3) {

        clues.push("🪽 Four wings");

    }

    else if (wings >= 1) {

        clues.push("🪽 Wings present");

    }

    else {

        clues.push("🚫 No wings");

    }


    /* SIZE */

    if (size >= 4) {

        clues.push("📏 Larger size");

    }

    else if (size <= 1.5) {

        clues.push("🔎 Smaller size");

    }

    else {

        clues.push("📏 Medium size");

    }


    /* BODY */

    if (body >= 4.5) {

        clues.push("〰️ Long body");

    }

    else if (body <= 2.5) {

        clues.push("⭕ Compact body");

    }

    else {

        clues.push("〰️ Medium body");

    }


    let title = "Mixed visual features";


    if (
        legs < 1 &&
        body >= 4
    ) {

        title =
            "🐍 Legless long-bodied creatures";

    }

    else if (
        legs >= 5 &&
        wings >= 3
    ) {

        title =
            "🪽 Winged six-legged creatures";

    }

    else if (
        legs >= 5 &&
        wings < 1
    ) {

        title =
            "🐜 Six-legged creatures without wings";

    }

    else if (
        legs >= 3 &&
        legs < 5 &&
        wings < 1
    ) {

        title =
            "🦎 Four-legged creatures without wings";

    }


    return {

        title: title,

        clues: clues

    };

}


/* =========================================================
   SHOW GROUPS
========================================================= */

function showClusters() {

    clusters.innerHTML = "";


    const groups =
        Array.from(
            { length: clusterCount },
            () => []
        );


    currentCreatures.forEach(creature => {

        const groupNumber =
            assignments[creature.id];


        if (
            groupNumber !== undefined
        ) {

            groups[groupNumber].push(
                creature
            );

        }

    });


    groups.forEach(
        (group, index) => {

            const box =
                document.createElement("div");

            box.className =
                "cluster";


            const description =
                describeGroup(group);


            box.innerHTML = `

                <h3>
                    🔵 Discovered Group ${index + 1}
                </h3>

                <p>
                    <b>${group.length}</b>
                    creature${group.length !== 1 ? "s" : ""}
                    discovered
                </p>

                <div
                    style="
                        margin:12px 0;
                        padding:12px;
                        border-radius:14px;
                        background:rgba(103,232,249,.08);
                        border:1px solid rgba(103,232,249,.15);
                    "
                >

                    <strong>
                        🤖 AI noticed:
                    </strong>

                    <div
                        style="
                            margin-top:6px;
                            color:#67e8f9;
                            font-weight:bold;
                        "
                    >
                        ${description.title}
                    </div>

                </div>

                <div
                    style="
                        display:flex;
                        flex-wrap:wrap;
                        gap:7px;
                        margin-bottom:15px;
                    "
                >

                    ${description.clues.map(
                        clue => `

                            <span
                                style="
                                    padding:7px 10px;
                                    border-radius:20px;
                                    background:#1e293b;
                                    color:#cbd5e1;
                                    font-size:12px;
                                "
                            >
                                ${clue}
                            </span>

                        `
                    ).join("")}

                </div>

                <div class="cluster-creatures">

                    ${
                        group.length
                        ?
                        group.map(creature => `

                            <div
                                class="mini-creature"
                                title="${creature.name}"
                                onclick="openCreatureById(${creature.id})"
                            >

                                <img
                                    src="${creature.image}"
                                    alt="${creature.name}"
                                >

                            </div>

                        `).join("")
                        :
                        `
                            <p>
                                No creatures discovered
                                in this group.
                            </p>
                        `
                    }

                </div>

            `;


            clusters.appendChild(box);

        }
    );

}


/* =========================================================
   TRAIN AI
========================================================= */

function trainModel() {

    status.textContent =
        "🟡 AI is studying creature features...";
    trainBtn.disabled = true;

    setTimeout(function () {
        runClustering();
        trained = true;

        status.textContent = `🟢 AI discovered ${clusterCount} groups!`;
        trainBtn.disabled = false;

        renderCreatures();
        showClusters();
        startChallenges();
    }, 1200);
}


/* =========================================================
   TRAIN BUTTON
========================================================= */

trainBtn.addEventListener(
    "click",
    trainModel
);


/* =========================================================
   ADD CREATURE
========================================================= */

addBtn.addEventListener(
    "click",
    function () {

        const available =
            creatures.filter(
                creature =>
                    !currentCreatures.some(
                        existing =>
                            existing.id ===
                            creature.id
                    )
            );


        if (!available.length) {

            alert(
                "All creatures are already in the lab! 🐍🦎🪲"
            );

            return;

        }


        const randomCreature =
            available[
                Math.floor(
                    Math.random() *
                    available.length
                )
            ];


        currentCreatures.push(
            randomCreature
        );

        trained = false;
        assignments = {};
        challengeCreatureData = null;

        status.textContent = "🟠 New creature added — retrain AI";

        renderCreatures();
        showWaitingMessage();
        showChallengeWaiting();

    }
);


/* =========================================================
   RESET
========================================================= */

resetBtn.addEventListener(
    "click",
    function () {

        currentCreatures =
            [...creatures];

        trained = false;
        assignments = {};
        challengeIndex = 0;
        challengeScore = 0;
        challengeAnswered = false;
        challengeCreatureData = null;

        status.textContent = "🔴 Model not trained";

        renderCreatures();
        showWaitingMessage();
        showChallengeWaiting();

    }
);


/* =========================================================
   MODAL
========================================================= */

const modal =
    document.getElementById("modal");

const modalImage =
    document.getElementById("modalImage");

const modalName =
    document.getElementById("modalName");

const modalDescription =
    document.getElementById("modalDescription");

const modalFeatures =
    document.getElementById("modalFeatures");

const closeModal =
    document.getElementById("closeModal");


function openCreature(creature) {

    modalImage.src =
        creature.image;

    modalImage.alt =
        creature.name;

    modalName.textContent =
        creature.name;

    modalDescription.textContent =
        creature.description;

    modalFeatures.innerHTML = `

        <span>
            📏 Size: ${creature.size}
        </span>

        <span>
            🦵 Legs: ${creature.legs}
        </span>

        <span>
            🪽 Wings: ${creature.wings}
        </span>

        <span>
            🐾 Body score: ${creature.body}
        </span>

    `;

    modal.classList.add("show");
}

function openCreatureById(id) {

    const creature =
        currentCreatures.find(
            item => item.id === id
        );


    if (creature) {

        openCreature(creature);
    }
}

closeModal.addEventListener(
    "click",
    function () {

        modal.classList.remove("show");
    }
);

modal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === modal
        ) {

            modal.classList.remove(
                "show"
            );

        }
    }
);


/* =========================================================
   CHALLENGE DATA
========================================================= */

const challenges = [

    {
        title:
            "🤔 Which group will this creature belong to?"
    },

    {
        title:
            "🔍 Which group has the most similar features?"
    },

    {
        title:
            "🧠 Can you predict the AI's grouping?"
    },

    {
        title:
            "🆕 A new creature appeared! Where will AI place it?"
    },

    {
        title:
            "🕵️ Look at the clues! Which group matches?"
    },

    {
        title:
            "🏆 AI Detective Master Challenge!"
    }

];


/* =========================================================
   CHALLENGE WAITING STATE
========================================================= */

function showChallengeWaiting() {

    document.getElementById(
        "challengeNumber"
    ).textContent =
        "Challenge 1 of 6";


    document.getElementById(
        "score"
    ).textContent =
        "⭐ Score: 0";


    document.getElementById(
        "progressFill"
    ).style.width =
        "16.66%";


    document.getElementById(
        "challengeQuestion"
    ).innerHTML = `

        <h3>
            🤖 Train the AI to begin the challenge!
        </h3>

        <p
            style="
                color:#94a3b8;
            "
        >
            First let the AI discover the creature groups.
        </p>

    `;

    document.getElementById(
        "challengeCreature"
    ).innerHTML = `

        <div
            style="
                font-size:80px;
                padding:25px;
            "
        >
            🧠
        </div>

    `;

    document.getElementById(
        "challengeButtons"
    ).innerHTML = "";


    document.getElementById(
        "challengeResult"
    ).innerHTML = `

        <p>
            After training, six Creature Detective
            challenges will appear here.
        </p>

    `;

    document.getElementById(
        "nextChallenge"
    ).style.display =
        "none";


    document.getElementById(
        "finalScore"
    ).style.display =
        "none";


}


/* =========================================================
   START CHALLENGES
========================================================= */

function startChallenges() {

    challengeIndex = 0;

    challengeScore = 0;

    challengeAnswered = false;

    challengeCreatureData = null;

    showChallenge();
}


/* =========================================================
   SHOW CHALLENGE
========================================================= */

function showChallenge() {

    if (!trained)
        return;


    const challenge =
        challenges[challengeIndex];


    let options =
        currentCreatures;


    if (
        currentCreatures.length > 1 &&
        challengeCreatureData
    ) {

        options =
            currentCreatures.filter(
                creature =>
                    creature.id !==
                    challengeCreatureData.id
            );

    }


    const randomIndex =
        Math.floor(
            Math.random() *
            options.length
        );


    challengeCreatureData =
        options[randomIndex];


    const correctGroup =
        assignments[
            challengeCreatureData.id
        ];


    document.getElementById("challengeNumber").textContent =
        `Challenge ${challengeIndex + 1} of 6`;


    document.getElementById("score").textContent =
        `⭐ Score: ${challengeScore}`;


    document.getElementById("progressFill").style.width =
        `${((challengeIndex + 1) / 6) * 100}%`;


    document.getElementById("challengeQuestion").innerHTML = `

        <h3>
            ${challenge.title}
        </h3>

    `;


    document.getElementById("challengeCreature").innerHTML = `

        <div class="challenge-creature">
            <img
                src="${challengeCreatureData.image}"
                alt="${challengeCreatureData.name}"
            >
        </div>

    `;


    const buttons = document.getElementById("challengeButtons");
    buttons.innerHTML = "";

    for (let i = 0; i < clusterCount; i++) {
        const button = document.createElement("button");
        button.className = "challenge-choice";
        button.textContent = `🔵 Group ${i + 1}`;

        button.addEventListener("click", function () {
            checkChallenge(i, correctGroup, button);
        });

        buttons.appendChild(button);
    }

    document.getElementById("challengeResult").innerHTML = "";
    document.getElementById("nextChallenge").style.display = "none";
    document.getElementById("finalScore").style.display = "none";

    challengeAnswered = false;
}


/* =========================================================
   CHECK ANSWER
========================================================= */

function checkChallenge(
    selectedGroup,
    correctGroup,
    clickedButton
) {

    if (challengeAnswered)
        return;

    challengeAnswered = true;

    const buttons = document.querySelectorAll("#challengeButtons .challenge-choice");

    buttons.forEach(button => {
        button.disabled = true;
    });

    if (selectedGroup === correctGroup) {
        clickedButton.classList.add("correct");

        challengeScore += 10;

        document.getElementById("challengeResult").innerHTML = `

            <div style="font-size:28px;">
                🎉 Excellent!
            </div>

            <p>
                You predicted the same group
                discovered by the AI.
            </p>

            <p>
                🧠 The AI found similar
                features such as
                <b>legs, wings, size and body shape</b>.
            </p>

        `;
    } else {
        clickedButton.classList.add("wrong");

        buttons.forEach((button, index) => {
            if (index === correctGroup) {
                button.classList.add("correct");
            }
        });

        document.getElementById("challengeResult").innerHTML = `

            <div style="font-size:28px;">
                🤔 Almost!
            </div>

            <p>
                The AI placed this creature
                in <b>Group ${correctGroup + 1}</b>.
            </p>

            <p>
                🔍 Compare its
                <b>size, legs, wings and body shape</b>
                with the other creatures.
            </p>

        `;
    }

    document.getElementById("score").textContent = `⭐ Score: ${challengeScore}`;

    const next = document.getElementById("nextChallenge");
    next.style.display = "inline-block";

    if (challengeIndex === 5) {
        next.textContent = "🏆 See Final Score";
    } else {
        next.textContent = "Next Challenge ➜";
    }
}


/* =========================================================
   NEXT CHALLENGE
========================================================= */

document.getElementById("nextChallenge").addEventListener("click", function () {
    if (challengeIndex < 5) {
        challengeIndex++;
        showChallenge();
    } else {
        finishChallenge();
    }
});


/* =========================================================
   FINAL SCORE
========================================================= */

function finishChallenge() {
    document.getElementById("challengeQuestion").style.display = "none";
    document.getElementById("challengeCreature").style.display = "none";
    document.getElementById("challengeButtons").style.display = "none";
    document.getElementById("challengeResult").style.display = "none";
    document.getElementById("nextChallenge").style.display = "none";

    const final = document.getElementById("finalScore");

    if (!final) return;

    final.style.display = "block";

    let message;

    if (challengeScore === 60) {
        message = "🏆 AI DETECTIVE MASTER!<br>You predicted every pattern!";
    } else if (challengeScore >= 40) {
        message = "🌟 GREAT WORK!<br>You are beginning to think like an AI.";
    } else if (challengeScore >= 20) {
        message = "🔬 GOOD TRY!<br>Keep observing the patterns.";
    } else {
        message = "🧐 KEEP EXPLORING!<br>Clustering takes practice.";
    }

    final.innerHTML = `

        <div class="final-score-content">
            <h2>
                🕵️ Mission Complete!
            </h2>

            <div class="big-score">
                ${challengeScore}/60
            </div>

            <p>
                ${message}
            </p>

            <p>
                💡 Remember:
                <b>
                    Clustering finds patterns
                    without predefined labels.
                </b>
            </p>

            <button id="playAgainButton">
                🔄 Play Again
            </button>
        </div>
    `;

    const playAgainButton = document.getElementById("playAgainButton");

    if (playAgainButton) {
        playAgainButton.addEventListener("click", restartChallenges);
    }
}


/* =========================================================
   PLAY AGAIN
========================================================= */

function restartChallenges() {
    document.getElementById("challengeQuestion").style.display = "block";
    document.getElementById("challengeCreature").style.display = "flex";
    document.getElementById("challengeButtons").style.display = "flex";
    document.getElementById("challengeResult").style.display = "block";
    document.getElementById("finalScore").style.display = "none";

    challengeIndex = 0;
    challengeScore = 0;
    challengeAnswered = false;
    challengeCreatureData = null;

    showChallenge();
}


/* =========================================================
   IMAGE ERROR HANDLING
========================================================= */

document.addEventListener("error", function (event) {
    if (event.target.tagName === "IMG") {
        event.target.style.background = "#1e293b";
    }
}, true);


/* =========================================================
   ESCAPE KEY CLOSES MODAL
========================================================= */

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        modal.classList.remove("show");
    }
});


/* =========================================================
   DEBUG MESSAGE
========================================================= */

console.log(
    "🧪 Mystery Creature Clustering Lab loaded."
);

console.log(
    "🦎 Creatures:",
    currentCreatures.length
);

console.log(
    "🔬 Cluster options: 2, 3, 4"
);

console.log(
    "🕵️ Challenges: 6"
);

/* =========================================================
   START CHALLENGES
========================================================= */

function startChallenges() {
    challengeIndex = 0;
    challengeScore = 0;
    challengeAnswered = false;
    challengeCreatureData = null;

    document.getElementById("challengeQuestion").style.display = "block";
    document.getElementById("challengeCreature").style.display = "flex";
    document.getElementById("challengeButtons").style.display = "flex";
    document.getElementById("challengeResult").style.display = "block";
    document.getElementById("finalScore").style.display = "none";

    showChallenge();
}


/* =========================================================
   SHOW CHALLENGE
========================================================= */

function showChallenge() {
    if (!trained) return;

    const challenge = challenges[challengeIndex];

    let options = currentCreatures;

    if (currentCreatures.length > 1 && challengeCreatureData) {
        options = currentCreatures.filter(
            creature => creature.id !== challengeCreatureData.id
        );
    }

    if (!options.length) {
        document.getElementById("challengeQuestion").innerHTML = `
            <h3>🤖 No valid challenge available.</h3>
            <p>Please retrain the AI.</p>
        `;
        return;
    }

    const randomIndex = Math.floor(Math.random() * options.length);
    challengeCreatureData = options[randomIndex];
    const correctGroup = assignments[challengeCreatureData.id];

    document.getElementById("challengeQuestion").style.display = "block";
    document.getElementById("challengeCreature").style.display = "flex";
    document.getElementById("challengeButtons").style.display = "flex";
    document.getElementById("challengeResult").style.display = "block";

    document.getElementById("challengeNumber").textContent =
        `Challenge ${challengeIndex + 1} of 6`;

    document.getElementById("score").textContent =
        `⭐ Score: ${challengeScore}`;

    document.getElementById("progressFill").style.width =
        `${((challengeIndex + 1) / 6) * 100}%`;

    document.getElementById("challengeQuestion").innerHTML = `
        <h3>
            ${challenge.title}
        </h3>
    `;

    document.getElementById("challengeCreature").innerHTML = `
        <div class="challenge-creature">
            <img
                src="${challengeCreatureData.image}"
                alt="${challengeCreatureData.name}"
            >
        </div>
    `;

    const buttons = document.getElementById("challengeButtons");
    buttons.innerHTML = "";

    for (let i = 0; i < clusterCount; i++) {
        const button = document.createElement("button");
        button.className = "challenge-choice";
        button.textContent = `🔵 Group ${i + 1}`;

        button.addEventListener("click", function () {
            checkChallenge(i, correctGroup, button);
        });

        buttons.appendChild(button);
    }

    document.getElementById("challengeResult").innerHTML = "";
    document.getElementById("nextChallenge").style.display = "none";
    document.getElementById("finalScore").style.display = "none";

    challengeAnswered = false;
}
