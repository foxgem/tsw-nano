import { Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Prompt {
  id: string;
  title: string;
  content: string;
}

const PromptsManager = () => {
  const [search, setSearch] = useState("");
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    const savedPrompts = localStorage.getItem("prompts");
    return savedPrompts ? JSON.parse(savedPrompts) : [];
  });
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  useEffect(() => {
    localStorage.setItem("prompts", JSON.stringify(prompts));
  }, [prompts]);

  const handleAddPrompt = () => {
    const newPrompt = {
      id: new Date().getTime().toString(),
      title: "Untitled",
      content: "",
    };
    setPrompts([...prompts, newPrompt]);
    setSelectedPrompt(newPrompt);
  };

  const handleDeletePrompt = (id: string) => {
    setPrompts(prompts.filter((prompt) => prompt.id !== id));
    if (selectedPrompt?.id === id) {
      setSelectedPrompt(null);
    }
  };

  const handleUpdatePrompt = (title: string, content: string) => {
    if (selectedPrompt) {
      setPrompts(
        prompts.map((prompt) =>
          prompt.id === selectedPrompt.id
            ? {
                ...prompt,
                title,
                content,
              }
            : prompt,
        ),
      );
    }
  };

  return (
    <div className="w-[800px] h-[600px] bg-background">
      <div className="w-full h-full flex">
        {/* Left panel */}
        <div className="w-72 flex flex-col border-r border-border">
          {/* Left header with circles and add button */}
          <div className="flex items-center justify-between p-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              title="Add new"
              onClick={handleAddPrompt}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-muted text-foreground pl-9 pr-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Left content */}
          <div className="flex-1 overflow-y-auto">
            {prompts
              .filter((prompt) =>
                prompt.title.toLowerCase().includes(search.toLowerCase()),
              )
              .map((prompt) => (
                <div
                  key={prompt.id}
                  className={`px-4 py-2 text-foreground hover:bg-accent cursor-pointer ${
                    selectedPrompt?.id === prompt.id ? "bg-accent" : ""
                  }`}
                  onClick={() => {
                    setSelectedPrompt(prompt);
                    setNewTitle(prompt.title);
                    setNewContent(prompt.content);
                  }}
                >
                  {selectedPrompt?.id === prompt.id ? newTitle : prompt.title}
                </div>
              ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col">
          {/* Right header */}
          <div className="flex items-center px-4 py-2 border-b border-border">
            <input
              type="text"
              className="bg-transparent text-foreground flex-1 focus:outline-none"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                handleUpdatePrompt(
                  e.target.value,
                  selectedPrompt?.content || "",
                );
              }}
              placeholder="Untitled"
            />
            <div className="flex-1" />
            {selectedPrompt && (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setNewTitle("");
                  handleDeletePrompt(selectedPrompt.id);
                }}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Right content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedPrompt ? (
              <textarea
                className="w-full h-full bg-transparent text-foreground resize-none focus:outline-none"
                value={newContent}
                onChange={(e) => {
                  setNewContent(e.target.value);
                  handleUpdatePrompt(
                    selectedPrompt?.title || "",
                    e.target.value,
                  );
                }}
                placeholder="Enter prompt content..."
              />
            ) : (
              <div className="w-0.5 h-5 bg-primary animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptsManager;
