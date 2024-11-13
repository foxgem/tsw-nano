import React from "react";
import { createRoot } from "react-dom/client";
import { StreamMessage } from "~/components/StreamMessage";

type LinePrinter = (text: string) => void;

const pageRagPrompt = (context: string) => {
  return `
  You are an expert in answering user questions. You always understand user questions well, and then provide high-quality answers based on the information provided in the context.
  Try to keep the answer concise and relevant to the context without providing unnecessary information and explanations.
  If the provided context does not contain relevant information, just respond "I could not find the answer based on the context you provided."
  Context:
  ${context}
  `;
};

const checkNanoAvailability = async () => {
  const { available } = await window.ai.languageModel.capabilities();
  if (available !== "readily") {
    throw new Error("Nano model is not available");
  }
};

const genTextFunction = async (
  prompt: string,
  system: string,
  messageElement: HTMLElement,
) => {
  const root = createRoot(messageElement);

  try {
    await checkNanoAvailability();
    const nano = await window.ai.languageModel.create({
      systemPrompt: system,
    });
    const result = await nano.prompt(prompt);
    root.render(React.createElement(StreamMessage, { outputString: result }));
  } catch (e) {
    root.render(
      React.createElement(StreamMessage, { outputString: e.message }),
    );
  }
};

const genChatFunction = async (
  messages: Array<{ role: "system"; content: string }>,
  messageElement: HTMLElement,
) => {
  const root = createRoot(messageElement);

  try {
    const root = createRoot(messageElement);
    // const google = createGoogleGenerativeAI({ apiKey });
    // const { textStream } = await streamText({
    //   model: google("gemini-1.5-flash"),
    //   messages,
    // });

    // const results: string[] = [];
    // for await (const text of textStream) {
    //   results.push(text);
    //   root.render(
    //     React.createElement(StreamMessage, { outputString: results.join("") }),
    //   );
    // }
  } catch (e) {
    root.render(
      React.createElement(StreamMessage, { outputString: e.message }),
    );
  }
};

export const summarise = async (text: string, messageElement: HTMLElement) => {
  const root = createRoot(messageElement);
  const canSummarize = await window.ai.summarizer.capabilities();

  if (canSummarize.available === "no") {
    root.render(
      React.createElement(StreamMessage, {
        outputString: "No summarizer model available",
      }),
    );
    return;
  }
  const summarizer = await window.ai.summarizer.create({
    type: "key-points",
    length: "short",
  });
  try {
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
  const canSummarize = await window.ai.summarizer.capabilities();
  if (canSummarize.available === "no") {
    return;
  }

  const summarizer = await window.ai.summarizer.create({
    format: "plain-text",
    length: "long",
  });

  try {
    const summary = await summarizer.summarize(text);
    return summary;
  } catch (e) {
    console.error(e);
    return e.message;
  }
};

export const suggestNext = async (text: string) => {
  try {
    await checkNanoAvailability();
    const nano = await window.ai.languageModel.create({
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
    const result = await nano.prompt(text);
    return result;
  } catch (e) {
    return e.message;
  }
};

export const pageRag = (
  message: string,
  context: string,
  linePrinter: LinePrinter,
) => {
  // genAIFunction(pageRagPrompt(message, context));
};

export const chatWithPage = async (pageText: string, userMessage: string) => {
  let session: AILanguageModel | undefined;
  try {
    await checkNanoAvailability();
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
