import { useState } from "react";
import { callNanoModel } from "~utils/ai";
import { cn } from "~utils/commons";
import {
  FORMAT_OPTIONS,
  LENGTH_OPTIONS,
  NANOTYPE_OPTIONS,
  REWRITER_FORMAT_OPTIONS,
  REWRITER_LENGTH_OPTIONS,
  REWRITER_TONE_OPTIONS,
  SUMMARIZER_TYPE_OPTIONS,
  WRITER_TONE_OPTIONS,
  findLabelByValue,
} from "~utils/constants";
import type {
  Command,
  LMOptions,
  RewriterOptions,
  SummarizerOptions,
  WriterOptions,
} from "~utils/types";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface CommandTestTabProps {
  command: Command;
  category: string;
}

const CommandTestTab: React.FC<CommandTestTabProps> = ({
  command,
  category,
}) => {
  const [testContent, setTestContent] = useState("");
  const handleTextClick = async () => {
    const element = document.getElementById("command-test-output");
    await callNanoModel(command, testContent, element);
  };

  return (
    <Card className="h-full pt-4">
      <CardContent>
        <div className="border rounded p-4 text-sm font-medium text-black">
          <div>Name: {command.name}</div>

          <div>
            Type: {findLabelByValue(NANOTYPE_OPTIONS[category], command.nano)}
          </div>
          {command.nano === "languageModel" && (
            <>
              <div className="break-all">
                System Prompt: {(command.options as LMOptions).systemPrompt}
              </div>
              <div className="grid  grid-cols-2 gap-2 ">
                <div>Top K: {(command.options as LMOptions).topK}</div>
                <div>
                  Temperature: {(command.options as LMOptions).temperature}
                </div>
              </div>
            </>
          )}
          {command.nano === "summarizer" && (
            <>
              <div>
                Shared Context:
                {(command.options as SummarizerOptions).sharedContext}
              </div>
              <div className="grid  grid-cols-2 gap-2 ">
                <div>
                  Type:
                  {findLabelByValue(
                    SUMMARIZER_TYPE_OPTIONS,
                    (command.options as SummarizerOptions).type,
                  )}
                </div>
                <div>
                  Format:
                  {findLabelByValue(
                    FORMAT_OPTIONS,
                    (command.options as SummarizerOptions).format,
                  )}
                </div>
                <div>
                  Length:
                  {findLabelByValue(
                    FORMAT_OPTIONS,
                    (command.options as SummarizerOptions).length,
                  )}
                </div>
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
                  LENGTH_OPTIONS,
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
              className="flex-1 px-4 py-2 rounded border bg-white text-sm placeholder:text-sm text-black"
            />
            <Button
              className={cn(
                "px-4 py-2 rounded-full border-0 justify-start",
                "cursor-pointer",
                "transition-colors duration-300",
                "bg-primary hover:opacity-75 hover:bg-primary text-white dark:text-white justify-center",
              )}
              onClick={handleTextClick}
            >
              Test
            </Button>
          </div>
          <div className="border rounded p-4 min-h-[300px] ">
            <p id="command-test-output" className="text-sm text-gray-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommandTestTab;
