import React from "react";
import { createRoot } from "react-dom/client";
import TextSelectionMenu from "~components/TextSelectMenu";
import type { Command } from "~utils/types";
import {
  callNanoWithSelected,
  chattingHandler,
  cleanPageText,
  summarizeSelected,
  translateSelected,
} from "./handlers";

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
    window.getSelection()?.removeAllRanges();
  };

  const onTranslate = async () => {
    const selectedText = window.getSelection()?.toString().trim();
    await translateSelected(selectedText, "tsw-toggle-panel");
    window.getSelection()?.removeAllRanges();
  };

  let hasSelection = false;

  document.addEventListener("selectionchange", () => {
    const newSelection = window.getSelection();
    hasSelection = !!(newSelection && newSelection.toString().trim() !== "");
    if (!hasSelection) {
      container.style.display = "none";
    }
  });

  document.addEventListener("mouseup", () => {
    if (!hasSelection) return;
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== "") {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const position = {
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.bottom + window.scrollY,
      };

      root.render(
        React.createElement(TextSelectionMenu, {
          selectedText: selection.toString().trim(),
          position,
          onSelect,
          onTranslate,
        }),
      );
      container.style.display = "block";
    }
  });
}

createSelectMenu();

function createFloatingTogglePanel() {
  const panel = document.createElement("div");
  panel.id = "tsw-toggle-panel";
  const zIndexValue = window.location.hostname === "vercel.com" ? 39 : 3999999;

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
    z-index: ${zIndexValue};
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

  // target.value += await predictNextInput(target.value);
});
