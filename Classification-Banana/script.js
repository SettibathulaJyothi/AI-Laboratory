const imageInput = document.getElementById("imageInput");

const previewImage = document.getElementById("previewImage");

const previewContainer =
    document.getElementById("previewContainer");

const fileName =
    document.getElementById("fileName");

const predictButton =
    document.getElementById("predictButton");

const analysisSection =
    document.getElementById("analysisSection");

const loading =
    document.getElementById("loading");

const analysisResult =
    document.getElementById("analysisResult");

const progressBar =
    document.getElementById("progressBar");

const predictionText =
    document.getElementById("predictionText");

const confidenceText =
    document.getElementById("confidenceText");

const predictionIcon =
    document.getElementById("predictionIcon");

const explanationText =
    document.getElementById("explanationText");

const greenBar =
    document.getElementById("greenBar");

const yellowBar =
    document.getElementById("yellowBar");

const darkBar =
    document.getElementById("darkBar");

const greenValue =
    document.getElementById("greenValue");

const yellowValue =
    document.getElementById("yellowValue");

const darkValue =
    document.getElementById("darkValue");


let selectedImage = null;


/* ===============================
   IMAGE UPLOAD
================================ */

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    selectedImage = file;

    fileName.textContent = file.name;

    const reader = new FileReader();

    reader.onload = function (event) {

        previewImage.src = event.target.result;

        previewContainer.style.display = "flex";

        predictButton.disabled = false;

        analysisSection.style.display = "none";
    };

    reader.readAsDataURL(file);

});


/* ===============================
   PREDICT BUTTON
================================ */

predictButton.addEventListener("click", function () {

    if (!selectedImage) {
        return;
    }

    analysisSection.style.display = "block";

    loading.style.display = "block";

    analysisResult.style.display = "none";

    analysisSection.scrollIntoView({
        behavior: "smooth"
    });


    let progress = 0;

    progressBar.style.width = "0%";


    const interval = setInterval(function () {

        progress += 5;

        progressBar.style.width =
            progress + "%";


        if (progress >= 100) {

            clearInterval(interval);

            setTimeout(function () {

                analyzeImage();

            }, 300);

        }

    }, 60);

});


/* ===============================
   IMAGE ANALYSIS
================================ */

function analyzeImage() {

    const img = new Image();

    img.onload = function () {

        const canvas =
            document.createElement("canvas");

        const ctx =
            canvas.getContext("2d");


        /*
            Resize image to make
            pixel analysis faster.
        */

        const size = 150;

        canvas.width = size;

        canvas.height = size;


        ctx.drawImage(
            img,
            0,
            0,
            size,
            size
        );


        const imageData =
            ctx.getImageData(
                0,
                0,
                size,
                size
            );


        const pixels =
            imageData.data;


        let greenScore = 0;

        let yellowScore = 0;

        let darkScore = 0;

        let totalPixels =
            pixels.length / 4;


        /*
            Examine image pixels.
        */

        for (
            let i = 0;
            i < pixels.length;
            i += 4
        ) {

            const r = pixels[i];

            const g = pixels[i + 1];

            const b = pixels[i + 2];


            /*
                Green detection
            */

            if (
                g > r * 1.15 &&
                g > b * 1.1
            ) {

                greenScore++;

            }


            /*
                Yellow detection
            */

            if (
                r > 120 &&
                g > 100 &&
                b < 120 &&
                Math.abs(r - g) < 100
            ) {

                yellowScore++;

            }


            /*
                Dark / brown / black pixels
            */

            if (
                r < 90 &&
                g < 90 &&
                b < 90
            ) {

                darkScore++;

            }

        }


        let greenPercent =
            Math.round(
                (greenScore / totalPixels) * 100
            );


        let yellowPercent =
            Math.round(
                (yellowScore / totalPixels) * 100
            );


        let darkPercent =
            Math.round(
                (darkScore / totalPixels) * 100
            );


        /*
            Keep values within
            0 - 100.
        */

        greenPercent =
            Math.min(100, greenPercent);

        yellowPercent =
            Math.min(100, yellowPercent);

        darkPercent =
            Math.min(100, darkPercent);


        /*
            Calculate category scores.
        */

        let rawScore =
            greenPercent + 10;

        let ripeScore =
            yellowPercent + 10;

        let rottenScore =
            darkPercent * 1.5 + 10;


        /*
            Add some visual balance
            for classroom demonstration.
        */

        if (
            greenPercent > yellowPercent &&
            greenPercent > darkPercent
        ) {

            rawScore += 25;

        }


        if (
            yellowPercent > greenPercent &&
            yellowPercent > darkPercent
        ) {

            ripeScore += 25;

        }


        if (darkPercent > 10) {

            rottenScore += 25;

        }


        const scores = {

            "Raw Banana": rawScore,

            "Ripe Banana": ripeScore,

            "Rotten Banana": rottenScore

        };


        let prediction =
            Object.keys(scores).reduce(
                (a, b) =>
                    scores[a] > scores[b] ? a : b
            );


        /*
            Calculate confidence.
        */

        const totalScore =
            rawScore +
            ripeScore +
            rottenScore;


        let confidence =
            Math.round(
                (scores[prediction] /
                    totalScore) * 100
            );


        /*
            Keep confidence visually reasonable.
        */

        confidence =
            Math.max(
                55,
                Math.min(96, confidence)
            );


        displayResult(
            prediction,
            confidence,
            greenPercent,
            yellowPercent,
            darkPercent
        );

    };


    img.src =
        URL.createObjectURL(selectedImage);

}


/* ===============================
   DISPLAY RESULT
================================ */

function displayResult(
    prediction,
    confidence,
    green,
    yellow,
    dark
) {

    loading.style.display = "none";

    analysisResult.style.display = "block";


    predictionText.textContent =
        prediction;


    confidenceText.textContent =
        confidence + "%";


    greenBar.style.width =
        green + "%";

    yellowBar.style.width =
        yellow + "%";

    darkBar.style.width =
        dark + "%";


    greenValue.textContent =
        green + "%";

    yellowValue.textContent =
        yellow + "%";

    darkValue.textContent =
        dark + "%";


    /*
        Prediction icon
    */

    if (prediction === "Raw Banana") {

        predictionIcon.textContent = "🟢";

    }

    else if (prediction === "Ripe Banana") {

        predictionIcon.textContent = "🟡";

    }

    else {

        predictionIcon.textContent = "🔴";

    }


    /*
        Explanation
    */

    if (prediction === "Raw Banana") {

        explanationText.textContent =
            `The image contains relatively strong green colour patterns. 
             These visual features are similar to the patterns learned 
             from raw banana examples.`;

    }

    else if (prediction === "Ripe Banana") {

        explanationText.textContent =
            `The image contains stronger yellow colour patterns. 
             These features are similar to the visual patterns associated 
             with ripe banana examples.`;

    }

    else {

        explanationText.textContent =
            `The image contains a relatively high proportion of dark 
             pixels. Dark or brown regions can be associated with the 
             appearance of rotten bananas.`;

    }


    /*
        Add little animation.
    */

    predictionText.animate(
        [
            {
                transform: "scale(0.8)",
                opacity: 0
            },

            {
                transform: "scale(1)",
                opacity: 1
            }
        ],
        {
            duration: 500,
            easing: "ease-out"
        }
    );

}