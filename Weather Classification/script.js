/* =========================================
   WEATHER CLASSIFICATION AI LAB
========================================= */


/* ================= GET ELEMENTS ================= */

const temperature =
    document.getElementById("temperature");

const humidity =
    document.getElementById("humidity");

const wind =
    document.getElementById("wind");

const pressure =
    document.getElementById("pressure");


const classifyBtn =
    document.getElementById("classifyBtn");


const weatherImage =
    document.getElementById("weatherImage");


const imageContainer =
    document.querySelector(
        ".weather-image-container"
    );


const imageOverlay =
    document.getElementById(
        "imageOverlay"
    );


const weatherIcon =
    document.getElementById(
        "weatherIcon"
    );


const weatherName =
    document.getElementById(
        "weatherName"
    );


const confidence =
    document.getElementById(
        "confidence"
    );


const confidenceBar =
    document.getElementById(
        "confidenceBar"
    );


const reason =
    document.getElementById(
        "reason"
    );


const backendText =
    document.getElementById(
        "backendText"
    );


const aiProcessing =
    document.getElementById(
        "aiProcessing"
    );


const brain =
    document.getElementById(
        "brain"
    );


const processCards =
    document.querySelectorAll(
        ".process-card"
    );


/* ================= IMAGE DATA ================= */

const weatherData = {

    Sunny: {

        icon: "☀️",

        image:
            "Images/sunny.jpg",

        description:
            "Sunny weather",

        reason:
            "Higher temperature, lower humidity and higher atmospheric pressure match the Sunny pattern."

    },


    Rainy: {

        icon: "🌧️",

        image:
            "Images/rainy.jpg",

        description:
            "Rainy weather",

        reason:
            "High humidity, lower pressure and stronger wind match the Rainy pattern."

    },


    Cloudy: {

        icon: "☁️",

        image:
            "Images/cloudy.jpg",

        description:
            "Cloudy weather",

        reason:
            "Moderate temperature, higher humidity and medium pressure match the Cloudy pattern."

    }

};



/* ================= CLASSIFY ================= */

function classifyWeather() {

    let temp =
        Number(
            temperature.value
        );

    let hum =
        Number(
            humidity.value
        );

    let windSpeed =
        Number(
            wind.value
        );

    let press =
        Number(
            pressure.value
        );


    /* Validate */

    if (
        !Number.isFinite(temp) ||
        !Number.isFinite(hum) ||
        !Number.isFinite(windSpeed) ||
        !Number.isFinite(press)
    ) {

        alert(
            "Please enter valid weather values."
        );

        return;
    }


    /* Start animation */

    classifyBtn.disabled = true;

    classifyBtn.textContent =
        "🤖 AI Analyzing...";


    aiProcessing.classList.add(
        "show"
    );


    brain.style.animationDuration =
        "0.6s";


    imageContainer.classList.add(
        "changing"
    );


    imageOverlay.textContent =
        "🧠 AI is analyzing patterns...";


    activateSteps(
        0
    );


    /* Simulate AI processing */

    setTimeout(() => {

        activateSteps(
            1
        );

    }, 250);


    setTimeout(() => {

        activateSteps(
            2
        );

    }, 500);


    setTimeout(() => {

        const prediction =
            calculatePrediction(
                temp,
                hum,
                windSpeed,
                press
            );


        showPrediction(
            prediction,
            temp,
            hum,
            windSpeed,
            press
        );


    }, 1000);

}



/* ================= CLASSIFICATION LOGIC ================= */

function calculatePrediction(
    temp,
    hum,
    windSpeed,
    press
) {


    /*
       EDUCATIONAL MODEL

       This is intentionally simplified
       so students can understand the
       basic idea of classification.

       A real ML model learns these
       relationships from training data.
    */


    let sunnyScore = 0;

    let rainyScore = 0;

    let cloudyScore = 0;



    /* ================= SUNNY ================= */

    if (temp >= 27) {

        sunnyScore += 2;

    }


    if (hum < 50) {

        sunnyScore += 2;

    }


    if (press >= 1015) {

        sunnyScore += 2;

    }


    if (windSpeed < 25) {

        sunnyScore += 1;

    }



    /* ================= RAINY ================= */

    if (hum >= 78) {

        rainyScore += 3;

    }


    if (press < 1008) {

        rainyScore += 2;

    }


    if (windSpeed >= 22) {

        rainyScore += 2;

    }


    if (temp < 27) {

        rainyScore += 1;

    }



    /* ================= CLOUDY ================= */

    if (hum >= 55) {

        cloudyScore += 2;

    }


    if (
        temp >= 18 &&
        temp < 28
    ) {

        cloudyScore += 2;

    }


    if (
        press >= 1008 &&
        press < 1015
    ) {

        cloudyScore += 2;

    }


    if (windSpeed < 25) {

        cloudyScore += 1;

    }



    /* Base score */

    sunnyScore += 1;

    rainyScore += 1;

    cloudyScore += 1;



    const scores = {

        Sunny:
            sunnyScore,

        Rainy:
            rainyScore,

        Cloudy:
            cloudyScore

    };


    /* Find highest score */

    let prediction =
        Object.keys(scores)
        .reduce(
            (best, current) => {

                return scores[current] >
                       scores[best]

                    ? current
                    : best;

            }
        );


    const total =
        sunnyScore +
        rainyScore +
        cloudyScore;


    const confidenceValue =
        Math.round(
            (
                scores[prediction] /
                total
            ) * 100
        );


    return {

        prediction,

        confidence:
            confidenceValue,

        scores

    };

}



/* ================= SHOW RESULT ================= */

function showPrediction(
    result,
    temp,
    hum,
    windSpeed,
    press
) {


    const prediction =
        result.prediction;


    const confidenceValue =
        result.confidence;


    const data =
        weatherData[
            prediction
        ];


    /* ================= IMAGE ================= */

    imageContainer.classList.remove(
        "changing"
    );


    /*
       Fade old image first,
       then change the image.
    */

    weatherImage.style.opacity =
        "0";


    setTimeout(() => {

        weatherImage.src =
            data.image;

        weatherImage.alt =
            data.description;


        weatherImage.onload =
            () => {

                weatherImage.style.opacity =
                    "1";

            };


        /*
           If the local image cannot
           be found, show a friendly
           fallback.
        */

        weatherImage.onerror =
            () => {

                weatherImage.style.opacity =
                    "1";

                imageOverlay.textContent =
                    "📷 Add " +
                    prediction.toLowerCase() +
                    ".jpg to the images folder";

            };

    }, 300);



    /* ================= TEXT ================= */

    weatherIcon.textContent =
        data.icon;


    weatherName.textContent =
        prediction;


    confidence.textContent =
        confidenceValue +
        "% confidence";


    confidenceBar.style.width =
        confidenceValue +
        "%";


    reason.textContent =
        data.reason;


    imageOverlay.textContent =
        data.icon +
        " " +
        data.description;



    /* ================= BACKEND ================= */

    backendText.innerHTML = `

        <b>1. Input:</b>

        Temperature =
        ${temp}°C,

        Humidity =
        ${hum}%,

        Wind =
        ${windSpeed} km/h,

        Pressure =
        ${press} hPa.

        <br><br>


        <b>2. Feature analysis:</b>

        The AI examines these values
        as features and looks for patterns
        similar to examples seen during training.

        <br><br>


        <b>3. Classification:</b>

        The strongest matching pattern
        was <b>${prediction}</b>.

        <br><br>


        <b>4. Output:</b>

        The model predicts
        <b>${prediction}</b>
        with an educational confidence
        score of <b>${confidenceValue}%</b>.

        <br><br>

        💡 <b>Important:</b>

        This demonstration uses simple
        classroom rules to show the idea.
        A real machine-learning classifier
        learns the decision patterns from
        training data.

    `;



    /* ================= FINISH ================= */

    activateSteps(
        3
    );


    aiProcessing.classList.remove(
        "show"
    );


    classifyBtn.disabled =
        false;


    classifyBtn.textContent =
        "🧠 Classify Weather";


    brain.style.animationDuration =
        "2s";

}



/* ================= PROCESS STEPS ================= */

function activateSteps(
    activeIndex
) {

    processCards.forEach(
        (card, index) => {

            if (
                index <=
                activeIndex
            ) {

                card.classList.add(
                    "active"
                );

            }

            else {

                card.classList.remove(
                    "active"
                );

            }

        }
    );

}



/* ================= BUTTON ================= */

classifyBtn.addEventListener(
    "click",
    classifyWeather
);



/* ================= READY EXAMPLES ================= */

const exampleButtons =
    document.querySelectorAll(
        ".example-buttons button"
    );


exampleButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                temperature.value =
                    button.dataset.temp;


                humidity.value =
                    button.dataset.humidity;


                wind.value =
                    button.dataset.wind;


                pressure.value =
                    button.dataset.pressure;


                classifyWeather();

            }
        );

    }
);