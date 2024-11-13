import textareaStyles from "~/css/floating.module.css";
interface SuggestListProps {
  onSelect: (item: string) => void;
}

const SuggestList: React.FC<SuggestListProps> = ({ onSelect }) => {
  const items = [
    "总结这段内容",
    "解释这段内容",
    "翻译成中文",
    "翻译成英文",
    "检查语法错误",
    "解释这段内容",
    "翻译成中文",
    "翻译成英文",
    "检查语法错误",
    "解释这段内容",
    "翻译成中文",
    "翻译成英文",
    "检查语法错误",
  ];
  return (
    <div className={textareaStyles.tswSuggestionsList} id="tsw-suggestionsList">
      {items.map((item, index) => (
        <button
          key={`key-${item}`}
          className={textareaStyles.tswSuggestionItem}
          onClick={() => onSelect(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
};

export default SuggestList;
