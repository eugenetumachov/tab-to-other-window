import { vi } from "vitest";

function createEvent() {
  const listeners = [];
  return {
    addListener: (listener) => listeners.push(listener),
    fire: (...args) => Promise.all(listeners.map((l) => l(...args))),
  };
}

export function createWindow(id, { incognito = false, tabs = [] } = {}) {
  return {
    id,
    incognito,
    type: "normal",
    tabs: tabs.map((tab, index) => ({ windowId: id, active: index === 0, ...tab })),
  };
}

/**
 * Minimal fake of the chrome.* APIs used by the extension.
 * `windows` is what chrome.windows.getAll returns; `currentWindowId` is the popup's window.
 */
export function installChromeMock({ windows, currentWindowId }) {
  const withoutTabs = ({ tabs: _tabs, ...w }) => w;

  globalThis.chrome = {
    action: {
      onClicked: createEvent(),
      setPopup: vi.fn().mockResolvedValue(undefined),
    },
    runtime: {
      onInstalled: createEvent(),
      onStartup: createEvent(),
      onMessage: createEvent(),
      sendMessage: vi.fn().mockResolvedValue(undefined),
      getURL: (path) => `chrome-extension://test-id${path}`,
    },
    windows: {
      onCreated: createEvent(),
      onRemoved: createEvent(),
      getAll: vi.fn(async ({ populate } = {}) =>
        populate ? windows : windows.map(withoutTabs),
      ),
      getCurrent: vi.fn(async () =>
        windows.find((w) => w.id === currentWindowId),
      ),
      create: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
    },
    tabs: {
      move: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
    },
  };

  return globalThis.chrome;
}
