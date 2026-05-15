import { describe, it, expect } from "vitest";
import {
  uniqueBoardPlacements,
  findLineConflicts,
  cellBlockedByPlacedLine,
  occupiedLineUnavailableCells,
} from "../src/rules.js";
import { cellKey } from "../src/utils.js";

describe("uniqueBoardPlacements", () => {
  it("keeps unique placements", () => {
    const board = {
      "0,0": "ana",
      "1,1": "bruno",
      "2,2": "carissa",
    };
    expect(uniqueBoardPlacements(board)).toEqual(board);
  });

  it("last placement wins when same suspect placed twice", () => {
    const result = uniqueBoardPlacements({
      "0,0": "ana",
      "1,1": "ana",
    });
    expect(result).toEqual({ "1,1": "ana" });
  });

  it("removes the first when same suspect placed multiple times", () => {
    const result = uniqueBoardPlacements({
      "0,0": "ana",
      "1,1": "bruno",
      "2,2": "ana",
    });
    expect(result).toEqual({ "1,1": "bruno", "2,2": "ana" });
  });

  it("handles empty board", () => {
    expect(uniqueBoardPlacements({})).toEqual({});
  });
});

describe("findLineConflicts", () => {
  it("detects same row same suspect", () => {
    const result = findLineConflicts({
      "0,0": "ana",
      "0,1": "ana",
    });
    expect(result.has("0,0")).toBe(true);
    expect(result.has("0,1")).toBe(true);
  });

  it("detects same col same suspect", () => {
    const result = findLineConflicts({
      "0,0": "ana",
      "1,0": "ana",
    });
    expect(result.has("0,0")).toBe(true);
    expect(result.has("1,0")).toBe(true);
  });

  it("different suspects on same row is NOT a conflict", () => {
    const result = findLineConflicts({
      "0,0": "ana",
      "0,1": "bruno",
    });
    expect(result.size).toBe(0);
  });

  it("no conflicts for valid board", () => {
    const result = findLineConflicts({
      "0,0": "ana",
      "1,1": "bruno",
      "2,2": "carissa",
    });
    expect(result.size).toBe(0);
  });

  it("handles empty board", () => {
    expect(findLineConflicts({}).size).toBe(0);
  });
});

describe("cellBlockedByPlacedLine", () => {
  const board = { "0,0": "ana", "1,1": "bruno" };

  it("blocks same row as another suspect", () => {
    const result = cellBlockedByPlacedLine({
      board,
      row: 0, col: 4,
      movingPiece: "carissa",
      victimGuess: "",
      cellKey,
    });
    expect(result).toBe(true);
  });

  it("blocks same col as another suspect", () => {
    const result = cellBlockedByPlacedLine({
      board,
      row: 4, col: 0,
      movingPiece: "carissa",
      victimGuess: "",
      cellKey,
    });
    expect(result).toBe(true);
  });

  it("does not block free cell", () => {
    const result = cellBlockedByPlacedLine({
      board,
      row: 4, col: 4,
      movingPiece: "carissa",
      victimGuess: "",
      cellKey,
    });
    expect(result).toBe(false);
  });

  it("does not block own cell when moving", () => {
    const result = cellBlockedByPlacedLine({
      board,
      row: 0, col: 0,
      movingPiece: "ana",
      victimGuess: "",
      cellKey,
    });
    expect(result).toBe(false);
  });

  it("victim guess blocks other suspects but not victim", () => {
    const result = cellBlockedByPlacedLine({
      board,
      row: 3, col: 3,
      movingPiece: "__victim__",
      victimGuess: "",
      cellKey,
    });
    expect(result).toBe(false);
  });

  it("victim position blocks same row/col for suspects", () => {
    const result = cellBlockedByPlacedLine({
      board: {},
      row: 1, col: 1,
      movingPiece: "bruno",
      victimGuess: "1,3",
      cellKey,
    });
    expect(result).toBe(true);
  });
});

describe("occupiedLineUnavailableCells", () => {
  it("returns all cells in same row/col as placements", () => {
    const result = occupiedLineUnavailableCells({
      board: { "0,0": "ana", "2,2": "bruno" },
      victimGuess: "",
      rows: 4, cols: 4,
      cellKey,
    });
    expect(result.has("0,1")).toBe(true);
    expect(result.has("0,2")).toBe(true);
    expect(result.has("0,3")).toBe(true);
    expect(result.has("1,0")).toBe(true);
    expect(result.has("2,0")).toBe(true);
    expect(result.has("2,1")).toBe(true);
    expect(result.has("2,3")).toBe(true);
    expect(result.has("1,2")).toBe(true);
  });

  it("does not include placement cells themselves", () => {
    const result = occupiedLineUnavailableCells({
      board: { "0,0": "ana" },
      victimGuess: "",
      rows: 3, cols: 3,
      cellKey,
    });
    expect(result.has("0,0")).toBe(false);
  });

  it("handles empty board", () => {
    const result = occupiedLineUnavailableCells({
      board: {},
      victimGuess: "",
      rows: 3, cols: 3,
      cellKey,
    });
    expect(result.size).toBe(0);
  });

  it("includes victim row/col cells", () => {
    const result = occupiedLineUnavailableCells({
      board: {},
      victimGuess: "1,1",
      rows: 3, cols: 3,
      cellKey,
    });
    expect(result.has("1,0")).toBe(true);
    expect(result.has("1,2")).toBe(true);
    expect(result.has("0,1")).toBe(true);
    expect(result.has("2,1")).toBe(true);
    expect(result.has("1,1")).toBe(false);
  });
});
