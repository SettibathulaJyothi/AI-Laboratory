/* =========================================
   CLASSROOM MANNERS CHALLENGE
========================================= */


const situations = [

    {
        icon: "👂",

        question:
            "The teacher is explaining a lesson. What should you do?",

        hint:
            "Everyone deserves a quiet environment for learning.",

        good: {
            title: "👂 Listen quietly",
            description:
                "Give the teacher your attention.",

            student: "🧑‍🎓",

            label: "Listening carefully",

            speech:
                "I am listening to my teacher. 👂",

            teacher:
                "Thank you for listening! 😊",

            classroom:
                "🤫 Classroom is peaceful"
        },

        bad: {
            title: "🗣️ Chitchat with friends",
            description:
                "Talk while the teacher is teaching.",

            student: "🧑‍🎓",

            label: "Chitchatting 🗣️",

            speech:
                "Hey! What are you doing after class? 😄",

            teacher:
                "Please listen to the lesson.",

            classroom:
                "🔊 Classroom is getting noisy!"
        }
    },


    {
        icon: "🪑",

        question:
            "How should you sit during class?",

        hint:
            "Good posture helps you stay attentive.",

        good: {
            title: "🪑 Sit properly",
            description:
                "Sit upright and stay attentive.",

            student: "🧑‍🎓",

            label: "Good posture 👍",

            speech:
                "I am sitting properly and learning.",

            teacher:
                "Excellent posture! 🌟",

            classroom:
                "✨ Students are ready to learn"
        },

        bad: {
            title: "😴 Slouch on the desk",
            description:
                "Lie down or keep your head on the desk.",

            student: "😴",

            label: "Slouching 😴",

            speech:
                "I don't feel like sitting properly...",

            teacher:
                "Please sit properly.",

            classroom:
                "😴 Student is losing focus"
        }
    },


    {
        icon: "🙋",

        question:
            "You have a doubt about the lesson. What should you do?",

        hint:
            "You want the teacher to hear your question.",

        good: {
            title: "🙋 Raise your hand",
            description:
                "Wait for the teacher to give you a chance.",

            student: "🙋",

            label: "Asking politely",

            speech:
                "Excuse me, may I ask a question?",

            teacher:
                "Yes! Please ask your doubt. 😊",

            classroom:
                "💡 Learning is happening"
        },

        bad: {
            title: "📢 Shout the question",
            description:
                "Interrupt the lesson without waiting.",

            student: "📢",

            label: "Interrupting",

            speech:
                "Teacher! Teacher! I have a doubt!",

            teacher:
                "Please raise your hand first.",

            classroom:
                "🔊 The class is being interrupted"
        }
    },


    {
        icon: "🚪",

        question:
            "You need to go outside the classroom. What should you do?",

        hint:
            "Leaving the classroom should be respectful.",

        good: {
            title: "🙋 Ask permission",
            description:
                "Ask the teacher before going outside.",

            student: "🙋",

            label: "Asking permission",

            speech:
                "Excuse me, may I go outside, please?",

            teacher:
                "Yes, you may go.",

            classroom:
                "👍 Respectful behavior"
        },

        bad: {
            title: "🚶 Just walk out",
            description:
                "Leave without informing the teacher.",

            student: "🚶",

            label: "Leaving without permission",

            speech:
                "I'll just go outside...",

            teacher:
                "Please ask permission before leaving.",

            classroom:
                "⚠️ The teacher was not informed"
        }
    },


    {
        icon: "🗑️",

        question:
            "You need to go to the dustbin. What should you do?",

        hint:
            "You need to leave your place.",

        good: {
            title: "🙋 Ask permission",
            description:
                "Ask before getting up and going.",

            student: "🙋",

            label: "Asking permission",

            speech:
                "May I go to the dustbin, please?",

            teacher:
                "Yes, you may go.",

            classroom:
                "🗑️ Clean classroom + good manners"
        },

        bad: {
            title: "🏃 Get up immediately",
            description:
                "Walk around without asking.",

            student: "🏃",

            label: "Walking around",

            speech:
                "I need to throw this away now!",

            teacher:
                "Please ask before leaving your seat.",

            classroom:
                "⚠️ Class is being disturbed"
        }
    },


    {
        icon: "🪑",

        question:
            "You want to change your place. What should you do?",

        hint:
            "Changing seats can disturb other students.",

        good: {
            title: "🙋 Ask the teacher",
            description:
                "Wait for permission before changing your place.",

            student: "🙋",

            label: "Waiting for permission",

            speech:
                "May I change my place, please?",

            teacher:
                "Let's discuss it. Thank you for asking.",

            classroom:
                "👍 Respectful classroom behavior"
        },

        bad: {
            title: "🔄 Change your seat",
            description:
                "Move whenever you want.",

            student: "🔄",

            label: "Changing seats",

            speech:
                "I'm moving over there! 😄",

            teacher:
                "Please stay in your place unless permitted.",

            classroom:
                "⚠️ Students are being distracted"
        }
    },


    {
        icon: "💧",

        question:
            "You are thirsty during class. What should you do?",

        hint:
            "The teacher is still teaching.",

        good: {
            title: "🙋 Ask permission",
            description:
                "Politely ask before getting water.",

            student: "🙋",

            label: "Asking for water",

            speech:
                "Excuse me, may I drink some water, please?",

            teacher:
                "Yes, you may. 💧",

            classroom:
                "💧 Polite and respectful"
        },

        bad: {
            title: "🚰 Get water without asking",
            description:
                "Leave your place without informing the teacher.",

            student: "🚶",

            label: "Leaving without asking",

            speech:
                "I'm thirsty. I'll just get water.",

            teacher:
                "Please ask permission first.",

            classroom:
                "⚠️ The class was interrupted"
        }
    },


    {
        icon: "🍎",

        question:
            "You want to eat something during class. What should you do?",

        hint:
            "Food can distract you and other students.",

        good: {
            title: "🙋 Ask permission",
            description:
                "Wait for the teacher's permission.",

            student: "🙋",

            label: "Asking permission",

            speech:
                "May I eat this, please?",

            teacher:
                "Please wait until the appropriate time.",

            classroom:
                "👍 Respecting classroom rules"
        },

        bad: {
            title: "🍪 Start eating",
            description:
                "Eat during the lesson without asking.",

            student: "🍪",

            label: "Eating during class",

            speech:
                "Mmm... I'll just have a snack! 😋",

            teacher:
                "Please don't eat during the lesson without permission.",

            classroom:
                "⚠️ Food can distract the class"
        }
    },


    {
        icon: "🚻",

        question:
            "You need to use the restroom. What should you do?",

        hint:
            "You need to leave the classroom.",

        good: {
            title: "🙋 Ask permission",
            description:
                "Politely ask before leaving.",

            student: "🙋",

            label: "Asking permission",

            speech:
                "Excuse me, may I use the restroom?",

            teacher:
                "Yes, you may.",

            classroom:
                "👍 Polite behavior"
        },

        bad: {
            title: "🚶 Walk out",
            description:
                "Leave without informing the teacher.",

            student: "🚶",

            label: "Leaving without permission",

            speech:
                "I need to go now!",

            teacher:
                "Please tell me before leaving.",

            classroom:
                "⚠️ Teacher was not informed"
        }
    },


    {
        icon: "🤝",

        question:
            "Your classmate is answering a question. What should you do?",

        hint:
            "Everyone deserves a chance to speak.",

        good: {
            title: "👂 Listen",
            description:
                "Let your classmate finish speaking.",

            student: "👂",

            label: "Listening to a classmate",

            speech:
                "I'll listen until they finish.",

            teacher:
                "Wonderful respect for your classmate! 🌟",

            classroom:
                "🤝 Everyone gets a chance"
        },

        bad: {
            title: "🗣️ Interrupt",
            description:
                "Talk over your classmate.",

            student: "🗣️",

            label: "Interrupting",

            speech:
                "I know the answer! Listen to me!",

            teacher:
                "Please let your classmate finish.",

            classroom:
                "⚠️ Someone is being interrupted"
        }
    },


    {
        icon: "👩‍🏫",

        question:
            "The teacher is speaking. What shows respect?",

        hint:
            "Respect starts with how we communicate.",

        good: {
            title: "🙏 Speak respectfully",
            description:
                "Use polite words and listen carefully.",

            student: "🙏",

            label: "Showing respect",

            speech:
                "Thank you, teacher. 😊",

            teacher:
                "Thank you for being respectful.",

            classroom:
                "❤️ Respect makes a happy classroom"
        },

        bad: {
            title: "😠 Argue or make fun",
            description:
                "Disrespect the teacher.",

            student: "😠",

            label: "Being disrespectful",

            speech:
                "That's not fair! 😠",

            teacher:
                "Please speak respectfully.",

            classroom:
                "⚠️ Respect is important"
        }
    },


    {
        icon: "⏰",

        question:
            "The class has ended. What should you do?",

        hint:
            "Wait until the teacher allows you to leave.",

        good: {
            title: "⏰ Wait for permission",
            description:
                "Leave when the teacher says you may.",

            student: "🧑‍🎓",

            label: "Waiting respectfully",

            speech:
                "Thank you, teacher. May we leave?",

            teacher:
                "Yes, you may leave. Have a great day! 😊",

            classroom:
                "🎉 Class ended peacefully"
        },

        bad: {
            title: "🏃 Run outside",
            description:
                "Leave immediately without waiting.",

            student: "🏃",

            label: "Running out",

            speech:
                "The class is over! Bye! 🏃",

            teacher:
                "Please wait until I dismiss the class.",

            classroom:
                "⚠️ Everyone is rushing"
        }
    }

];


/* =========================================
   VARIABLES
========================================= */

let currentQuestion = 0;

let score = 0;

let answered = false;


/* =========================================
   GET ELEMENTS
========================================= */

const student =
    document.getElementById("student");

const studentEmoji =
    document.getElementById("studentEmoji");

const studentBubble =
    document.getElementById("studentBubble");

const studentLabel =
    document.getElementById("studentLabel");

const teacherEmoji =
    document.getElementById("teacherEmoji");

const teacherMessage =
    document.getElementById("teacherMessage");

const classroomMessage =
    document.getElementById("classroomMessage");

const situationIcon =
    document.getElementById("situationIcon");

const question =
    document.getElementById("question");

const hint =
    document.getElementById("hint");

const answers =
    document.getElementById("answers");

const scoreElement =
    document.getElementById("score");

const questionNumber =
    document.getElementById("questionNumber");

const feedback =
    document.getElementById("feedback");

const feedbackIcon =
    document.getElementById("feedbackIcon");

const feedbackTitle =
    document.getElementById("feedbackTitle");

const feedbackText =
    document.getElementById("feedbackText");

const nextButton =
    document.getElementById("nextButton");

const questionCard =
    document.getElementById("questionCard");

const finalScreen =
    document.getElementById("finalScreen");

const finalScore =
    document.getElementById("finalScore");

const finalMessage =
    document.getElementById("finalMessage");

const restartButton =
    document.getElementById("restartButton");


/* =========================================
   LOAD QUESTION
========================================= */

function loadQuestion() {

    answered = false;

    const item =
        situations[currentQuestion];

    situationIcon.textContent =
        item.icon;

    question.textContent =
        item.question;

    hint.textContent =
        item.hint;

    questionNumber.textContent =
        `${currentQuestion + 1} / ${situations.length}`;

    scoreElement.textContent =
        score;

    answers.innerHTML = "";

    feedback.classList.add("hidden");

    questionCard.classList.remove("hidden");


    /* Reset cartoon */

    resetStudent();


    /* Create answer buttons */

    createAnswerButton(item.good, true);

    createAnswerButton(item.bad, false);
}


/* =========================================
   CREATE ANSWER BUTTON
========================================= */

function createAnswerButton(answer, isGood) {

    const button =
        document.createElement("button");

    button.type = "button";

    button.className = "answer";

    button.innerHTML = `
        <strong>${answer.title}</strong>
        <small>${answer.description}</small>
    `;

    button.addEventListener("click", function () {

        selectAnswer(answer, isGood, button);

    });

    answers.appendChild(button);
}


/* =========================================
   SELECT ANSWER
========================================= */

function selectAnswer(answer, isGood, selectedButton) {

    if (answered) {
        return;
    }

    answered = true;


    /* Disable all buttons */

    const buttons =
        answers.querySelectorAll("button");

    buttons.forEach(function (button) {

        button.disabled = true;

    });


    /* Update score */

    if (isGood) {

        score++;

        selectedButton.style.borderColor =
            "#22c55e";

        selectedButton.style.background =
            "#f0fdf4";

    } else {

        selectedButton.style.borderColor =
            "#ef4444";

        selectedButton.style.background =
            "#fef2f2";
    }


    scoreElement.textContent =
        score;


    /* CHANGE THE CARTOON */

    changeStudentBehavior(answer, isGood);


    /* Show feedback */

    if (isGood) {

        feedbackIcon.textContent =
            "🌟";

        feedbackTitle.textContent =
            "Excellent Choice!";

        feedbackText.textContent =
            "That is a respectful classroom behavior. Look at the student — the classroom is now calmer and happier!";

        feedback.classList.remove("bad");

    } else {

        feedbackIcon.textContent =
            "💭";

        feedbackTitle.textContent =
            "Think About It!";

        feedbackText.textContent =
            "This behavior can disturb the class. Look at what happened to the classroom!";

        feedback.classList.add("bad");
    }


    feedback.classList.remove("hidden");
}


/* =========================================
   CHANGE CARTOON BEHAVIOR
========================================= */

function changeStudentBehavior(answer, isGood) {

    /* Change student */

    studentEmoji.textContent =
        answer.student;

    studentLabel.textContent =
        answer.label;

    /* Change speech bubble */

    studentBubble.textContent =
        answer.speech;

    studentBubble.classList.add("show");


    /* Change teacher */

    if (isGood) {

        teacherEmoji.textContent =
            "👩‍🏫";

    } else {

        teacherEmoji.textContent =
            "😐";

    }

    teacherMessage.textContent =
        answer.teacher;


    /* Change classroom */

    classroomMessage.textContent =
        answer.classroom;


    /* Animate bad behavior */

    student.classList.remove("bad");

    if (!isGood) {

        void student.offsetWidth;

        student.classList.add("bad");

    }


    /* Change classroom background */

    if (isGood) {

        document.querySelector(".classroom").style.background =
            "linear-gradient(to bottom, #bae6fd 0%, #dcfce7 67%, #c8a878 67%, #b89568 100%)";

    } else {

        document.querySelector(".classroom").style.background =
            "linear-gradient(to bottom, #cbd5e1 0%, #e2e8f0 67%, #c8a878 67%, #b89568 100%)";

    }

}


/* =========================================
   RESET CARTOON
========================================= */

function resetStudent() {

    studentEmoji.textContent =
        "🧑‍🎓";

    studentLabel.textContent =
        "Ready to learn";

    studentBubble.textContent =
        "I am ready to learn! 😊";

    studentBubble.classList.remove("show");

    teacherEmoji.textContent =
        "👩‍🏫";

    teacherMessage.textContent =
        "Let's begin!";

    classroomMessage.textContent =
        "🤫 Classroom is peaceful";

    student.classList.remove("bad");


    document.querySelector(".classroom").style.background =
        "linear-gradient(to bottom, #bae6fd 0%, #e0f2fe 67%, #c8a878 67%, #b89568 100%)";
}


/* =========================================
   NEXT BUTTON
========================================= */

nextButton.addEventListener("click", function () {

    currentQuestion++;

    if (currentQuestion >= situations.length) {

        showFinalScreen();

    } else {

        loadQuestion();

    }

});


/* =========================================
   FINAL SCREEN
========================================= */

function showFinalScreen() {

    questionCard.classList.add("hidden");

    feedback.classList.add("hidden");

    finalScreen.classList.remove("hidden");


    const percentage =
        Math.round(
            (score / situations.length) * 100
        );


    finalScore.textContent =
        percentage + "%";


    if (percentage >= 90) {

        finalMessage.textContent =
            "🌟 Amazing! You understand how good manners create a peaceful, respectful and happy classroom.";

    } else if (percentage >= 70) {

        finalMessage.textContent =
            "👏 Very good! Keep practicing these manners every day.";

    } else {

        finalMessage.textContent =
            "💪 Every class is a new opportunity to improve. Let's practice good manners together!";
    }

}


/* =========================================
   RESTART
========================================= */

restartButton.addEventListener("click", function () {

    currentQuestion = 0;

    score = 0;

    answered = false;

    finalScreen.classList.add("hidden");

    questionCard.classList.remove("hidden");

    loadQuestion();

});


/* =========================================
   START APP
========================================= */

loadQuestion();