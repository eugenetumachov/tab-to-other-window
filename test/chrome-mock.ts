import { vi } from "vitest";

type Listener = (...args: never[]) => unknown;

function createEvent() {
  const listeners: Listener[] = [];
  return {
    addListener: (listener: Listener) => {
      listeners.push(listener);
    },
    fire: (...args: unknown[]) =>
      Promise.all(
        // Tests fire events with partial chrome objects, so the real
        // listener signatures can't be enforced here.
        listeners.map((l) => (l as (...a: unknown[]) => unknown)(...args)),
      ),
  };
}

interface FakeTab {
  id: number;
  windowId: number;
  active: boolean;
  title?: string;
  url?: string;
}

export interface FakeWindow {
  id: number;
  incognito: boolean;
  type: "normal";
  tabs: FakeTab[];
}

export function createWindow(
  id: number,
  {
    incognito = false,
    tabs = [],
  }: { incognito?: boolean; tabs?: Omit<Partial<FakeTab>, "windowId">[] } = {},
): FakeWindow {
  return {
    id,
    incognito,
    type: "normal",
    tabs: tabs.map((tab, index) => ({
      id: index,
      windowId: id,
      active: index === 0,
      ...tab,
    })),
  };
}

/**
 * Minimal fake of the chrome.* APIs used by the extension.
 * `windows` is what chrome.windows.getAll returns; `currentWindowId` is the popup's window.
 */
export function installChromeMock({
  windows,
  currentWindowId,
}: {
  windows: FakeWindow[];
  currentWindowId?: number;
}) {
  const withoutTabs = ({ tabs: _tabs, ...w }: FakeWindow) => w;

  const mock = {
    action: {
      onClicked: createEvent(),
      setPopup: vi.fn().mockResolvedValue(undefined),
    },
    runtime: {
      onInstalled: createEvent(),
      onStartup: createEvent(),
      onMessage: createEvent(),
      sendMessage: vi.fn().mockResolvedValue(undefined),
      getURL: (path: string) => `chrome-extension://test-id${path}`,
    },
    windows: {
      onCreated: createEvent(),
      onRemoved: createEvent(),
      getAll: vi.fn(async ({ populate }: { populate?: boolean } = {}) =>
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

  // The fake covers only the APIs the extension uses, not the whole chrome namespace.
  globalThis.chrome = mock as unknown as typeof chrome;
  return mock;
}

export type ChromeMock = ReturnType<typeof installChromeMock>;
