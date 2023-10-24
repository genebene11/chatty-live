let aliasInput = document.getElementById("alias");
let messageInput = document.getElementById("message");
const submitButton = document.getElementById("submit");
let isSubmitting = false;

function displayMessage(alias, message, time) {
    const para = document.createElement("p");
    const timeText = document.createTextNode(`(${formatTime(time)}) `);
    const aliasElement = document.createElement("b");
    const aliasText = document.createTextNode(alias);
    const messageText = document.createTextNode(`: ${message}`);

    para.appendChild(timeText);
    aliasElement.appendChild(aliasText);
    para.appendChild(aliasElement);
    para.appendChild(messageText);

    const element = document.getElementById("chatMessages");
    element.appendChild(para);
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Format the time as HH:MM:SS
    return `${hours}:${minutes}:${seconds}`;
}

function fetchMessages() {
    fetch('/chats')
        .then(response => response.json())
        .then(messages => {
            // Clear existing chat messages
            const element = document.getElementById("chatMessages");
            element.innerHTML = '';

            // Add the new chat messages
            messages.forEach(message => {
                displayMessage(message.alias, message.message, message.time); // Include the time field
            });
        });
}

setInterval(fetchMessages, 1000);

function sendMessage(event) {
    event.preventDefault(); // Prevent the form from submitting and the page from reloading

    const alias = aliasInput.value;
    const message = messageInput.value;

    if ((alias.trim() !== "") && (message.trim() !== "") && !isSubmitting) {
        isSubmitting = true; // Set the flag to indicate submission is in progress

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/chats/post", true);

        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    // Message sent successfully
                    messageInput.value = ""; // Clear the message input field
                } else {
                    alert("Message could not be sent. Try again.")
                }
                isSubmitting = false; // Reset the flag after submission is complete
            }
        };

        const messageData = {
            alias: alias,
            message: message,
            time: Date.now() // Add the timestamp when the message is sent
        };
        

        xhr.send(JSON.stringify(messageData));
    }
}

submitButton.addEventListener('click', sendMessage);
