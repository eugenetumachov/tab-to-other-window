export async function getNormalWindows(options = {}) {
  const windows = await chrome.windows.getAll({
    windowTypes: ["normal"],
    ...options,
  });
  return windows.filter((w) => !w.incognito);
}

export async function moveTab(tabId, windowId) {
  await chrome.tabs.move(tabId, { windowId, index: -1 });
  await chrome.tabs.update(tabId, { active: true });
  await chrome.windows.update(windowId, { focused: true });
}
