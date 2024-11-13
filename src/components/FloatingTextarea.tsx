import React, { useEffect, useRef } from "react";
import textareaStyles from "~/css/floating.module.css";
import { List, MessageCircle, MessageSquareText, Plus } from "lucide-react";
import chatStyles from "~/css/chatui.module.css";

interface FloatingInputProps {
  onSubmit: (value: string) => void;
  onChat: () => void;
  onSummary: () => void;
}

const FloatingTextarea: React.FC<FloatingInputProps> = ({
  onSubmit,
  onChat,
  onSummary,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hide = () => {
    if (containerRef.current && textareaRef.current) {
      containerRef.current.style.display = "none";
      textareaRef.current.value = "";
    }
  };

  const show = () => {
    if (containerRef.current && textareaRef.current) {
      containerRef.current.style.display = "block";
      textareaRef.current.focus();
    }
  };

  useEffect(() => {
    const handleInput = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (textareaRef.current) {
        if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
          e.preventDefault();
          const value = textareaRef.current.value;

          onSubmit?.(textareaRef.current.value);
          hide();
        }

        if (e.key === "Escape") {
          hide();
        }
      }
    };

    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.key === "2") {
        e.preventDefault();
        show();
      }
    };

    textareaRef.current?.addEventListener("input", handleInput);
    textareaRef.current?.addEventListener("keydown", handleKeydown);
    document.addEventListener("keydown", handleGlobalKeydown);

    return () => {
      textareaRef.current?.removeEventListener("input", handleInput);
      textareaRef.current?.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("keydown", handleGlobalKeydown);
    };
  }, [onSubmit]);

  const handleChatClick = () => {
    onChat();
    hide();
  };

  const handleSummaryClick = () => {
    onSummary();
    hide();
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => e.stopPropagation()}
      onBlur={(e) => {
        const suggestContainer = document.getElementById(
          "tsw-suggest-container",
        );
        if (suggestContainer) {
          return;
        }
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          hide();
        }
      }}
      className={textareaStyles.tswFloatingTextareaContainer}
    >
      <textarea
        ref={textareaRef}
        placeholder="Ask @nano..."
        className={textareaStyles.tswFloatingTextarea}
      />
      <div className={textareaStyles.tswFloatingIconContainer}>
        <div className={textareaStyles.tswFloatingLeftIcons}>
          <button type="button" className={chatStyles.tswActionBtn}>
            <List className={textareaStyles.tswFloatingIcon} />
          </button>
          <button type="button" className={chatStyles.tswActionBtn}>
            <Plus className={textareaStyles.tswFloatingIcon} />
          </button>
          <button type="button" className={chatStyles.tswActionBtn}>
            <MessageCircle className={textareaStyles.tswFloatingIcon} />
          </button>
        </div>
        <div className={textareaStyles.tswFloatingRightIcons}>
          <button
            type="button"
            className={chatStyles.tswActionBtn}
            onClick={handleSummaryClick}
          >
            <List className={textareaStyles.tswFloatingIcon} />
          </button>
          <button
            type="button"
            className={chatStyles.tswActionBtn}
            onClick={handleChatClick}
            id="chatBtn"
          >
            <MessageSquareText className={textareaStyles.tswFloatingIcon} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingTextarea;
