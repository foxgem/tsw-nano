import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import React from "react";
import { createRoot } from "react-dom/client";
import { StreamMessage } from "~/components/StreamMessage";
import type { Command, NanoApi } from "./types";

const checkNanoAvailability = async (api: NanoApi) => {
  if (!window.ai?.[api]) {
    throw new Error("Nano is not available");
  }

  if ("capabilities" in window.ai[api]) {
    const { available } = await window.ai[api].capabilities();
    if (available === "no") {
      throw new Error("Nano is not available");
    }
  }
};

async function createNanoModel(command: Command) {
  await checkNanoAvailability(command.nano);
  return window.ai[command.nano].create(command.options as any);
}

async function executeNanoModel(
  nanoModel: AILanguageModel | AISummarizer | AIWriter | AIRewriter,
  params: string,
) {
  if ("prompt" in nanoModel) {
    return await nanoModel.prompt(params);
  }

  if ("summarize" in nanoModel) {
    return await nanoModel.summarize(params);
  }

  if ("write" in nanoModel) {
    return await nanoModel.write(params);
  }

  if ("rewrite" in nanoModel) {
    return await nanoModel.rewrite(params);
  }
  return "unsupported";
}

export async function callNanoModel(
  command: Command,
  params: string,
  messageElement: HTMLElement,
) {
  const root = createRoot(messageElement);
  let nanoModel: AILanguageModel | AISummarizer | AIWriter | AIRewriter;
  try {
    nanoModel = await createNanoModel(command);
    const result = await executeNanoModel(nanoModel, params);
    root.render(React.createElement(StreamMessage, { outputString: result }));
  } catch (e) {
    root.render(
      React.createElement(StreamMessage, { outputString: e.message }),
    );
  } finally {
    if (nanoModel && "destroy" in nanoModel) {
      nanoModel.destroy();
    }
  }
}

export const pageRagPrompt = (context: string) => {
  return `
  You are an expert in answering user questions. You always understand user questions well, and then provide high-quality answers based on the information provided in the context.
  Try to keep the answer concise and relevant to the context without providing unnecessary information and explanations.
  If the provided context does not contain relevant information, just respond "I could not find the answer based on the context you provided."
  Context:
  ${context}
  `;
};

export const summarise = async (text: string, messageElement: HTMLElement) => {
  const root = createRoot(messageElement);
  const summary = await summariseLongContext(text);
  root.render(React.createElement(StreamMessage, { outputString: summary }));
};

export const summariseLongContext = async (text: string) => {
  const cacheKey = `summarized_${window.location.pathname}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    return cached;
  }

  await checkNanoAvailability("summarizer");
  const summarizer = await window.ai.summarizer.create({
    type: "key-points",
    length: "short",
  });

  let summary = "";
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 4096,
    chunkOverlap: 0,
  });
  const results = await textSplitter.splitText(text);
  for (const result of results) {
    console.log(result);
    try {
      summary += await summarizer.summarize(result);
    } catch (e) {
      console.error(e);
    }
  }

  sessionStorage.setItem(cacheKey, summary);

  return summary;
};

export const nanoPrompt = async (
  userMessage: string,
  systemPrompt: string,
  initialPrompts?: Array<
    AILanguageModelAssistantPrompt | AILanguageModelUserPrompt
  >,
) => {
  let session: AILanguageModel | undefined;
  try {
    await checkNanoAvailability("languageModel");
    session = await window.ai.languageModel.create({
      systemPrompt,
      initialPrompts,
    });
    return await session.prompt(userMessage);
  } catch (e) {
    return e.message;
  } finally {
    if (session) {
      session.destroy();
    }
  }
};

// the prompt here is inspired by: https://github.com/continuedev/continue/blob/main/core/llm/templates/edit/claude.ts
export const predictNextInput = async (text: string) => {
  const systemPrompt = `You are an input text completion model. The user is currently editing the following text:
    ${text}[BLANK]
  Their cursor is located at the "[BLANK]". They have requested that you fill in the "[BLANK]" with text that makes the whole sentence meaningful.
  Please generate the text. Your output will be only the text that should replace the "[BLANK]", without repeating any of the prefix or suffix, without any natural language explanation, and without messing up indentation.".
  `;
  return await nanoPrompt(text, systemPrompt);
};

export async function translate(
  text: string,
  targetLanguage: string,
  messageElement: HTMLElement,
) {
  const root = createRoot(messageElement);
  try {
    if (
      "translation" in window &&
      "createTranslator" in (window.translation as any) &&
      "canDetect" in (window.translation as any)
    ) {
      const langDetector = await (window.translation as any).createDetector();
      const detectResult = await (langDetector as any).detect(text);
      const sourceLanguage = detectResult[0].detectedLanguage;
      const translator = await (window.translation as any).createTranslator({
        sourceLanguage,
        targetLanguage,
      });
      const result = await translator.translate(text);
      root.render(
        React.createElement(StreamMessage, {
          outputString: `
        ${text}
        ---${sourceLanguage}--- to -->${targetLanguage}---
        ${result}
        `,
        }),
      );
    } else {
      throw new Error("Translator is not available");
    }
  } catch (e) {
    root.render(
      React.createElement(StreamMessage, { outputString: e.message }),
    );
  }
}
