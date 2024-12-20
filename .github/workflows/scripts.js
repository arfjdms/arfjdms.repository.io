const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// Backend URL
const backendUrl = "http://127.0.0.1:5000/chat"; // Update this with your backend URL

// Function to add messages to the chat
function addMessage(content, isUser, isTemporary = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isUser ? "user-message" : "ai-message"}`;
    messageDiv.textContent = content;

    if (isTemporary) {
        messageDiv.id = "typing-message";
    }

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to the latest message
    return messageDiv;
}

// Function to display the AI typing indicator
function showTypingIndicator() {
    const dots = document.createElement("span");
    dots.className = "dots";
    dots.innerHTML = "<span class='dot'>.</span><span class='dot'>.</span><span class='dot'>.</span>";
    const typingMessage = addMessage("", false, true);
    typingMessage.appendChild(dots);
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingMessage = document.getElementById("typing-message");
    if (typingMessage) {
        typingMessage.remove();
    }
}

// Overwrite typing indicator with AI response
function overwriteTypingIndicator(response) {
    const typingMessage = document.getElementById("typing-message");
    if (typingMessage) {
        typingMessage.textContent = response;
    }
}

// Function to check if the backend is reachable
function checkBackendStatus() {
    return fetch(backendUrl, { method: "GET" })
        .then(response => {
            if (response.ok) {
                return true; // Backend is working
            } else {
                return false; // Backend is down
            }
        })
        .catch(() => {
            return false; // Backend is down or unreachable
        });
}

// Send message and fetch AI response
function sendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, true); // Display user message
    userInput.value = ""; // Clear input field

    // Check if the backend is available
    checkBackendStatus().then(isAvailable => {
        if (isAvailable) {
            showTypingIndicator(); // Show typing indicator

            // Send request to backend
            fetch(backendUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            })
                .then((response) => response.json())
                .then((data) => {
                    overwriteTypingIndicator(data.response); // Replace typing indicator with AI response
                })
                .catch((error) => {
                    removeTypingIndicator();
                    console.error("Error:", error);
                    redirectToErrorPage(); // Redirect to error page
                });
        } else {
            redirectToErrorPage(); // Redirect to error page if backend is down
        }
    });
}

// Redirect to error page
function redirectToErrorPage() {
    // Save the error message in localStorage or sessionStorage to display on the new page
    localStorage.setItem("errorMessage", "An error has been found, we have found the problem and are working to fix it. Please try again later.");
    window.location.href = "error.html"; // Redirect to error.html
}

// Add event listeners
sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});
