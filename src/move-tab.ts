export interface MoveTabMessage {
  type: "moveTab";
  tabId: number;
  windowId: number;
}

export async function getNormalWindows(
  options: chrome.windows.QueryOptions = {},
) {
  const windows = await chrome.windows.getAll({
    windowTypes: ["normal"],
    ...options,
  });
  return windows.filter((w) => !w.incognito);
}

export async function moveTab(tabId: number, windowId: number) {
  await chrome.tabs.move(tabId, { windowId, index: -1 });
  await chrome.tabs.update(tabId, { active: true });
  await chrome.windows.update(windowId, { focused: true });
}
