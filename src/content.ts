import React from "react";
import { createRoot } from "react-dom/client";
import CircularButtonsContainer from "./components/CircularButtonsContainer";

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

function createFloatingToggleButton() {
  const containerDiv = document.createElement("div");
  containerDiv.id = "tsw-buttons-container";
  document.body.appendChild(containerDiv);

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

  const root = createRoot(containerDiv);
  root.render(
    React.createElement(CircularButtonsContainer, {
      id: "tsw-buttons-container",
      iconBtns: iconArray,
    }),
  );

  document.body.appendChild(panel);
}

createFloatingToggleButton();

chrome.runtime.onMessage.addListener((request) => {
  switch (request.action) {
    case "showNanoMenu":
      if (request.text) {
        summarizeSelected("tsw-toggle-panel", request.text);
      }
      break;
  }
});
