import { marked } from "marked";
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
import { Textarea } from "./ui/textarea";

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
    <Card className="pt-4 h-full overflow-scroll">
      <CardContent className="px-4">
        <div className="text-sm font-medium text-black border-b pb-2">
          <div className="grid grid-cols-2 gap-2">
            {command.name && (
              <div className="mb-2">
                <span className="p-1">{command.name}</span>
              </div>
            )}
            <div className="mb-2">
              <span className="p-1">
                {findLabelByValue(NANOTYPE_OPTIONS[category], command.nano)}
              </span>
            </div>
          </div>
          {command.nano === "languageModel" && (
            <>
              {(command.options as LMOptions).systemPrompt && (
                <div className="break-all">
                  System Prompt:
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked(
                        (command.options as LMOptions).systemPrompt,
                      ),
                    }}
                    className="my-2 p-4 border rounded markdownContainer"
                  />
                </div>
              )}
              <div className="grid  grid-cols-2 gap-2 ">
                <div>
                  Top K:{" "}
                  <span className="p-1">
                    {(command.options as LMOptions).topK}
                  </span>
                </div>
                <div>
                  Temperature:{" "}
                  <span className="p-1">
                    {(command.options as LMOptions).temperature}
                  </span>
                </div>
              </div>
            </>
          )}
          {command.nano === "summarizer" && (
            <>
              {(command.options as SummarizerOptions).sharedContext && (
                <div className="break-all">
                  Shared Context:
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked(
                        (command.options as SummarizerOptions).sharedContext,
                      ),
                    }}
                    className="my-2 p-4 border rounded markdownContainer"
                  />
                </div>
              )}
              <div className="grid  grid-cols-3 gap-2 ">
                <div>
                  Type:
                  <span className="p-1">
                    {findLabelByValue(
                      SUMMARIZER_TYPE_OPTIONS,
                      (command.options as SummarizerOptions).type,
                    )}
                  </span>
                </div>
                <div>
                  Format:
                  <span className="p-1">
                    {findLabelByValue(
                      FORMAT_OPTIONS,
                      (command.options as SummarizerOptions).format,
                    )}
                  </span>
                </div>
                <div>
                  Length:
                  <span className="p-1">
                    {findLabelByValue(
                      FORMAT_OPTIONS,
                      (command.options as SummarizerOptions).length,
                    )}
                  </span>
                </div>
              </div>
            </>
          )}
          {command.nano === "writer" && (
            <>
              {(command.options as WriterOptions).sharedContext && (
                <div className="break-all">
                  Shared Context:
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked(
                        (command.options as WriterOptions).sharedContext,
                      ),
                    }}
                    className="my-2 p-4 border rounded markdownContainer"
                  />
                </div>
              )}
              <div>
                Tone:{" "}
                <span className="p-1">
                  {findLabelByValue(
                    WRITER_TONE_OPTIONS,
                    (command.options as WriterOptions).tone,
                  )}
                </span>
              </div>
              <div>
                Format:
                <span className="p-1">
                  {findLabelByValue(
                    FORMAT_OPTIONS,
                    (command.options as WriterOptions).format,
                  )}
                </span>
              </div>
              <div>
                Length:
                <span className="p-1">
                  {findLabelByValue(
                    LENGTH_OPTIONS,
                    (command.options as WriterOptions | RewriterOptions).length,
                  )}
                </span>
              </div>
            </>
          )}

          {command.nano === "rewriter" && (
            <>
              {(command.options as RewriterOptions).sharedContext && (
                <div className="break-all">
                  Shared Context:
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked(
                        (command.options as RewriterOptions).sharedContext,
                      ),
                    }}
                    className="my-2 p-4 border rounded markdownContainer"
                  />
                </div>
              )}
              <div>
                Tone:
                <span className="p-1">
                  {findLabelByValue(
                    REWRITER_TONE_OPTIONS,
                    (command.options as RewriterOptions).tone,
                  )}
                </span>
              </div>
              <div>
                Format:
                <span className="p-1">
                  {findLabelByValue(
                    REWRITER_FORMAT_OPTIONS,
                    (command.options as RewriterOptions).format,
                  )}
                </span>
              </div>
              <div>
                Length:
                <span className="p-1">
                  {findLabelByValue(
                    REWRITER_LENGTH_OPTIONS,
                    (command.options as RewriterOptions).length,
                  )}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex justify-center items-center w-full mt-4 space-x-2">
            <Textarea
              value={testContent}
              placeholder="Input test content"
              onChange={(e) => setTestContent(e.target.value)}
              className="flex-1 px-4 py-2 rounded border bg-white text-sm placeholder:text-sm text-black min-h-[58px] focus:border"
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
