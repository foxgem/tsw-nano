import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Save, X, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~utils/commons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export interface CommandManagerProps {
  category: "slash-commands" | "quick-actions";
}

export type NanoCategory =
  | "language-model"
  | "summarizer"
  | "writer"
  | "rewriter";

export type LMOptions = {
  topK?: number;
  temperature?: number;
  systemPrompt?: string;
  prompt: string;
};

export type SummarizerOptions = {
  sharedContext?: string;
  type?: "tl;dr" | "key-points" | "teaser" | "headline";
  format?: "plain-text" | "markdown";
  length?: "short" | "medium" | "long";
};

export type WriterOptions = {
  sharedContext?: string;
  tone?: "formal" | "neutral" | "casual";
  format?: "plain-text" | "markdown";
  length?: "short" | "medium" | "long";
};

export type RewriterOptions = {
  sharedContext?: string;
  tone?: "as-is" | "more-formal" | "more-casual";
  format?: "as-is" | "plain-text" | "markdown";
  length?: "as-is" | "shorter" | "longer";
};

export type Command = {
  name: string;
  nano: NanoCategory;
  options: LMOptions | SummarizerOptions | WriterOptions | RewriterOptions;
};

const emptyCommand: Command = {
  name: "",
  nano: "language-model",
  options: {
    topK: 1,
    temperature: 0.7,
    systemPrompt: "",
    prompt: "",
  } as LMOptions,
};

const defaultOptionsMap = {
  "language-model": {
    topK: 1,
    temperature: 0.7,
    systemPrompt: "",
    prompt: "",
  } as LMOptions,
  summarizer: {
    sharedContext: "",
    type: "tl;dr",
    format: "plain-text",
    length: "short",
  } as SummarizerOptions,
  writer: {
    sharedContext: "",
    tone: "neutral",
    format: "plain-text",
    length: "medium",
  } as WriterOptions,
  rewriter: {
    sharedContext: "",
    tone: "as-is",
    format: "as-is",
    length: "as-is",
  } as RewriterOptions,
};

const CommandManager: React.FC<CommandManagerProps> = ({ category }) => {
  const [commands, setCommands] = useState<Array<Command>>([]);
  const [currentCommand, setCurrentCommand] = useState<Command>(emptyCommand);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commandToDelete, setCommandToDelete] = useState<Command | null>(null);

  useEffect(() => {
    const loadCommands = () => {
      const savedCommands = localStorage.getItem(category);
      if (savedCommands) {
        setCommands(JSON.parse(savedCommands));
      }
    };
    loadCommands();
  }, [category]);

  const saveToLocalStorage = useMemo(
    () => (updatedCommands: Array<Command>) => {
      localStorage.setItem(category, JSON.stringify(updatedCommands));
      setCommands(updatedCommands);
    },
    [category],
  );

  const validateCommand = (command: Command): string => {
    if (!command.name.trim()) return "Name is required";
    if (command.name.length < 3)
      return "Name must be at least 3 characters long";
    if (command.name.length > 50) return "Name must be less than 50 characters";
    if (command.name.includes(" ")) return "Name must not contain spaces.";
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateCommand(currentCommand);
    if (validationError) {
      setError(validationError);
      return;
    }

    const isExists = commands.some(
      (command) =>
        command.name.toLowerCase() === currentCommand.name.toLowerCase() &&
        (!isEditing || command.name !== selectedCommand?.name),
    );

    if (isExists) {
      setError("A command with this name already exists");
      return;
    }

    const updatedCommands =
      isEditing && selectedCommand
        ? commands.map((command) =>
            command.name === selectedCommand.name ? currentCommand : command,
          )
        : [...commands, currentCommand];

    saveToLocalStorage(updatedCommands);
    setCurrentCommand(emptyCommand);
    setIsEditing(false);
    setSelectedCommand(null);
  };

  const handleDelete = (command: Command) => {
    setCommandToDelete(command);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!commandToDelete) return;

    const updatedCommands = commands.filter(
      (c) => c.name !== commandToDelete.name,
    );
    saveToLocalStorage(updatedCommands);
    setShowDeleteDialog(false);
    setCommandToDelete(null);

    if (selectedCommand?.name === commandToDelete.name) {
      setSelectedCommand(null);
      setCurrentCommand(emptyCommand);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setCurrentCommand(emptyCommand);
    setIsEditing(false);
    setSelectedCommand(null);
    setError("");
  };

  const handleCommandSelect = (command: Command) => {
    setSelectedCommand(command);
    setCurrentCommand(command);
    setIsEditing(true);
    setError("");
  };

  // Rest of the JSX remains identical
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel */}
      <div className="w-64 border-r bg-white p-4 overflow-y-auto">
        <div className="mb-4">
          <Button
            className={cn(
              "px-4 py-2 rounded-full border-0 justify-start",
              "cursor-pointer",
              "transition-colors duration-300",
              "bg-accent hover:bg-primary hover:text-white dark:text-white justify-center w-full",
            )}
            onClick={() => {
              handleCancel();
              setSelectedCommand(null);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> New Command
          </Button>
        </div>
        <div className="space-y-2">
          {commands.map((command) => (
            <div
              key={command.name}
              className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                selectedCommand?.name === command.name ? "bg-gray-100" : ""
              }`}
              onClick={() => handleCommandSelect(command)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleCommandSelect(command);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex justify-between items-center">
                <span className="truncate text-sm font-medium">
                  {command.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(command);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto h-full">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              {isEditing ? "Edit Command" : "Create New Command"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Command Name */}
              <div>
                <label className="text-sm font-medium" htmlFor="commandName">
                  Command Name
                </label>
                <Input
                  id="commandName"
                  placeholder="Enter command name"
                  value={currentCommand?.name || ""}
                  onChange={(e) =>
                    setCurrentCommand({
                      ...currentCommand,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              {/* Nano Type Selection */}
              <div>
                <label className="text-sm font-medium" htmlFor="nanoType">
                  Type
                </label>
                <Select
                  value={currentCommand?.nano}
                  onValueChange={(value: NanoCategory) => {
                    setCurrentCommand({
                      ...currentCommand,
                      nano: value,
                      options: defaultOptionsMap[value],
                    });
                  }}
                >
                  <SelectTrigger id="nanoType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="language-model">
                      Language Model
                    </SelectItem>
                    <SelectItem value="summarizer">Summarizer</SelectItem>
                    <SelectItem value="writer">Writer</SelectItem>
                    <SelectItem value="rewriter">Rewriter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic Options Based on Type */}
              {currentCommand?.nano === "language-model" && (
                <div className="space-y-4">
                  <div>
                    <label
                      className="text-sm font-medium"
                      htmlFor="systemPrompt"
                    >
                      System Prompt
                    </label>
                    <Textarea
                      id="systemPrompt"
                      placeholder="Enter system prompt"
                      value={
                        (currentCommand.options as LMOptions).systemPrompt || ""
                      }
                      onChange={(e) =>
                        setCurrentCommand({
                          ...currentCommand,
                          options: {
                            ...(currentCommand.options as LMOptions),
                            systemPrompt: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="prompt">
                      Prompt
                    </label>
                    <Textarea
                      id="prompt"
                      placeholder="Enter prompt"
                      value={(currentCommand.options as LMOptions).prompt || ""}
                      onChange={(e) =>
                        setCurrentCommand({
                          ...currentCommand,
                          options: {
                            ...(currentCommand.options as LMOptions),
                            prompt: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium" htmlFor="topK">
                        Top K
                      </label>
                      <Input
                        id="topK"
                        type="number"
                        value={(currentCommand.options as LMOptions).topK || 1}
                        onChange={(e) =>
                          setCurrentCommand({
                            ...currentCommand,
                            options: {
                              ...(currentCommand.options as LMOptions),
                              topK: Number.parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium"
                        htmlFor="temperature"
                      >
                        Temperature
                      </label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        value={
                          (currentCommand.options as LMOptions).temperature ||
                          0.7
                        }
                        onChange={(e) =>
                          setCurrentCommand({
                            ...currentCommand,
                            options: {
                              ...(currentCommand.options as LMOptions),
                              temperature: Number.parseFloat(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentCommand?.nano === "summarizer" && (
                <div className="space-y-4">
                  <div>
                    <label
                      className="text-sm font-medium"
                      htmlFor="summarizerContext"
                    >
                      Shared Context
                    </label>
                    <Textarea
                      id="summarizerContext"
                      placeholder="Enter shared context"
                      value={
                        (currentCommand.options as SummarizerOptions)
                          .sharedContext || ""
                      }
                      onChange={(e) =>
                        setCurrentCommand({
                          ...currentCommand,
                          options: {
                            ...(currentCommand.options as SummarizerOptions),
                            sharedContext: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="text-sm font-medium"
                        htmlFor="summarizerType"
                      >
                        Type
                      </label>
                      <Select
                        value={
                          (currentCommand.options as SummarizerOptions)
                            .type as string
                        }
                        onValueChange={(value) =>
                          setCurrentCommand({
                            ...currentCommand,
                            options: {
                              ...(currentCommand.options as SummarizerOptions),
                              type: value as SummarizerOptions["type"],
                            },
                          })
                        }
                      >
                        <SelectTrigger id="summarizerType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tl;dr">TL;DR</SelectItem>
                          <SelectItem value="key-points">Key Points</SelectItem>
                          <SelectItem value="teaser">Teaser</SelectItem>
                          <SelectItem value="headline">Headline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium"
                        htmlFor="summarizerFormat"
                      >
                        Format
                      </label>
                      <Select
                        value={
                          (currentCommand.options as SummarizerOptions)
                            .format as string
                        }
                        onValueChange={(value) =>
                          setCurrentCommand({
                            ...currentCommand,
                            options: {
                              ...(currentCommand.options as SummarizerOptions),
                              format: value as "plain-text" | "markdown",
                            },
                          })
                        }
                      >
                        <SelectTrigger id="summarizerFormat">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plain-text">Plain Text</SelectItem>
                          <SelectItem value="markdown">Markdown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {currentCommand?.nano === "writer" && (
                <div className="space-y-4">
                  <div>
                    <label
                      className="text-sm font-medium"
                      htmlFor="writerContext"
                    >
                      Shared Context
                    </label>
                    <Textarea
                      id="writerContext"
                      placeholder="Enter shared context"
                      value={
                        (currentCommand.options as WriterOptions)
                          .sharedContext || ""
                      }
                      onChange={(e) =>
                        setCurrentCommand({
                          ...currentCommand,
                          options: {
                            ...(currentCommand.options as WriterOptions),
                            sharedContext: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label
                        className="text-sm font-medium"
                        htmlFor="writerTone"
                      >
                        Tone
                      </label>
                      <Select
                        value={
                          (currentCommand.options as WriterOptions)
                            .tone as string
                        }
                        onValueChange={(value) =>
                          setCurrentCommand({
                            ...currentCommand,
                            options: {
                              ...(currentCommand.options as WriterOptions),
                              tone: value as WriterOptions["tone"],
                            },
                          })
                        }
                      >
                        <SelectTrigger id="writerTone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium"
                        htmlFor="writerFormat"
                      >
                        Format
                      </label>
                      <Select
                        value={
                          (currentCommand.options as WriterOptions)
                            .format as string
                        }
                        onValueChange={(value) =>
                          setCurrentCommand({
                            ...currentCommand,
                            options: {
                              ...(currentCommand.options as WriterOptions),
                              format: value as "plain-text" | "markdown",
                            },
                          })
                        }
                      >
                        <SelectTrigger id="writerFormat">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plain-text">Plain Text</SelectItem>
                          <SelectItem value="markdown">Markdown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium"
                        htmlFor="writerLength"
                      >
                        Length
                      </label>
                      <Select
                        value={
                          (currentCommand.options as WriterOptions)
                            .length as string
                        }
                        onValueChange={(value) =>
                          setCurrentCommand({
                            ...currentCommand,
                            options: {
                              ...(currentCommand.options as WriterOptions),
                              length: value as WriterOptions["length"],
                            },
                          })
                        }
                      >
                        <SelectTrigger id="writerLength">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {currentCommand?.nano === "rewriter" && (
                <div className="space-y-4">
                  <div>
                    <label
                      className="text-sm font-medium"
                      htmlFor="rewriterContext"
                    >
                      Shared Context
                    </label>
                    <Textarea
                      id="rewriterContext"
                      placeholder="Enter shared context"
                      value={
                        (currentCommand.options as RewriterOptions)
                          .sharedContext || ""
                      }
                      onChange={(e) =>
                        setCurrentCommand({
                          ...currentCommand,
                          options: {
                            ...(currentCommand.options as RewriterOptions),
                            sharedContext: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label
                        className="text-sm font-medium"
                        htmlFor="rewriterTone"
                      >
                        Tone
                      </label>
                      <Select
                        value={
                          (currentCommand.options as RewriterOptions)
                            .tone as string
                        }
                        onValueChange={(value) =>
                          setCurrentCommand({
                            ...currentCommand,
                            options: {
                              ...(currentCommand.options as RewriterOptions),
                              tone: value as RewriterOptions["tone"],
                            },
                          })
                        }
                      >
                        <SelectTrigger id="rewriterTone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="as-is">As Is</SelectItem>
                          <SelectItem value="more-formal">
                            More Formal
                          </SelectItem>
                          <SelectItem value="more-casual">
                            More Casual
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium"
                        htmlFor="rewriterFormat"
                      >
                        Format
                      </label>
                      <Select
                        value={
                          (currentCommand.options as RewriterOptions)
                            .format as string
                        }
                        onValueChange={(value) =>
                          setCurrentCommand({
                            ...currentCommand,
                            options: {
                              ...(currentCommand.options as RewriterOptions),
                              format: value as RewriterOptions["format"],
                            },
                          })
                        }
                      >
                        <SelectTrigger id="rewriterFormat">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="as-is">As Is</SelectItem>
                          <SelectItem value="plain-text">Plain Text</SelectItem>
                          <SelectItem value="markdown">Markdown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium"
                        htmlFor="rewriterLength"
                      >
                        Length
                      </label>
                      <Select
                        value={
                          (currentCommand.options as RewriterOptions)
                            .length as string
                        }
                        onValueChange={(value) =>
                          setCurrentCommand({
                            ...currentCommand,
                            options: {
                              ...(currentCommand.options as RewriterOptions),
                              length: value as RewriterOptions["length"],
                            },
                          })
                        }
                      >
                        <SelectTrigger id="rewriterLength">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="as-is">As Is</SelectItem>
                          <SelectItem value="shorter">Shorter</SelectItem>
                          <SelectItem value="longer">Longer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className={cn(
                    "px-4 py-2 rounded-full border-0 justify-start",
                    "cursor-pointer",
                    "transition-colors duration-300",
                    "bg-accent hover:bg-primary hover:text-white dark:text-white justify-center",
                  )}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Update
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" /> Add
                    </>
                  )}
                </Button>
                {(isEditing || currentCommand?.name) && (
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "px-4 py-2 rounded-full border-0 justify-start",
                      "cursor-pointer",
                      "transition-colors duration-300",
                      "bg-accent hover:bg-primary hover:text-white dark:text-white justify-center",
                    )}
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              command "{commandToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowDeleteDialog(false)}
              className="rounded-full"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="text-white rounded-full hover:bg-gray-100 hover:text-black"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommandManager;
