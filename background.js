/**
 * Move current tab to another window of the same profile, or create a new window if none exists.
 * Only windows of the same profile are considered. Incognito windows are ignored.
 * If no suitable window is found, a new window will be created.
 * When moving the last tab from a window, the window will be closed automatically.
 */
chrome.action.onClicked.addListener(async (tab) => {
  const windows = await chrome.windows.getAll({ windowTypes: ["normal"] });
  const target = windows.find(
    (w) => w.id !== tab.windowId && w.incognito === false,
  );

  if (!target) {
    await chrome.windows.create({ tabId: tab.id, focused: true });
    return;
  }

  await chrome.tabs.move(tab.id, { windowId: target.id, index: -1 });
  await chrome.tabs.update(tab.id, { active: true });
  await chrome.windows.update(target.id, { focused: true });
});
