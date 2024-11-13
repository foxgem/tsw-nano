import { useState, useEffect } from "react";
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

const PromptManager = () => {
  const [prompts, setPrompts] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState({
    title: "",
    content: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState(null);

  useEffect(() => {
    const savedPrompts = localStorage.getItem("prompts");
    if (savedPrompts) {
      setPrompts(JSON.parse(savedPrompts));
    }
  }, []);

  const saveToLocalStorage = (updatedPrompts) => {
    localStorage.setItem("prompts", JSON.stringify(updatedPrompts));
    setPrompts(updatedPrompts);
  };

  const validatePrompt = (prompt) => {
    if (!prompt.title.trim()) {
      return "Title is required";
    }
    if (prompt.title.length < 3) {
      return "Title must be at least 3 characters long";
    }
    if (!prompt.content.trim()) {
      return "Content is required";
    }
    if (prompt.content.length < 10) {
      return "Content must be at least 10 characters long";
    }
    if (prompt.title.length > 50) {
      return "Title must be less than 50 characters";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const validationError = validatePrompt(currentPrompt);
    if (validationError) {
      setError(validationError);
      return;
    }

    const isTitleExists = prompts.some(
      (prompt) =>
        prompt.title.toLowerCase() === currentPrompt.title.toLowerCase() &&
        (!isEditing || prompt.title !== selectedPrompt?.title),
    );

    if (isTitleExists) {
      setError("A prompt with this title already exists");
      return;
    }

    if (isEditing && selectedPrompt) {
      const updatedPrompts = prompts.map((prompt) =>
        prompt.title === selectedPrompt.title ? currentPrompt : prompt,
      );
      saveToLocalStorage(updatedPrompts);
    } else {
      saveToLocalStorage([...prompts, currentPrompt]);
    }

    setCurrentPrompt({ title: "", content: "" });
    setIsEditing(false);
    setSelectedPrompt(null);
  };

  const handleEdit = (prompt) => {
    setCurrentPrompt(prompt);
    setSelectedPrompt(prompt);
    setIsEditing(true);
    setError("");
  };

  const handleDelete = (prompt) => {
    setPromptToDelete(prompt);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    const updatedPrompts = prompts.filter(
      (p) => p.title !== promptToDelete.title,
    );
    saveToLocalStorage(updatedPrompts);
    setShowDeleteDialog(false);
    setPromptToDelete(null);
    if (selectedPrompt?.title === promptToDelete.title) {
      setSelectedPrompt(null);
      setCurrentPrompt({ title: "", content: "" });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setCurrentPrompt({ title: "", content: "" });
    setIsEditing(false);
    setSelectedPrompt(null);
    setError("");
  };

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt);
    setCurrentPrompt(prompt);
    setIsEditing(true);
    setError("");
  };

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
              setSelectedPrompt(null);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> New Prompt
          </Button>
        </div>
        <div className="space-y-2">
          {prompts.map((prompt) => (
            <div
              key={prompt.title}
              className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                selectedPrompt?.title === prompt.title ? "bg-gray-100" : ""
              }`}
              onClick={() => handlePromptSelect(prompt)}
            >
              <div className="flex justify-between items-center">
                <span className="truncate text-sm font-medium">
                  {prompt.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(prompt);
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
              {isEditing ? "Edit Prompt" : "Create New Prompt"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Enter prompt title"
                  value={currentPrompt.title}
                  onChange={(e) =>
                    setCurrentPrompt({
                      ...currentPrompt,
                      title: e.target.value,
                    })
                  }
                  disabled={isEditing && selectedPrompt}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Enter prompt content"
                  value={currentPrompt.content}
                  onChange={(e) =>
                    setCurrentPrompt({
                      ...currentPrompt,
                      content: e.target.value,
                    })
                  }
                  rows={8}
                  className="w-full"
                />
              </div>
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
                {(isEditing ||
                  currentPrompt.title ||
                  currentPrompt.content) && (
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
              prompt "{promptToDelete?.title}".
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

export default PromptManager;
