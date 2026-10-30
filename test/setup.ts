import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  Reflect.deleteProperty(globalThis, "chrome");
});
