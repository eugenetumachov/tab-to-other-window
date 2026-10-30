import { getNormalWindows, moveTab, type MoveTabMessage } from "./move-tab.js";

/**
 * With more than 2 windows the action opens a popup to pick the target window,
 * otherwise clicking the icon moves the tab right away.
 */
async function updatePopup() {
  const windows = await getNormalWindows();
  await chrome.action.setPopup({
    popup: windows.length > 2 ? "popup.html" : "",
  });
}

chrome.runtime.onInstalled.addListener(updatePopup);
chrome.runtime.onStartup.addListener(updatePopup);
chrome.windows.onCreated.addListener(updatePopup);
chrome.windows.onRemoved.addListener(updatePopup);

chrome.runtime.onMessage.addListener(
  (message: MoveTabMessage, _sender, sendResponse) => {
    if (message.type !== "moveTab") return;
    sendResponse();
    moveTab(message.tabId, message.windowId);
  },
);

/**
 * Move current tab to another window of the same profile, or create a new window if none exists.
 * Only windows of the same profile are considered. Incognito windows are ignored.
 * If no suitable window is found, a new window will be created.
 * When moving the last tab from a window, the window will be closed automatically.
 */
chrome.action.onClicked.addListener(async (tab) => {
  const windows = await getNormalWindows();
  const target = windows.find((w) => w.id !== tab.windowId);

  if (tab.id === undefined) return;

  if (target?.id === undefined) {
    await chrome.windows.create({ tabId: tab.id, focused: true });
    return;
  }

  await moveTab(tab.id, target.id);
});
