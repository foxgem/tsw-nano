import { TabsTrigger } from "@radix-ui/react-tabs";
import { AlertTriangle, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import CommandTestTab from "~components/CommandTestTab";
import { Tabs, TabsContent, TabsList } from "~components/ui/tabs";
import { cn } from "~utils/commons";
import {
  FORMAT_OPTIONS,
  LENGTH_OPTIONS,
  NANOTYPE_OPTIONS,
  REWRITER_FORMAT_OPTIONS,
  REWRITER_LENGTH_OPTIONS,
  REWRITER_TONE_OPTIONS,
  SUMMARIZER_TYPE_OPTIONS,
  TABTRIGGER_STYLES,
  WRITER_TONE_OPTIONS,
} from "~utils/constants";
import type {
  Command,
  LMOptions,
  NanoApi,
  RewriterOptions,
  SummarizerOptions,
  WriterOptions,
} from "~utils/types";

export interface CommandManagerProps {
  category: "system-prompts" | "quick-actions";
}

const emptyCommand: Command = {
  name: "",
  nano: "languageModel",
  options: {
    topK: 1,
    temperature: 0.7,
    systemPrompt: "",
  } as LMOptions,
};

const defaultOptionsMap = {
  languageModel: {
    topK: 3,
    temperature: 1,
    systemPrompt: "",
  } as LMOptions,
  summarizer: {
    sharedContext: "",
    type: "tl;dr",
    format: "markdown",
    length: "short",
  } as SummarizerOptions,
  writer: {
    sharedContext: "",
    tone: "neutral",
    format: "markdown",
    length: "short",
  } as WriterOptions,
  rewriter: {
    sharedContext: "",
    tone: "as-is",
    format: "markdown",
    length: "shorter",
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
    const loadCommands = async () => {
      const result = await chrome.storage.local.get(category);
      if (result[category]) {
        setCommands(result[category]);
      }
    };
    loadCommands();
  }, [category]);

  const saveToLocalStorage = useMemo(
    () => async (updatedCommands: Array<Command>) => {
      await chrome.storage.local.set({ [category]: updatedCommands });
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

    if (command.nano === "languageModel") {
      const { topK, temperature } = command.options as LMOptions;
      if (topK < 1 || topK > 8) return "Top-K must be between 1 and 8";
      if (temperature < 0.1)
        return "Temperature must be greater than or equal to 0.1";
      if ((topK && !temperature) || (!topK && temperature)) {
        return "Both Top-K and Temperature must be provided if one is set";
      }
    }

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
      setError("Already exists");
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

  useEffect(() => {
    if (commands.length >= 5 && !isEditing) {
      setError("Limited 5");
    } else {
      setError("");
    }
  }, [commands.length, isEditing]);

  // Rest of the JSX remains identical
  return (
    <div className="flex bg-gray-50">
      {/* Left Panel */}
      <div className="w-64 border-r bg-white p-4 ">
        <div className="mb-4">
          <Button
            className={cn(
              "px-4 py-2 rounded-full border-0 justify-start",
              "cursor-pointer",
              "transition-colors duration-300 w-full",
              "bg-primary hover:opacity-75 hover:bg-primary text-white dark:text-white justify-center",
              commands.length >= 5 && "opacity-50 cursor-not-allowed",
            )}
            disabled={commands.length >= 5}
            onClick={() => {
              handleCancel();
              setSelectedCommand(null);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> New
          </Button>
        </div>
        <div className="space-y-2 overflow-y-auto h-[500px]">
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
                <span className="truncate text-sm font-medium w-[190px]">
                  {command.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(command);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red hover:text-gray-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="settings">
          <TabsList>
            <TabsTrigger value="settings" className={TABTRIGGER_STYLES}>
              Setting
            </TabsTrigger>
            <TabsTrigger value="test" className={TABTRIGGER_STYLES}>
              Test
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card className="h-[520px] rounded-lg border pt-4">
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        className="text-sm font-medium"
                        htmlFor="commandName"
                      >
                        Name
                      </label>
                      <Input
                        id="commandName"
                        placeholder={"Enter name"}
                        value={currentCommand?.name || ""}
                        onChange={(e) =>
                          setCurrentCommand({
                            ...currentCommand,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium" htmlFor="nanoType">
                        Type
                      </label>
                      <Select
                        value={currentCommand?.nano}
                        onValueChange={(value: NanoApi) => {
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
                          {NANOTYPE_OPTIONS[category].map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Dynamic Options Based on Type */}
                  {currentCommand?.nano === "languageModel" && (
                    <div className="space-y-4">
                      <div className="w-full">
                        <label
                          className="text-sm font-medium"
                          htmlFor="systemPrompt"
                        >
                          System Prompt
                        </label>
                        <Textarea
                          id="systemPrompt"
                          className="w-full rounded  text-sm placeholder:text-sm"
                          placeholder="Enter system prompt"
                          value={
                            (currentCommand.options as LMOptions)
                              .systemPrompt || ""
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium" htmlFor="topK">
                            Top K
                          </label>
                          <Input
                            id="topK"
                            type="number"
                            max="8"
                            value={
                              (currentCommand.options as LMOptions).topK || 1
                            }
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
                              (currentCommand.options as LMOptions)
                                .temperature || 0.7
                            }
                            onChange={(e) =>
                              setCurrentCommand({
                                ...currentCommand,
                                options: {
                                  ...(currentCommand.options as LMOptions),
                                  temperature: Number.parseFloat(
                                    e.target.value,
                                  ),
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
                          className="w-full rounded  text-sm placeholder:text-sm"
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
                      <div className="grid grid-cols-3 gap-4">
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
                              {SUMMARIZER_TYPE_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
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
                              {FORMAT_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label
                            className="text-sm font-medium"
                            htmlFor="summarizerLength"
                          >
                            Length
                          </label>
                          <Select
                            value={
                              (currentCommand.options as SummarizerOptions)
                                .length as string
                            }
                            onValueChange={(value) =>
                              setCurrentCommand({
                                ...currentCommand,
                                options: {
                                  ...(currentCommand.options as SummarizerOptions),
                                  length: value as SummarizerOptions["length"],
                                },
                              })
                            }
                          >
                            <SelectTrigger id="summarizerLength">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LENGTH_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
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
                          className="w-full rounded  text-sm placeholder:text-sm"
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
                              {WRITER_TONE_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
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
                              {FORMAT_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
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
                              {LENGTH_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
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
                          className="w-full rounded  text-sm placeholder:text-sm"
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
                              {REWRITER_TONE_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
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
                              {REWRITER_FORMAT_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
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
                              {REWRITER_LENGTH_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
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
                        "bg-primary hover:opacity-75 hover:bg-primary text-white dark:text-white justify-center",
                        commands.length >= 5 &&
                          !isEditing &&
                          "opacity-50 cursor-not-allowed",
                      )}
                      disabled={commands.length >= 5 && !isEditing}
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
                          "px-4 py-2 rounded-full border justify-start",
                          "cursor-pointer",
                          "transition-colors duration-300",
                          "bg-background hover:bg-accent hover:text-accent-foreground dark:text-white justify-center",
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
          </TabsContent>

          <TabsContent value="test" className="h-[520px]">
            <CommandTestTab command={currentCommand} category={category} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the "
              {commandToDelete?.name}".
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
              className="text-white rounded-full hover:bg-primary hover:opacity-75"
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
