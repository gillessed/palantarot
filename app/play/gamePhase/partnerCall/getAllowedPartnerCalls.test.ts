import { Card } from "../../../../server/play/model/Card";
import type { PartnerCallClientGameState } from "../../../../shared/types/ClientGameState";
import { getAllowedPartnerCalls } from "./getAllowedPartnerCalls";

const createGameState = (
  hand: ReadonlyArray<Card>
): PartnerCallClientGameState => {
  return {
    phase: "partner_call",
    hand,
    playerOrder: [],
    showIndex: -1,
    shows: [],
    winningBid: { bid: 0, calls: [], player: "" },
  };
};

test("Can only call kings with less than 4 kings", () => {
  const hand: Card[] = [
    ["C", "4"],
    ["C", "5"],
    ["C", "6"],
    ["C", "7"],
    ["D", "1"],
    ["D", "2"],
    ["D", "3"],
    ["H", "4"],
    ["H", "5"],
    ["H", "6"],
    ["H", "8"],
    ["S", "1"],
    ["S", "3"],
    ["S", "5"],
    ["S", "7"],
  ];
  const game = createGameState(hand);
  const { canPickD, canPickC, canPickV } = getAllowedPartnerCalls(game, false);
  expect(canPickD).toBe(false);
  expect(canPickC).toBe(false);
  expect(canPickV).toBe(false);
});

test("Can call kings and queens with 4 kings", () => {
  const hand: Card[] = [
    ["C", "4"],
    ["C", "5"],
    ["C", "6"],
    ["C", "R"],
    ["D", "1"],
    ["D", "2"],
    ["D", "R"],
    ["H", "4"],
    ["H", "5"],
    ["H", "6"],
    ["H", "R"],
    ["S", "1"],
    ["S", "3"],
    ["S", "5"],
    ["S", "R"],
  ];
  const game = createGameState(hand);
  const { canPickD, canPickC, canPickV } = getAllowedPartnerCalls(game, false);
  expect(canPickD).toBe(true);
  expect(canPickC).toBe(false);
  expect(canPickV).toBe(false);
});

test("Can call Cs with 4 queens", () => {
  const hand: Card[] = [
    ["C", "4"],
    ["C", "5"],
    ["C", "D"],
    ["C", "R"],
    ["D", "1"],
    ["D", "D"],
    ["D", "R"],
    ["H", "4"],
    ["H", "5"],
    ["H", "D"],
    ["H", "R"],
    ["S", "1"],
    ["S", "3"],
    ["S", "D"],
    ["S", "R"],
  ];
  const game = createGameState(hand);
  const { canPickD, canPickC, canPickV } = getAllowedPartnerCalls(game, false);
  expect(canPickD).toBe(true);
  expect(canPickC).toBe(true);
  expect(canPickV).toBe(false);
});

test("Can call Vs with 4 Cs", () => {
  const hand: Card[] = [
    ["C", "4"],
    ["C", "C"],
    ["C", "D"],
    ["C", "R"],
    ["D", "C"],
    ["D", "D"],
    ["D", "R"],
    ["H", "4"],
    ["H", "C"],
    ["H", "D"],
    ["H", "R"],
    ["S", "1"],
    ["S", "C"],
    ["S", "D"],
    ["S", "R"],
  ];
  const game = createGameState(hand);
  const { canPickD, canPickC, canPickV } = getAllowedPartnerCalls(game, false);
  expect(canPickD).toBe(true);
  expect(canPickC).toBe(true);
  expect(canPickV).toBe(true);
});
