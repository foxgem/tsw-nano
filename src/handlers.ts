import React from "react";
import { createRoot } from "react-dom/client";
import { TSWChattingPanel } from "~components/TSWChattingPanel";
import { TSWPanel } from "./components/TSWPanel";
import { iconArray } from "./content";
import { summarise } from "./utils/ai";

function withOutputPanel(
  outputElm: string,
  placeHolder: string,
  title: string,
  handler: () => void,
) {
  const panel = document.getElementById(outputElm);
  if (!panel) {
    return;
  }

  panel.style.display = "block";
  panel.innerHTML = "";

  const root = createRoot(panel);
  root.render(
    React.createElement(TSWPanel, {
      title: title,
      placeHolder: placeHolder,
      onRender: () => {
        const closeButton = document.querySelector("#tsw-close-panel");
        if (closeButton) {
          closeButton.addEventListener("click", () => {
            panel.style.display = "none";
          });
        }

        for (const icon of iconArray) {
          const button = document.querySelector(
            `#tsw-${icon.name.toLowerCase()}-btn`,
          );
          if (button) {
            button.addEventListener("click", () => {
              icon.action();
              if (icon.name.toLowerCase() === "wand") {
                panel.style.display = "none";
              }
            });
          }
        }

        handler();
      },
    }),
  );
}

export async function summarizeSelected(
  outputElm: string,
  textSelected: string,
) {
  withOutputPanel(outputElm, "Summarizing", "Summary", async () => {
    const summaryElement = document.getElementById("tsw-output-body");
    if (summaryElement) {
      await summarise(textSelected, summaryElement);
    }
  });
}

export function chattingHandler(outputElm: string) {
  const panel = document.getElementById(outputElm);
  if (!panel) {
    return;
  }

  panel.style.display = "block";
  panel.innerHTML = "";

  const root = createRoot(panel);
  root.render(
    React.createElement(TSWChattingPanel, {
      pageText: document.body.innerText,
      onRender: () => {
        const closeButton = document.querySelector("#tsw-close-panel");
        if (closeButton) {
          closeButton.addEventListener("click", () => {
            panel.style.display = "none";
          });
        }

        for (const icon of iconArray) {
          const button = document.querySelector(
            `#tsw-${icon.name.toLowerCase()}-btn`,
          );
          if (button) {
            button.addEventListener("click", () => {
              icon.action();
              if (icon.name.toLowerCase() === "wand") {
                panel.style.display = "none";
              }
            });
          }
        }
      },
    }),
  );
}
