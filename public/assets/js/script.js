const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const chatMessages = document.querySelector(".chatMessages");

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  userInput.value = "";
  sendButton.disabled = true;

  try {
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    appendMessage("bot", data.reply || "[No reply]");
  } catch (err) {
    appendMessage("bot", "[Error contacting server]");
  }

  sendButton.disabled = false;
}

function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = role === "user" ? "userMessage" : "botMessage";

  // Use innerHTML for bot messages, textContent for user
  if (role === "bot") {
    msg.innerHTML = renderMarkdown(text);
  } else {
    msg.textContent = text;
  }

  chatMessages.appendChild(msg);
  msg.scrollIntoView({ behavior: "smooth", block: "end" });
}

function renderMarkdown(text) {
  // Escape HTML
  let html = text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Links: [text](url)
  html = html.replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Code block: ```code```
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  return html;
}

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendButton.addEventListener("click", sendMessage);

function saveChatToLocalStorage() {
  const messages = Array.from(document.querySelectorAll('.chatMessages > div')).map(el => {
    return {
      role: el.classList.contains('userMessage') ? 'user' : 'bot',
      content: el.innerHTML
    };
  });
  if (messages.length === 0) return;
  localStorage.removeItem('chatHistory'); // Clear previous history
  localStorage.setItem('chatHistory', JSON.stringify(messages));
}

function loadChatFromLocalStorage() {
  const saved = localStorage.getItem('chatHistory');
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

function deleteChatFromLocalStorage() {
  localStorage.removeItem('chatHistory');
  chatMessages.innerHTML = ""; // clear the UI too
}

window.addEventListener("load", loadChatFromLocalStorage);
