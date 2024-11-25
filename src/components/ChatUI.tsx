"use client";
import {
  CircleArrowUp,
  CircleStop,
  Copy,
  Pencil,
  RefreshCw,
  SquareX,
} from "lucide-react";
import { marked } from "marked";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import chatStyles from "~/css/chatui.module.css";
import commontyles from "~/css/common.module.css";
import { cn, upperCaseFirstLetter } from "~/utils/commons";
import { nanoPrompt, pageRagPrompt, summariseLongContext } from "~utils/ai";
import type { Command, LMOptions } from "~utils/types";
import { ActionIcon } from "./ActionIcon";
import { StreamMessage } from "./StreamMessage";
import SystemPromptMenu from "./SystemPromptMenu";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";

marked.setOptions({
  breaks: true,
});

const prepareSystemPrompt = async (pageText: string, customPrompt?: string) => {
  let pageContent = pageText;
  if (pageText.length >= 30000) {
    pageContent = await summariseLongContext(pageText);
  }

  if (customPrompt) {
    return `${customPrompt}\n\nThis page content:\n\n${pageContent}`;
  }

  return pageRagPrompt(pageContent);
};

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  isComplete?: boolean;
  isThinking?: boolean;
};

export interface ChatUIProps {
  readonly pageText: string;
}

export function ChatUI({ pageText }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortController = useRef<AbortController | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<Command>({
    name: "Default",
    nano: "languageModel",
    options: {},
  });

  const { toast } = useToast();

  useEffect(() => {
    if (messages.length > 0) {
      const viewport = document.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (viewport) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            viewport.scrollTo({
              top: viewport.scrollHeight,
              behavior: "smooth",
            });
          }, 100);
        });
      }
    }
  }, [messages]);

  useEffect(() => {
    const header = document.getElementById("tsw-panel-header");
    const footer = document.getElementById("tsw-panel-footer");
    if (header && footer) {
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.getBoundingClientRect().height}px`,
      );
      document.documentElement.style.setProperty(
        "--footer-height",
        `${footer.getBoundingClientRect().height}px`,
      );
    }
  }, []);

  const handleStopChat = () => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
      setIsStreaming(false);
    }
  };

  const handleSend = async (
    e: React.FormEvent,
    customMessages?: Message[],
    lastUserMessage?: string,
  ) => {
    const currentMessage = inputValue.trim() || lastUserMessage.trim();
    e.preventDefault();
    if (isSubmitting || !currentMessage) return;
    setIsSubmitting(true);
    setIsStreaming(true);

    if (currentMessage.trim()) {
      try {
        abortController.current = new AbortController();
        const baseMessages = customMessages || messages;

        // Only add a new user message if we're not editing
        const newMessages = customMessages
          ? baseMessages
          : ([
              ...baseMessages,
              {
                content: currentMessage,
                role: "user",
                id: baseMessages.length,
              },
            ] as Message[]);

        setInputValue("");
        const textarea = document.getElementById("tsw-chat-textarea");
        if (textarea) {
          textarea.style.height = "80px";
        }
        setMessages(newMessages);

        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "TSW",
            id: newMessages.length,
            isThinking: true,
          },
        ]);

        const customPrompt =
          systemPrompt.name === "Default"
            ? undefined
            : (systemPrompt.options as LMOptions).systemPrompt;
        const textStream = await nanoPrompt(
          newMessages[newMessages.length - 1].content,
          await prepareSystemPrompt(pageText, customPrompt),
        );
        let fullText = "";

        for await (const text of textStream) {
          fullText += text;
          setMessages([
            ...newMessages,
            { role: "assistant", content: fullText, id: newMessages.length },
          ]);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Chat was stopped");
        }
      } finally {
        setIsSubmitting(false);
        abortController.current = null;
        setIsStreaming(false);
      }
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast({
        description: "Copied.",
      });
    });
  };

  const handleEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setInputValue(message.content);

    requestAnimationFrame(() => {
      const textarea = document.getElementById(
        "tsw-chat-textarea",
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setInputValue("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !inputValue.trim() || editingMessageId === null) return;

    const updatedMessages = messages.map((msg) =>
      msg.id === editingMessageId ? { ...msg, content: inputValue } : msg,
    );

    const messagesBeforeEdit = updatedMessages.filter(
      (msg) => msg.id <= editingMessageId,
    );

    setMessages(messagesBeforeEdit);
    setEditingMessageId(null);
    await handleSend(e, messagesBeforeEdit);
  };

  const handleRefresh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || messages.length < 2) return;

    const lastUserMessageIndex = messages.length - 2;
    const messagesUpToLastUser = messages.slice(0, lastUserMessageIndex + 1);
    setMessages(messagesUpToLastUser);
    await handleSend(
      e,
      messagesUpToLastUser,
      messages[lastUserMessageIndex].content,
    );
  };

  const handlePromptSelect = (prompt: Command) => {
    setSystemPrompt(prompt);
  };

  return (
    <>
      <div className={chatStyles.chatContainer}>
        <div className={chatStyles.chatContent}>
          <ScrollArea className={chatStyles.scrollArea}>
            {messages.length === 0 && (
              <div className={chatStyles.welcomeMessage}>
                Hi, how can I help you?
              </div>
            )}

            {messages.map((m, index) => (
              <div
                key={m.id}
                className={cn(
                  chatStyles.messageContainer,
                  m.role === "user"
                    ? chatStyles.userMessage
                    : chatStyles.assistantMessage,
                )}
              >
                <div
                  className={cn(
                    chatStyles.chatItemContainer,
                    m.role === "user" ? chatStyles.userChatItem : "",
                    chatStyles.tswChatItem,
                    String(m.content).split("\n").length === 1
                      ? chatStyles.tswChatItemSingle
                      : "",
                  )}
                >
                  {m.role === "assistant" && (
                    <ActionIcon name={upperCaseFirstLetter(m.role)} />
                  )}
                  <div
                    className={cn(
                      chatStyles.messageContent,
                      m.role === "assistant" && chatStyles.assistantContent,
                    )}
                  >
                    {m.role === "user" || m.id === 0 ? (
                      <p
                        dangerouslySetInnerHTML={{
                          __html: marked(m.content as string),
                        }}
                      />
                    ) : m.content === "TSW" ? (
                      <div className={chatStyles.loadingContainer}>
                        <div className={chatStyles.loadingDot}>
                          <div className={chatStyles.dotBase} />
                          <div className={chatStyles.dotPing} />
                        </div>
                      </div>
                    ) : (
                      <StreamMessage
                        outputString={m.content}
                        onStreamComplete={(isComplete) => {
                          setMessages((prev) =>
                            prev.map((msg) =>
                              msg.id === m.id ? { ...msg, isComplete } : msg,
                            ),
                          );
                        }}
                      />
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className={chatStyles.tswUser}>
                      <ActionIcon name={upperCaseFirstLetter(m.role)} />
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    chatStyles.actionContainer,
                    m.role === "user"
                      ? chatStyles.userActionContainer
                      : chatStyles.assistantActionContainer,
                  )}
                >
                  {(m.role === "user" || m.isComplete) && m.content && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={commontyles.tswActionBtn}
                        onClick={() => copyToClipboard(m.content)}
                      >
                        <Copy size={16} />
                      </Button>
                      {m.role === "user" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={commontyles.tswActionBtn}
                          onClick={() => handleEdit(m)}
                          disabled={isStreaming || editingMessageId !== null}
                        >
                          <Pencil size={16} />
                        </Button>
                      )}
                      {m.role === "assistant" &&
                        index === messages.length - 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={commontyles.tswActionBtn}
                            onClick={(e) => handleRefresh(e)}
                            disabled={isStreaming || editingMessageId !== null}
                          >
                            <RefreshCw size={16} />
                          </Button>
                        )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
      <div className={chatStyles.tswPanelFooter} id="tsw-panel-footer">
        <div className={chatStyles.inputContainer}>
          <Textarea
            value={inputValue}
            onChange={async (e) => {
              setInputValue(e.target.value);

              // if (e.target.value.length >= 2) {
              //   console.log(await suggestNext(e.target.value));
              // }

              // Auto-resize the textarea
              const textarea = e.target as HTMLTextAreaElement;
              textarea.style.height = "auto";
              textarea.style.height = `${Math.min(
                textarea.scrollHeight,
                200,
              )}px`; // Set maximum height to 200px
            }}
            placeholder={
              editingMessageId !== null
                ? "Edit your message..."
                : "Type your message..."
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                if (editingMessageId !== null) {
                  handleEditSubmit(e);
                } else {
                  handleSend(e);
                }
              }
            }}
            className={chatStyles.textarea}
            rows={1}
            style={{
              minHeight: "80px",
              maxHeight: "200px",
              overflow: "auto",
              resize: "none",
              height: "unset",
            }}
            id="tsw-chat-textarea"
          />
          <div className={chatStyles.editActions}>
            <div>
              <SystemPromptMenu
                category="system-prompts"
                onSelect={(prompt) => handlePromptSelect(prompt)}
              />
            </div>
            <div>
              {editingMessageId !== null && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={commontyles.tswActionBtn}
                  onClick={handleCancelEdit}
                >
                  <SquareX />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={commontyles.tswActionBtn}
                onClick={(e) => {
                  if (editingMessageId !== null) {
                    handleEditSubmit(e);
                  } else {
                    handleSend(e);
                  }
                }}
              >
                <CircleArrowUp className={chatStyles.submitIcon} />
              </Button>
              {isStreaming && !editingMessageId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStopChat}
                  className={chatStyles.tswActionBtn}
                >
                  <CircleStop className={chatStyles.stopIcon} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
