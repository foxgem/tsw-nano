import React from "react";
import { createRoot } from "react-dom/client";
import TextSelectionMenu from "~components/TextSelectMenu";
import {
  callNanoWithSelected,
  chattingHandler,
  cleanPageText,
  summarizeSelected,
} from "./handlers";
import { createInputAssistant } from "~utils/ai";
import type { Command } from "~utils/types";

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

function createSelectMenu() {
  const container = document.createElement("div");
  container.id = "tsw-select-root";
  document.body.appendChild(container);
  const root = createRoot(container);

  const onSelect = async (command: Command) => {
    const selectedText = window.getSelection()?.toString().trim();
    await callNanoWithSelected(command, "tsw-toggle-panel", selectedText);
  };

  document.addEventListener("selectionchange", () => {
    const newSelection = window.getSelection();
    if (newSelection && newSelection.toString().trim() !== "") {
      const range = newSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const position = {
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.bottom + window.scrollY,
      };

      root.render(
        React.createElement(TextSelectionMenu, {
          category: "quick-actions",
          selectedText: newSelection.toString().trim(),
          position,
          onSelect,
        }),
      );
      container.style.display = "block";
    } else {
      container.style.display = "none";
    }
  });
}

createSelectMenu();

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
