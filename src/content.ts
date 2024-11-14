import React from "react";
import { createRoot } from "react-dom/client";
import FloatingTextarea from "~components/FloatingTextarea";
import SuggestList from "~components/SuggestList";
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

function attachNanoInputingAmplifier() {
  let suggestContainer: HTMLDivElement | null = null;
  let root = null;

  document.addEventListener("keyup", (e) => {
    if (
      !(
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
    ) {
      return;
    }

    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (target.value === "/") {
      suggestContainer = document.createElement("div");
      suggestContainer.id = "tsw-suggest-container";

      target.parentElement?.appendChild(suggestContainer);
      const rect = target.getBoundingClientRect();
      const parentRect = target.parentElement?.getBoundingClientRect() || rect;

      suggestContainer.style.position = "absolute";
      suggestContainer.style.left = "20px";
      if (target.id === "tsw-chat-textarea") {
        setTimeout(() => {
          const suggestionsList = document.getElementById(
            "tsw-suggestionsList",
          );
          const listHeight = suggestionsList?.offsetHeight || 0;
          if (suggestContainer) {
            suggestContainer.style.bottom = `${listHeight + 40}px`;
          }
        }, 0);
      } else {
        suggestContainer.style.top = `${parentRect.height - 50}px`;
      }
      root = createRoot(suggestContainer);

      root.render(
        React.createElement(SuggestList, {
          onSelect: (value: string) => {
            target.value = value;
            if (suggestContainer) {
              suggestContainer.remove();
              root = null;
            }
          },
          category: "slash-commands",
        }),
      );
    } else {
      if (suggestContainer) {
        suggestContainer.remove();
        root = null;
      }
    }
  });

  document.addEventListener("click", (e) => {
    if (suggestContainer && !suggestContainer.contains(e.target as Node)) {
      suggestContainer.remove();
      suggestContainer = null;
    }
  });
}

attachNanoInputingAmplifier();

function createFloatingInput() {
  const container = document.createElement("div");
  container.id = "floating-textarea";

  const root = createRoot(container);
  root.render(
    React.createElement(FloatingTextarea, {
      onSubmit: (value: string) => {
        console.log("Submit:", value);
      },
      onChat: () => {
        chattingHandler("tsw-toggle-panel");
      },
      onSummary: () => {
        summarizeSelected("tsw-toggle-panel", document.body.innerText);
      },
    }),
  );

  document.body.appendChild(container);

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
