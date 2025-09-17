// Elements
const tabs = document.querySelectorAll(".tab");
const htmlCode = document.getElementById("html-code");
const cssCode = document.getElementById("css-code");
const jsCode = document.getElementById("js-code");
const preview = document.getElementById("preview");
const chatSend = document.getElementById("chat-send");
const chatInput = document.getElementById("chat-input");
const chatOutput = document.getElementById("chat-output");
const themeToggle = document.getElementById("theme-toggle");
const downloadBtn = document.getElementById("download-zip");

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    document.querySelectorAll(".content > *").forEach(c => c.classList.add("hidden"));
    if (tab.dataset.tab === "output") {
      preview.classList.remove("hidden");
      updatePreview();
    } else {
      document.getElementById(tab.dataset.tab + "-code").classList.remove("hidden");
    }
  });
});

// Live Preview
function updatePreview() {
  const html = htmlCode.value;
  const css = `<style>${cssCode.value}</style>`;
  const js = `<script>${jsCode.value}<\/script>`;
  preview.srcdoc = html + css + js;
}

[htmlCode, cssCode, jsCode].forEach(el => {
  el.addEventListener("input", () => {
    if (document.querySelector(".tab.active").dataset.tab === "output") {
      updatePreview();
    }
  });
});

chatSend.addEventListener("click", async () => {
  const text = chatInput.value.trim();
  if (!text) return;

  // Show user message
  const userMsg = document.createElement("div");
  userMsg.className = "chat-message user";
  userMsg.textContent = text;
  chatOutput.appendChild(userMsg);
  chatOutput.scrollTop = chatOutput.scrollHeight;

  // Show “loading” bot message (placeholder)
  const botLoading = document.createElement("div");
  botLoading.className = "chat-message bot";
  botLoading.textContent = "…";
  chatOutput.appendChild(botLoading);
  chatOutput.scrollTop = chatOutput.scrollHeight;

  chatInput.value = "";

  try {
    // Call Pollinations API
    // If model selection is possible, you can add params like ?model=openai etc.
    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(text)}`);
    // The API appears to return plain text
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const aiText = await response.text();

    // Remove loading placeholder
    botLoading.remove();

    const botMsg = document.createElement("div");
    botMsg.className = "chat-message bot";
    botMsg.textContent = aiText;
    chatOutput.appendChild(botMsg);
    chatOutput.scrollTop = chatOutput.scrollHeight;

  } catch (err) {
    console.error("Pollinations error:", err);
    botLoading.textContent = "[Error connecting to AI]";
  }
});

// Theme Toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  themeToggle.textContent = document.body.classList.contains("dark-mode") ? "🌙" : "☀️";
});

// Download ZIP
downloadBtn.addEventListener("click", () => {
  const zip = new JSZip();
  zip.file("index.html", htmlCode.value);
  zip.file("style.css", cssCode.value);
  zip.file("script.js", jsCode.value);
  zip.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, "project.zip");
  });
});
