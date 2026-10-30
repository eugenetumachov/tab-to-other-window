import { getNormalWindows } from "./move-tab.js";

const source = await chrome.windows.getCurrent({ populate: true });
const sourceTab = source.tabs.find((t) => t.active);
const targets = (await getNormalWindows({ populate: true })).filter(
  (w) => w.id !== source.id,
);

const list = document.getElementById("windows");

for (const target of targets) {
  const activeTab = target.tabs.find((t) => t.active);
  const button = document.createElement("button");
  button.setAttribute("role", "menuitem");

  const favicon = document.createElement("img");
  favicon.className = "favicon";
  favicon.alt = "";
  const faviconUrl = new URL(chrome.runtime.getURL("/_favicon/"));
  faviconUrl.searchParams.set("pageUrl", activeTab?.url ?? "");
  faviconUrl.searchParams.set("size", "32");
  favicon.src = faviconUrl.href;

  const title = document.createElement("span");
  title.className = "title";
  title.textContent = activeTab?.title || "Untitled";

  const count = document.createElement("span");
  count.className = "count";
  count.textContent = `${target.tabs.length} tab${target.tabs.length === 1 ? "" : "s"}`;

  button.append(favicon, title, count);
  button.addEventListener("click", async () => {
    // The popup gets closed as soon as the tab leaves its window,
    // so the move runs in the service worker to complete reliably.
    await chrome.runtime.sendMessage({
      type: "moveTab",
      tabId: sourceTab.id,
      windowId: target.id,
    });
    window.close();
  });
  list.append(button);
}

list.querySelector("button")?.focus();
