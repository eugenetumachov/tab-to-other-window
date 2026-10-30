// @vitest-environment jsdom
import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { createWindow, installChromeMock } from "./chrome-mock.ts";

const windows = [
  createWindow(1, { tabs: [{ id: 10, title: "Source tab" }] }),
  createWindow(2, {
    tabs: [
      { id: 20, title: "Inbox", url: "https://mail.example.com/" },
      { id: 21, title: "Other" },
    ],
  }),
  createWindow(3, { incognito: true, tabs: [{ id: 30, title: "Private" }] }),
  createWindow(4, {
    tabs: [
      { id: 40, title: "Background tab", active: false },
      { id: 41, title: "Docs", url: "https://docs.example.com/", active: true },
    ],
  }),
  createWindow(5, { tabs: [{ id: 50 }] }),
];

async function openPopup() {
  const chrome = installChromeMock({ windows, currentWindowId: 1 });
  await import("../src/popup.ts");
  return chrome;
}

beforeEach(() => {
  document.body.innerHTML = '<div id="windows" role="menu"></div>';
});

it("lists other non-incognito windows by their active tab title and tab count", async () => {
  await openPopup();

  const items = screen.getAllByRole("menuitem");
  expect(items).toHaveLength(3);
  expect(items[0]).toHaveTextContent("Inbox2 tabs");
  expect(items[1]).toHaveTextContent("Docs2 tabs");
  expect(items[2]).toHaveTextContent("Untitled1 tab");
});

it("shows the active tab favicon for each window", async () => {
  await openPopup();

  const [inbox] = screen.getAllByRole("menuitem");
  const img = inbox.querySelector("img");
  expect(img).not.toBeNull();
  const favicon = new URL(img!.src);
  expect(favicon.pathname).toBe("/_favicon/");
  expect(favicon.searchParams.get("pageUrl")).toBe("https://mail.example.com/");
});

it("focuses the first window so it can be picked with Enter", async () => {
  await openPopup();

  expect(screen.getAllByRole("menuitem")[0]).toHaveFocus();
});

it("asks the background to move the current tab to the picked window and closes", async () => {
  const chrome = await openPopup();
  const close = vi.spyOn(window, "close").mockImplementation(() => {});

  await userEvent.click(screen.getByRole("menuitem", { name: /Docs/ }));

  expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
    type: "moveTab",
    tabId: 10,
    windowId: 4,
  });
  expect(close).toHaveBeenCalled();
});
