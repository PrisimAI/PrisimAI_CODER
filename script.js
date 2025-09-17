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

// Chat with Pollinations -> inject code
chatSend.addEventListener("click", async () => {
  const text = chatInput.value.trim();
  if (!text) return;

  // Show user msg
  const userMsg = document.createElement("div");
  userMsg.className = "chat-message user";
  userMsg.textContent = text;
  chatOutput.appendChild(userMsg);
  chatOutput.scrollTop = chatOutput.scrollHeight;

  const botMsg = document.createElement("div");
  botMsg.className = "chat-message bot";
  botMsg.textContent = "Generating code…";
  chatOutput.appendChild(botMsg);
  chatOutput.scrollTop = chatOutput.scrollHeight;

  chatInput.value = "";

  try {
    // Force Pollinations to respond with code-only
    const response = await fetch(
      `https://text.pollinations.ai/${encodeURIComponent(
        text + " — Respond only with code, wrapped in ```html```, ```css```, ```js``` blocks."
      )}`
    );
    if (!response.ok) throw new Error("HTTP " + response.status);
    const aiText = await response.text();

    // Show raw AI text in chat (optional)
    botMsg.textContent = aiText;

    // Parse fenced code blocks
    const htmlMatch = aiText.match(/```html([\s\S]*?)```/i);
    const cssMatch  = aiText.match(/```css([\s\S]*?)```/i);
    const jsMatch   = aiText.match(/```js([\s\S]*?)```/i);

    if (htmlMatch) editors.html.value = htmlMatch[1].trim();
    if (cssMatch)  editors.css.value  = cssMatch[1].trim();
    if (jsMatch)   editors.js.value   = jsMatch[1].trim();

    // If nothing matched, put whole response in HTML
    if (!htmlMatch && !cssMatch && !jsMatch) {
      editors.html.value = aiText.trim();
    }

    // Auto-run preview
    document.getElementById("run").click();

  } catch (err) {
    console.error("Pollinations error:", err);
    botMsg.textContent = "[Error fetching AI response]";
  }
});
