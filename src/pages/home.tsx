import { BotMessageSquare, SquareSlash, Bolt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { cn } from "~/utils/commons";
import { Button } from "~components/ui/button";

function MainPage() {
  const navigate = useNavigate();

  const newChat = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "openChat" });
      }
    });
    window.close();
  };

  const gotoSlashCommands = () => {
    navigate("/slash-commands", {});
  };

  const gotoQuickActions = () => {
    navigate("/quick-actions", {});
  };

  return (
    <div className="w-[350px] h-auto min-h-[246px] flex flex-col pb-12">
      <Header />
      <nav className="flex flex-col mx-auto px-5 mt-4 flex-1 w-full max-w-[250px]">
        <Button
          variant="outline"
          onClick={newChat}
          className={cn(
            "px-4 py-2 rounded-full h-12 mb-3 border-0 justify-start",
            "cursor-pointer",
            "transition-colors duration-300",
            "bg-accent hover:bg-primary hover:text-white dark:text-white justify-center",
          )}
        >
          <BotMessageSquare className="mr-2" />
          Chatting
        </Button>
        <Button
          variant="outline"
          onClick={() => gotoSlashCommands()}
          className={cn(
            "px-4 py-2 rounded-full h-12 mb-3 border-0 justify-start",
            "cursor-pointer",
            "transition-colors duration-300",
            "bg-accent  hover:bg-primary hover:text-white justify-center",
          )}
        >
          <SquareSlash className="mr-2" />
          Slash Commands
        </Button>
        <Button
          variant="outline"
          onClick={() => gotoQuickActions()}
          className={cn(
            "px-4 py-2 rounded-full h-12 mb-3 border-0 justify-start",
            "cursor-pointer",
            "transition-colors duration-300",
            "bg-accent hover:bg-primary hover:text-white dark:text-white justify-center",
          )}
        >
          <Bolt className="mr-2" />
          Quick Actions
        </Button>
      </nav>
      <Footer className="mt-auto" />
    </div>
  );
}

export default MainPage;
