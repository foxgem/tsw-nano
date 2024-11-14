import { cn } from "./commons";

export const TAB_CSS =
  "data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold data-[state=active]:rounded-t data-[state=active]:border data-[state=active]:border-b-0";

export const TABCONTENT_CSS =
  "border p-5 mt-0 h-[267px] overflow-scroll rounded-b rounded-tr";

export const GITHUB_ROOT = "https://github.com/foxgem/tsw-nano";

export const TABTRIGGER_STYLES = cn(
  "border-t border-l border-r rounded-t px-8 py-2 transition-all text-sm",
  "data-[state=active]:bg-white",
  "data-[state=active]:text-primary",
  "data-[state=active]:border-primary",
  "data-[state=active]:shadow-sm",
  "data-[state=inactive]:bg-transparent",
  "data-[state=inactive]:border-transparent",
  "data-[state=inactive]:text-gray-600",
  "hover:text-primary",
);

export const NANOTYPE_OPTIONS = [
  { value: "language-model", label: "Language Model" },
  { value: "summarizer", label: "Summarizer" },
  // { value: "writer", label: "Writer" },
  // { value: "rewriter", label: "Rewriter" },
];

export const SUMMARIZER_TYPE_OPTIONS = [
  { value: "tl;dr", label: "TL;DR" },
  { value: "key-points", label: "Key Points" },
  { value: "teaser", label: "Teaser" },
  { value: "headline", label: "Headline" },
];

export const FORMAT_OPTIONS = [
  { value: "plain-text", label: "Plain Text" },
  { value: "markdown", label: "Markdown" },
];

export const WRITER_TONE_OPTIONS = [
  { value: "formal", label: "Formal" },
  { value: "neutral", label: "Neutral" },
  { value: "casual", label: "Casual" },
];

export const LENGTH_OPTIONS = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

export const REWRITER_TONE_OPTIONS = [
  { value: "as-is", label: "As Is" },
  { value: "more-formal", label: "More Formal" },
  { value: "more-casual", label: "More Casual" },
];

export const REWRITER_FORMAT_OPTIONS = [
  { value: "as-is", label: "As Is" },
  { value: "plain-text", label: "Plain Text" },
  { value: "markdown", label: "Markdown" },
];

export const REWRITER_LENGTH_OPTIONS = [
  { value: "as-is", label: "As Is" },
  { value: "shorter", label: "Shorter" },
  { value: "longer", label: "Longer" },
];

export const findLabelByValue = (
  options: Array<{ value: string; label: string }>,
  value: string,
) => {
  return options.find((option) => option.value === value)?.label ?? value;
};
