chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "nano",
    title: "@nano",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "nano" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: "showNanoMenu",
      text: info.selectionText,
    });
  }
});
