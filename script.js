// Tab switching
const tabs = document.querySelectorAll(".tab");
const editors = {
  html: document.getElementById("html-editor"),
  css: document.getElementById("css-editor"),
  js: document.getElementById("js-editor")
};

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    Object.values(editors).forEach(e => e.classList.add("hidden"));
    editors[tab.dataset.target].classList.remove("hidden");
  });
});

// Run code
document.getElementById("run").addEventListener("click", () => {
  const html = editors.html.value;
  const css = `<style>${editors.css.value}</style>`;
  const js = `<script>${editors.js.value}<\/script>`;
  const preview = document.getElementById("preview");
  preview.srcdoc = html + css + js;
});

// Download ZIP
document.getElementById("download").addEventListener("click", async () => {
  const zip = new JSZip();
  zip.file("index.html", editors.html.value);
  zip.file("style.css", editors.css.value);
  zip.file("script.js", editors.js.value);
  const content = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(content);
  a.download = "project.zip";
  a.click();
});

// Chat with Pollinations
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");
const chatOutput = document.getElementById("chat-output");

chatSend.addEventListener("click", async () => {
  const text = chatInput.value.trim();
  if (!text) return;

  const userMsg = document.createElement("div");
  userMsg.className = "chat-message user";
  userMsg.textContent = text;
  chatOutput.appendChild(userMsg);
  chatOutput.scrollTop = chatOutput.scrollHeight;

  const botMsg = document.createElement("div");
  botMsg.className = "chat-message bot";
  botMsg.textContent = "…";
  chatOutput.appendChild(botMsg);
  chatOutput.scrollTop = chatOutput.scrollHeight;

  chatInput.value = "";

  try {
    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(text)}`);
    if (!response.ok) throw new Error("HTTP " + response.status);
    const aiText = await response.text();
    botMsg.textContent = aiText;
  } catch (err) {
    console.error("Pollinations error:", err);
    botMsg.textContent = "[Error fetching AI response]";
  }
});
