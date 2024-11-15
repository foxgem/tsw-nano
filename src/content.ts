import { chattingHandler, cleanPageText, summarizeSelected } from "./handlers";
import { createInputAssistant } from "~utils/ai";

export const iconArray = [
  {
    name: "Summary",
    action: () => {
      summarizeSelected("tsw-toggle-panel", cleanPageText());
    },
  },
  {
    name: "Chat",
    action: () => {
      chattingHandler("tsw-toggle-panel");
    },
  },
];

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
    case "openChat":
      chattingHandler("tsw-toggle-panel");
      break;
  }
});

document.addEventListener("keydown", (e: KeyboardEvent) => {
  // cmd + @
  if (e.metaKey && e.shiftKey && e.key === "2") {
    e.preventDefault();
    chattingHandler("tsw-toggle-panel");
  }
});

createInputAssistant().then((assistant) => {
  document.addEventListener("keyup", async (e) => {
    if (
      !(
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
    ) {
      return;
    }

    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (target.value.split(" ").length <= 3) {
      return;
    }

    target.value += await assistant.prompt(target.value);
  });
});
