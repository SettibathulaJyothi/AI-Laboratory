function sendMessage() {

    let input = document.getElementById("userInput");
    let message = input.value.toLowerCase().trim();

    if (message === "") {
        return;
    }

    addMessage(message, "user");

    let response = getBotResponse(message);

    setTimeout(function() {
        addMessage(response, "bot");
    }, 500);

    input.value = "";
}


function addMessage(message, sender) {

    let chatbox = document.getElementById("chatbox");

    let messageDiv = document.createElement("div");

    messageDiv.className = sender;

    messageDiv.innerText = message;

    chatbox.appendChild(messageDiv);

    chatbox.scrollTop = chatbox.scrollHeight;
}


function getBotResponse(message) {

    // RULE 1: Account Balance
    if (
        message.includes("balance") ||
        message.includes("account balance")
    ) {

        let answer = confirm(
            "Would you like to visit the online banking login page?"
        );

        if (answer) {

            return "Sure! In a real banking website, I would take you to the secure login page.";

        } else {

            return "No problem. Is there anything else I can help you with?";
        }
    }


    // RULE 2: Password
    if (
        message.includes("password") ||
        message.includes("forgot password") ||
        message.includes("reset password")
    ) {

        return `You can reset your password using the "Forgot Password" option.

Steps:

1. Click "Forgot Password".
2. Enter your registered email or phone number.
3. Follow the instructions sent to you.

Would you like to visit the login page?`;
    }


    // RULE 3: ATM
    if (
        message.includes("atm") ||
        message.includes("cash machine")
    ) {

        let city = prompt(
            "Please enter your city name:"
        );

        if (city) {

            return "The nearest demo ATM in " +
                   city +
                   " is at Main Branch Road. Would you like directions?";

        } else {

            return "Please provide your city name.";
        }
    }


    // RULE 4: Customer Care
    if (
        message.includes("customer care") ||
        message.includes("customer service") ||
        message.includes("support hours")
    ) {

        return "Our customer care team is available from 9:00 AM to 6:00 PM, Monday to Saturday.";
    }


    // RULE 5: Human Support
    if (
        message.includes("human") ||
        message.includes("agent") ||
        message.includes("representative")
    ) {

        return "I can direct you to human support for more complex issues.";
    }


    // FALLBACK RESPONSE

    return "I'm sorry, I don't understand that request. Try asking about account balance, password reset, ATM location, or customer care.";
}