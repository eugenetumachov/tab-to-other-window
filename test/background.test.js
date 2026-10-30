import { describe, expect, it } from "vitest";
import { createWindow, installChromeMock } from "./chrome-mock.js";

async function loadBackground(windows) {
  const chrome = installChromeMock({ windows });
  await import("../background.js");
  return chrome;
}

function expectMovedAndActivated(chrome, tabId, windowId) {
  expect(chrome.tabs.move).toHaveBeenCalledWith(tabId, { windowId, index: -1 });
  expect(chrome.tabs.update).toHaveBeenCalledWith(tabId, { active: true });
  expect(chrome.windows.update).toHaveBeenCalledWith(windowId, {
    focused: true,
  });
}

describe("icon click", () => {
  it("moves the tab to the other window and activates it", async () => {
    const chrome = await loadBackground([createWindow(1), createWindow(2)]);

    await chrome.action.onClicked.fire({ id: 10, windowId: 1 });

    expectMovedAndActivated(chrome, 10, 2);
  });

  it("ignores incognito windows", async () => {
    const chrome = await loadBackground([
      createWindow(1),
      createWindow(2, { incognito: true }),
      createWindow(3),
    ]);

    await chrome.action.onClicked.fire({ id: 10, windowId: 1 });

    expectMovedAndActivated(chrome, 10, 3);
  });

  it("moves the tab to a new window when there is no other window", async () => {
    const chrome = await loadBackground([
      createWindow(1),
      createWindow(2, { incognito: true }),
    ]);

    await chrome.action.onClicked.fire({ id: 10, windowId: 1 });

    expect(chrome.windows.create).toHaveBeenCalledWith({
      tabId: 10,
      focused: true,
    });
    expect(chrome.tabs.move).not.toHaveBeenCalled();
  });
});

describe("window picker popup", () => {
  it("is enabled when there are more than 2 windows", async () => {
    const chrome = await loadBackground([
      createWindow(1),
      createWindow(2),
      createWindow(3),
    ]);

    await chrome.windows.onCreated.fire();

    expect(chrome.action.setPopup).toHaveBeenCalledWith({
      popup: "popup.html",
    });
  });

  it("is disabled when there are 2 windows, not counting incognito", async () => {
    const chrome = await loadBackground([
      createWindow(1),
      createWindow(2),
      createWindow(3, { incognito: true }),
    ]);

    await chrome.windows.onRemoved.fire();

    expect(chrome.action.setPopup).toHaveBeenCalledWith({ popup: "" });
  });

  it("is updated on browser startup and extension install", async () => {
    const chrome = await loadBackground([createWindow(1)]);

    await chrome.runtime.onStartup.fire();
    await chrome.runtime.onInstalled.fire();

    expect(chrome.action.setPopup).toHaveBeenCalledTimes(2);
  });
});

it("moves and activates the tab on a moveTab message from the popup", async () => {
  const chrome = await loadBackground([createWindow(1), createWindow(2)]);
  const sendResponse = () => {};

  await chrome.runtime.onMessage.fire(
    { type: "moveTab", tabId: 10, windowId: 2 },
    {},
    sendResponse,
  );

  await expect.poll(() => chrome.windows.update.mock.calls.length).toBe(1);
  expectMovedAndActivated(chrome, 10, 2);
});
