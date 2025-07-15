// Send message to backend and handle UI update
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const chatMessages = document.querySelector(".chatMessages");
const modelSelect = document.getElementById("model"); // <-- Add this

const models = {
  "Google": [
    { id: "gemma-9b", name: "Gemma 9B Iterative" }
  ],
  "Meta": [
    { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant" },
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile" },
    { id: "meta-llama/llama-guard-4-12b", name: "Llama Guard 4 12B" },
  ],
  // The following may stop working at any time
  "Experimental": [
    { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill Llama 70B" },
    { id: "mistral-saba-24b", name: "Mistral Saba 24B" },
    { id: "moonshotai/kimi-k2-instruct", name: "Kimi K2 Instruct" },
    { id: "playai-tts", name: "PlayAI TTS" },
    { id: "compound-beta", name: "Compound Beta" },
  ]
};

for (const [name, items] of Object.entries(models)) {
  const optgrp = document.createElement('optgroup');
  optgrp.label = name;
  for (const item of items) {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = item.name;
    optgrp.appendChild(opt);
  };
  modelSelect.appendChild(optgrp);
}

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

  const currentModel = modelSelect;
  if (messages.length === 0) return;
  localStorage.setItem("chatHistory", JSON.stringify(messages));
  localStorage.setItem("chatModel", currentModel.value); // Save selected model
  localStorage.setItem("modelName", currentModel.options[currentModel.selectedIndex].text); // Save model name
  console.log("Chat saved to localStorage");
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

  const savedModel = localStorage.getItem("chatModel");
  if (savedModel) {
    const allModelIds = Object.values(models).flat().map(m => m.id);
    if (allModelIds.includes(savedModel)) {
      modelSelect.value = savedModel;
    }
  }
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
