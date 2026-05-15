import { describe, it, expect } from "vitest";
import {
  cellKey, clamp, escapeHtml, escapeAttr,
  formatSeconds, makeId, getObjectSize, rotatedSize
} from "../src/utils.js";

describe("cellKey", () => {
  it("combines row and col with comma", () => {
    expect(cellKey(3, 4)).toBe("3,4");
  });
  it("handles 0,0", () => {
    expect(cellKey(0, 0)).toBe("0,0");
  });
});

describe("clamp", () => {
  it("keeps value within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it("clamps below min", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });
  it("clamps above max", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
  it("works when min equals max", () => {
    expect(clamp(100, 5, 5)).toBe(5);
  });
});

describe("escapeHtml", () => {
  it("escapes & < > \" '", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#039;");
  });
  it("passes safe strings through", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
  it("handles empty string", () => {
    expect(escapeHtml("")).toBe("");
  });
});

describe("escapeAttr", () => {
  it("delegates to escapeHtml", () => {
    expect(escapeAttr(`<"">`)).toBe("&lt;&quot;&quot;&gt;");
  });
});

describe("formatSeconds", () => {
  it("formats zero", () => {
    expect(formatSeconds(0)).toBe("00:00");
  });
  it("formats 61:01", () => {
    expect(formatSeconds(3661)).toBe("61:01");
  });
  it("formats 1:05", () => {
    expect(formatSeconds(65)).toBe("01:05");
  });
  it("formats exactly one hour", () => {
    expect(formatSeconds(3600)).toBe("60:00");
  });
});

describe("makeId", () => {
  it("lowercases and kebab-cases", () => {
    expect(makeId("Hello World!")).toBe("hello-world");
  });
  it("removes diacritics", () => {
    expect(makeId("café niño")).toBe("cafe-nino");
  });
  it("returns fallback for empty input", () => {
    expect(makeId("  ")).toMatch(/^id-/);
  });
  it("trims dashes and limits to 48 chars", () => {
    const long = "a".repeat(100);
    expect(makeId(long).length).toBeLessThanOrEqual(48);
    expect(makeId(long)).not.toMatch(/^-|-$/);
  });
});

describe("getObjectSize", () => {
  it("returns w and h from object", () => {
    expect(getObjectSize({ w: 3, h: 2 })).toEqual({ w: 3, h: 2 });
  });
  it("defaults to 1 for missing values", () => {
    expect(getObjectSize({})).toEqual({ w: 1, h: 1 });
  });
  it("returns 1x1 for null", () => {
    expect(getObjectSize(null)).toEqual({ w: 1, h: 1 });
  });
  it("returns 1x1 for undefined", () => {
    expect(getObjectSize(undefined)).toEqual({ w: 1, h: 1 });
  });
  it("returns 1x1 for string", () => {
    expect(getObjectSize("box")).toEqual({ w: 1, h: 1 });
  });
});

describe("rotatedSize", () => {
  it("no rotation keeps dimensions", () => {
    expect(rotatedSize(2, 1, 0)).toEqual({ w: 2, h: 1 });
  });
  it("90 deg swaps w/h", () => {
    expect(rotatedSize(2, 1, 90)).toEqual({ w: 1, h: 2 });
  });
  it("180 deg keeps dimensions", () => {
    expect(rotatedSize(2, 1, 180)).toEqual({ w: 2, h: 1 });
  });
  it("270 deg swaps w/h", () => {
    expect(rotatedSize(2, 1, 270)).toEqual({ w: 1, h: 2 });
  });
  it("-90 deg swaps w/h", () => {
    expect(rotatedSize(2, 1, -90)).toEqual({ w: 1, h: 2 });
  });
  it("360 deg is same as 0", () => {
    expect(rotatedSize(2, 1, 360)).toEqual({ w: 2, h: 1 });
  });
  it("null rotation treated as 0", () => {
    expect(rotatedSize(2, 1, null)).toEqual({ w: 2, h: 1 });
  });
  it("undefined rotation treated as 0", () => {
    expect(rotatedSize(2, 1)).toEqual({ w: 2, h: 1 });
  });
  it("1x1 rotated is still 1x1", () => {
    expect(rotatedSize(1, 1, 90)).toEqual({ w: 1, h: 1 });
  });
});
