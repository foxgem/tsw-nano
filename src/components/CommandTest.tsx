import type {
  Command,
  LMOptions,
  RewriterOptions,
  SummarizerOptions,
  WriterOptions,
} from "~utils/types";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { cn } from "~utils/commons";
import {
  findLabelByValue,
  FORMAT_OPTIONS,
  NANOTYPE_OPTIONS,
  REWRITER_FORMAT_OPTIONS,
  REWRITER_LENGTH_OPTIONS,
  REWRITER_TONE_OPTIONS,
  SUMMARIZER_TYPE_OPTIONS,
  WRITER_LENGTH_OPTIONS,
  WRITER_TONE_OPTIONS,
} from "~utils/constants";
import { useState } from "react";
interface CommandTestProps {
  command: Command;
  categoryName: string;
}
const CommandTest: React.FC<CommandTestProps> = ({ command, categoryName }) => {
  const [testContent, setTestContent] = useState("");
  const [output, setOutput] = useState("");
  const handleTextClick = () => {
    console.log("test", testContent);
    setOutput("test output");
  };
  return (
    <Card className="h-full pt-4">
      <CardContent>
        <div className="grid  grid-cols-2 gap-2 border rounded p-4 text-sm font-medium">
          <div>
            {categoryName} Name: {command.name}
          </div>
          <div>
            Type:
            {findLabelByValue(NANOTYPE_OPTIONS, command.nano)}
          </div>
          {command.nano === "language-model" && (
            <>
              <div>
                System Prompt: {(command.options as LMOptions).systemPrompt}
              </div>
              <div>Prompt: {(command.options as LMOptions).prompt}</div>
              <div>Top K: {(command.options as LMOptions).topK}</div>
              <div>
                Temperature: {(command.options as LMOptions).temperature}
              </div>
            </>
          )}
          {command.nano === "summarizer" && (
            <>
              <div>
                Shared Context:
                {(command.options as SummarizerOptions).sharedContext}
              </div>
              <div>
                {" "}
                Type:
                {findLabelByValue(
                  SUMMARIZER_TYPE_OPTIONS,
                  (command.options as SummarizerOptions).type,
                )}
              </div>
              <div>
                Format:{" "}
                {findLabelByValue(
                  FORMAT_OPTIONS,
                  (command.options as SummarizerOptions).format,
                )}
              </div>
            </>
          )}
          {command.nano === "writer" && (
            <>
              <div>
                Shared Context:
                {(command.options as WriterOptions).sharedContext}
              </div>
              <div>
                Tone:{" "}
                {findLabelByValue(
                  WRITER_TONE_OPTIONS,
                  (command.options as WriterOptions).tone,
                )}
              </div>
              <div>
                Format:
                {findLabelByValue(
                  FORMAT_OPTIONS,
                  (command.options as WriterOptions).format,
                )}
              </div>
              <div>
                Length:
                {findLabelByValue(
                  WRITER_LENGTH_OPTIONS,
                  (command.options as WriterOptions | RewriterOptions).length,
                )}
              </div>
            </>
          )}

          {command.nano === "rewriter" && (
            <>
              <div>
                Shared Context:
                {(command.options as RewriterOptions).sharedContext}
              </div>
              <div>
                Tone:{" "}
                {findLabelByValue(
                  REWRITER_TONE_OPTIONS,
                  (command.options as RewriterOptions).tone,
                )}
              </div>
              <div>
                Format:
                {findLabelByValue(
                  REWRITER_FORMAT_OPTIONS,
                  (command.options as RewriterOptions).format,
                )}
              </div>
              <div>
                Length:
                {findLabelByValue(
                  REWRITER_LENGTH_OPTIONS,
                  (command.options as RewriterOptions).length,
                )}
              </div>
            </>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex justify-center w-full mt-4 space-x-2">
            <input
              type="text"
              value={testContent}
              placeholder="Input test content"
              onChange={(e) => setTestContent(e.target.value)}
              className="flex-1 px-4 py-2 rounded border bg-background text-sm placeholder:text-sm"
            />
            <Button
              className={cn(
                "px-4 py-2 rounded-full border-0 justify-start",
                "cursor-pointer",
                "transition-colors duration-300",
                "bg-accent hover:bg-primary hover:text-white dark:text-white justify-center",
              )}
              onClick={handleTextClick}
            >
              Test
            </Button>
          </div>
          <div className="border rounded p-4 min-h-[300px] ">
            <p className="text-sm text-gray-500">{output}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default CommandTest;
