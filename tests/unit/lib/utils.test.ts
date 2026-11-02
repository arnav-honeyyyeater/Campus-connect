import { describe, it, expect } from "vitest";
import { cn, getInitials, formatRelativeTime, formatCount, truncate } from "@/lib/utils";

describe("Utility functions (src/lib/utils.ts)", () => {
  it("cn merges Tailwind classes and resolves conflicts correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("bg-red-500", undefined, null, false, "bg-campus-lime")).toBe("bg-campus-lime");
  });

  it("getInitials extracts initials properly", () => {
    expect(getInitials("Arnav Sharma")).toBe("AS");
    expect(getInitials("Christ")).toBe("CH");
    expect(getInitials("")).toBe("U");
    expect(getInitials("John Ronald Reuel Tolkien")).toBe("JT");
  });

  it("formatCount formats numbers cleanly", () => {
    expect(formatCount(42)).toBe("42");
    expect(formatCount(1200)).toBe("1.2k");
    expect(formatCount(2000)).toBe("2k");
    expect(formatCount(1500000)).toBe("1.5M");
  });

  it("truncate trims strings cleanly", () => {
    expect(truncate("Hello World", 5)).toBe("Hell…");
    expect(truncate("Short", 10)).toBe("Short");
  });

  it("formatRelativeTime formats timestamps", () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 10 * 1000)).toBe("just now");
    expect(formatRelativeTime(now - 5 * 60 * 1000)).toBe("5m ago");
    expect(formatRelativeTime(now - 2 * 3600 * 1000)).toBe("2h ago");
    expect(formatRelativeTime(now - 24 * 3600 * 1000)).toBe("yesterday");
    expect(formatRelativeTime(now - 3 * 24 * 3600 * 1000)).toBe("3d ago");
  });
});
