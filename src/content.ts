import { chattingHandler, summarizeSelected } from "./handlers";

export const iconArray = [
  {
    name: "Summary",
    action: () => {
      summarizeSelected("tsw-toggle-panel", document.body.innerText);
    },
  },
  {
    name: "Chat",
    action: () => {
      chattingHandler("tsw-toggle-panel");
    },
  },
];

function createFloatingInput() {
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 4000000;
    background: white;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: none;
  `;

  const textarea = document.createElement("textarea");
  textarea.style.cssText = `
    min-height: 80px;
    max-height: 200px;
    width: 400px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: none;
    font-family: inherit;
    font-size: 14px;
  `;

  textarea.placeholder = "Ask @nano...";

  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  });

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      console.log("Submit:", textarea.value);
      container.style.display = "none";
      textarea.value = "";
    }

    if (e.key === "Escape") {
      container.style.display = "none";
      textarea.value = "";
    }
  });

  textarea.onblur = (e) => {
    container.style.display = "none";
    textarea.value = "";
  };

  container.appendChild(textarea);
  document.body.appendChild(container);

  document.addEventListener("keydown", (e) => {
    console.log(e);
    if (e.metaKey && e.shiftKey && e.key === "2") {
      e.preventDefault();
      container.style.display = "block";
      textarea.focus();
    }
  });

  return container;
}

createFloatingInput();

function createFloatingTogglePanel() {
  const panel = document.createElement("div");
  panel.id = "tsw-toggle-panel";
  panel.style.cssText = `
    all: initial;
    color-scheme: light;
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    width: 40%;
    height: 100%;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    z-index: 3999999;
    display: none;
  `;
  document.body.appendChild(panel);
}

createFloatingTogglePanel();

chrome.runtime.onMessage.addListener((request) => {
  switch (request.action) {
    case "showNanoMenu":
      if (request.text) {
        summarizeSelected("tsw-toggle-panel", request.text);
      }
      break;
    case "openChat":
      chattingHandler("tsw-toggle-panel");
      break;
  }
});
