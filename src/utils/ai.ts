import React from "react";
import { createRoot } from "react-dom/client";
import { StreamMessage } from "~/components/StreamMessage";
import type { NanoApi } from "./types";

const checkNanoAvailability = async (api: NanoApi) => {
  let modelFactory: any;
  switch (api) {
    case "language-model":
      modelFactory = window.ai.languageModel;
      break;
    case "summarizer":
      modelFactory = window.ai.summarizer;
      break;
    case "writer":
      modelFactory = window.ai.writer;
      break;
    case "rewriter":
      modelFactory = window.ai.rewriter;
      break;
  }

  const { available } = await modelFactory.capabilities();

  console.log(available);

  if (available !== "readily") {
    throw new Error("Nano is not available");
  }
};

const pageRagPrompt = (context: string) => {
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
  try {
    await checkNanoAvailability("summarizer");
    const summarizer = await window.ai.summarizer.create({
      type: "key-points",
      length: "short",
    });
    const summary = await summarizer.summarize(text);
    root.render(React.createElement(StreamMessage, { outputString: summary }));
  } catch (e) {
    console.error(e);
    root.render(
      React.createElement(StreamMessage, { outputString: e.message }),
    );
  }
};

export const summariseLongContext = async (text: string) => {
  try {
    await checkNanoAvailability("summarizer");
    const summarizer = await window.ai.summarizer.create({
      format: "plain-text",
      length: "long",
    });
    const summary = await summarizer.summarize(text);
    return summary;
  } catch (e) {
    console.error(e);
    return e.message;
  }
};

export const suggestNext = async (text: string) => {
  let session: AILanguageModel | undefined;
  try {
    await checkNanoAvailability("language-model");
    session = await window.ai.languageModel.create({
      systemPrompt: `Task: Generate relevant and diverse continuations for text, generate only one of possible continuations. Your responses should be:
Laconic: Only the words after the input text. Only one sentence.
Relevant: The generated content should be highly relevant to the input text.
Unique: Provide only the most like continuations.
Natural and fluent: The generated text should be grammatically correct and read naturally.
Context-aware: Understand the context and generate responses that are appropriate.`,
      initialPrompts: [
        {
          role: "assistant",
          content: "Try to undesrand the user's intention well.",
        },
      ],
    });
    const result = await session.prompt(text);
    return result;
  } catch (e) {
    return e.message;
  } finally {
    if (session) {
      session.destroy();
    }
  }
};

export const chatWithPage = async (pageText: string, userMessage: string) => {
  let session: AILanguageModel | undefined;
  try {
    await checkNanoAvailability("language-model");
    const session = await window.ai.languageModel.create({
      systemPrompt: pageRagPrompt(pageText),
    });
    return session.prompt(userMessage);
  } catch (e) {
    return e.message;
  } finally {
    if (session) {
      session.destroy();
    }
  }
};
