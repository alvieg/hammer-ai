// Send message to backend and handle UI update
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const chatMessages = document.querySelector(".chatMessages");
const modelSelect = document.getElementById("model"); // <-- Add this

async function sendMessage() {
  const message = userInput.value.trim();
  const model = modelSelect.value; // <-- Get selected model
  if (!message) return;

  appendMessage("user", message);
  userInput.value = "";
  sendButton.disabled = true;

  try {
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, model }) // <-- Send model
    });

    const data = await res.json();
    appendMessage("bot", data.reply || "[No reply]");
  } catch (err) {
    appendMessage("bot", "[Error contacting server], " + err);
  }

  sendButton.disabled = false;
}


// Append message to chat and save chat history
function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = role === "user" ? "userMessage" : "botMessage";

  if (role === "bot") {
    msg.innerHTML = renderMarkdown(text);
  } else {
    msg.textContent = text;
  }

  chatMessages.appendChild(msg);
  msg.scrollIntoView({ behavior: "smooth", block: "end" });

  saveChatToLocalStorage(); // Save after each new message
}

// Simple markdown-like rendering for links and code
function renderMarkdown(text) {
  let html = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  html = html.replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  return html;
}

// Keyboard Enter (no shift) to send
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Click send button
sendButton.addEventListener("click", sendMessage);

// Save chat messages to localStorage
function saveChatToLocalStorage() {
  const messages = Array.from(chatMessages.children).map(el => ({
    role: el.classList.contains("userMessage") ? "user" : "bot",
    content: el.innerHTML
  }));

  if (messages.length === 0) return;
  localStorage.setItem("chatHistory", JSON.stringify(messages));
}

// Load chat messages from localStorage on page load
function loadChatFromLocalStorage() {
  const saved = localStorage.getItem("chatHistory");
  if (!saved) return;

  const messages = JSON.parse(saved);
  messages.forEach(msg => {
    const el = document.createElement("div");
    el.className = msg.role === "user" ? "userMessage" : "botMessage";
    el.innerHTML = msg.content;
    chatMessages.appendChild(el);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Delete chat history from localStorage and UI
function deleteChatFromLocalStorage() {
  localStorage.removeItem("chatHistory");
  chatMessages.innerHTML = "";
}

// Load saved chat when page loads
window.addEventListener("load", loadChatFromLocalStorage);

// Optional: Expose delete function globally or bind to a button in your HTML
// window.deleteChatFromLocalStorage = deleteChatFromLocalStorage;
