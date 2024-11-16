import { useEffect, useState } from "react";
import textareaStyles from "~/css/floating.module.css";
import type { Command } from "~/utils/types";

interface SuggestListProps {
  onSelect: (item: string) => void;
  category: "system-prompts" | "quick-actions";
}

const SuggestList: React.FC<SuggestListProps> = ({ onSelect, category }) => {
  const [commands, setCommands] = useState<Command[]>([]);

  useEffect(() => {
    const loadCommands = async () => {
      try {
        const result = await chrome.storage.local.get(category);
        if (result[category]) {
          setCommands(result[category]);
        }
      } catch (error) {
        console.error("Error loading commands:", error);
      }
    };

    loadCommands();
  }, [category]);

  return (
    <div className={textareaStyles.tswSuggestionsList} id="tsw-suggestionsList">
      {commands.map((command) => (
        <button
          key={`key-${command.name}`}
          className={textareaStyles.tswSuggestionItem}
          onClick={() => onSelect(command.name)}
        >
          /{command.name}
        </button>
      ))}
    </div>
  );
};

export default SuggestList;
