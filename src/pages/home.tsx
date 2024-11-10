import { BotMessageSquare, NotepadText, Settings2 } from "lucide-react";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { Button } from "~components/ui/button";
import { cn } from "~/utils/commons";

function MainPage() {
  return (
    <div className="w-[350px] h-auto min-h-[246px] flex flex-col pb-12">
      <Header />
      <nav className="flex flex-col mx-auto px-5 mt-4 flex-1 w-[60%]">
        <Button
          variant="outline"
          onClick={() => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "openChat" });
              }
            });
            window.close();
          }}
          className={cn(
            "px-4 py-2 rounded-full h-12 mb-3 border-0 justify-start",
            "cursor-pointer",
            "transition-colors duration-300",
            "bg-accent hover:bg-primary hover:text-white dark:text-white",
          )}
        >
          <BotMessageSquare className="mr-2" />
          {/* summary as the context of chatting*/}
          Chatting
        </Button>
        <Button
          variant="outline"
          // onClick={() => gotoTimerSetting()}
          className={cn(
            "px-4 py-2 rounded-full h-12 mb-3 border-0 justify-start",
            "cursor-pointer",
            "transition-colors duration-300",
            "bg-accent  hover:bg-primary hover:text-white",
          )}
        >
          <NotepadText className="mr-2" />
          Prompts
        </Button>
        <Button
          variant="outline"
          // onClick={() => gotoApiKeySetting()}
          className={cn(
            "px-4 py-2 rounded-full h-12 mb-3 border-0 justify-start",
            "cursor-pointer",
            "transition-colors duration-300",
            "bg-accent hover:bg-primary hover:text-white dark:text-white",
          )}
        >
          <Settings2 className="mr-2" />
          Settings
        </Button>
      </nav>
      <Footer className="mt-auto" />
    </div>
  );
}

export default MainPage;
