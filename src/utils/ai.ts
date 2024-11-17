import React from "react";
import { createRoot } from "react-dom/client";
import { StreamMessage } from "~/components/StreamMessage";
import type { Command, NanoApi } from "./types";

const checkNanoAvailability = async (api: NanoApi) => {
  if (!window.ai || !window.ai[api]) {
    throw new Error("Nano is not available");
  }

  if ("capabilities" in window.ai[api]) {
    const { available } = await window.ai[api].capabilities();
    if (available !== "readily") {
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
  try {
    if (text.length > 4096) {
      console.log(text.length);
      throw new Error("Text is too long for summarization");
    }

    await checkNanoAvailability("summarizer");
    const summarizer = await window.ai.summarizer.create({
      sharedContext:
        "Keep the summary concise and relevant to the text without providing unnecessary information and explanations.",
      type: "key-points",
      length: "short",
    });

    const summary = await summarizer.summarize(text);
    root.render(React.createElement(StreamMessage, { outputString: summary }));
  } catch (e) {
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

export const predictNextInput = async (text: string) => {
  const systemPrompt = `Task: Generate relevant and diverse continuations for text, generate only one of possible continuations.Your responses should be:
      Laconic: Only the words after the input text. Only one sentence.
      Relevant: The generated content should be highly relevant to the input text.
      Unique: Provide only the most like continuations.
      Natural and fluent: The generated text should be grammatically correct and read naturally.
      Context-aware: Understand the context and generate responses that are appropriate.
  `;
  return await nanoPrompt(text, systemPrompt, [
    {
      role: "assistant",
      content: "Predict the user's next inputting based on the given text.",
    },
  ]);
};

export async function translate(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  messageElement: HTMLElement,
) {
  const root = createRoot(messageElement);
  try {
    if (
      "translation" in window &&
      "createTranslator" in (window.translation as any)
    ) {
      const translator = await (window.translation as any).createTranslator({
        sourceLanguage,
        targetLanguage,
      });
      const result = await translator.translate(text);
      root.render(
        React.createElement(StreamMessage, {
          outputString: `
        ${text}
        ------ translation ------
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
