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

const processing =
    document.getElementById("processing");

const weatherIcon =
    document.getElementById("weatherIcon");

const weatherName =
    document.getElementById("weatherName");

const confidence =
    document.getElementById("confidence");

const confidenceBar =
    document.getElementById("confidenceBar");

const reason =
    document.getElementById("reason");

const result =
    document.getElementById("result");

const backendText =
    document.getElementById("backendText");



/* ----------------------------------
   CLASSIFICATION FUNCTION
----------------------------------- */

function classifyWeather() {

    let temp = Number(temperature.value);
    let hum = Number(humidity.value);
    let windSpeed = Number(wind.value);
    let press = Number(pressure.value);


    /* Prevent invalid values */

    if (
        !Number.isFinite(temp) ||
        !Number.isFinite(hum) ||
        !Number.isFinite(windSpeed) ||
        !Number.isFinite(press)
    ) {

        alert("Please enter valid weather values.");

        return;
    }


    /* Show AI processing */

    processing.classList.add("show");

    classifyBtn.disabled = true;

    classifyBtn.textContent =
        "🤖 AI is analyzing...";


    setTimeout(() => {

        calculatePrediction(
            temp,
            hum,
            windSpeed,
            press
        );

        processing.classList.remove("show");

        classifyBtn.disabled = false;

        classifyBtn.textContent =
            "🧠 Classify Weather";

    }, 900);

}



/* ----------------------------------
   SIMPLE EDUCATIONAL CLASSIFIER
----------------------------------- */

function calculatePrediction(
    temp,
    hum,
    windSpeed,
    press
) {

    /*
        These scores are intentionally simple.

        They demonstrate the idea of
        classification for students.

        A real ML model would learn
        these patterns from training data.
    */


    let sunny = 0;

    let rainy = 0;

    let cloudy = 0;



    /* SUNNY PATTERNS */

    if (temp >= 27)
        sunny += 2;

    if (hum < 50)
        sunny += 2;

    if (press >= 1015)
        sunny += 2;

    if (windSpeed < 25)
        sunny += 1;



    /* RAINY PATTERNS */

    if (hum >= 78)
        rainy += 3;

    if (press < 1008)
        rainy += 2;

    if (windSpeed >= 22)
        rainy += 2;

    if (temp < 27)
        rainy += 1;



    /* CLOUDY PATTERNS */

    if (hum >= 55)
        cloudy += 2;

    if (
        temp >= 18 &&
        temp < 28
    )
        cloudy += 2;

    if (
        press >= 1008 &&
        press < 1015
    )
        cloudy += 2;

    if (windSpeed < 25)
        cloudy += 1;



    /* Small base score */

    sunny += 1;

    rainy += 1;

    cloudy += 1;



    const scores = {

        Sunny: sunny,

        Rainy: rainy,

        Cloudy: cloudy

    };


    /* Find highest score */

    let prediction =
        Object.keys(scores)
        .reduce((a, b) =>
            scores[a] > scores[b] ? a : b
        );


    const total =
        sunny +
        rainy +
        cloudy;


    let confidenceValue =
        Math.round(
            (scores[prediction] / total) * 100
        );


    showPrediction(
        prediction,
        confidenceValue,
        temp,
        hum,
        windSpeed,
        press
    );

}



/* ----------------------------------
   SHOW RESULT
----------------------------------- */

function showPrediction(
    prediction,
    confidenceValue,
    temp,
    hum,
    windSpeed,
    press
) {


    result.classList.remove("waiting");


    let icon = "";

    let explanation = "";


    if (prediction === "Sunny") {

        icon = "☀️";

        explanation =
            "The combination of higher temperature, lower humidity and higher pressure matches the learned Sunny pattern.";

    }


    else if (prediction === "Rainy") {

        icon = "🌧️";

        explanation =
            "High humidity, lower pressure and stronger wind match the learned Rainy pattern.";

    }


    else {

        icon = "☁️";

        explanation =
            "Moderate temperature, higher humidity and medium pressure match the learned Cloudy pattern.";

    }



    weatherIcon.textContent = icon;

    weatherName.textContent =
        prediction;


    confidence.textContent =
        confidenceValue +
        "% confidence";


    confidenceBar.style.width =
        confidenceValue + "%";


    reason.textContent =
        explanation;



    /* Backend explanation */

    backendText.innerHTML = `

        <b>Input:</b>
        Temperature = ${temp}°C,
        Humidity = ${hum}%,
        Wind = ${windSpeed} km/h,
        Pressure = ${press} hPa.

        <br><br>

        <b>What the model did:</b>
        It examined these features and compared
        their pattern with the categories learned
        during training.

        <br><br>

        <b>Final classification:</b>
        ${prediction}

        <br><br>

        💡 In a real machine-learning system,
        the model would learn these patterns from
        many labelled weather examples instead of
        using the simple classroom rules used here.

    `;

}



/* ----------------------------------
   CLASSIFY BUTTON
----------------------------------- */

classifyBtn.addEventListener(
    "click",
    classifyWeather
);



/* ----------------------------------
   READY-MADE EXAMPLES
----------------------------------- */

const exampleButtons =
    document.querySelectorAll(
        ".example-buttons button"
    );


exampleButtons.forEach(button => {

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

});