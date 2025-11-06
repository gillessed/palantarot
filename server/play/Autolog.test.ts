import { getHandForPlayer } from "./Autolog.ts";
import { type CompletedGameState } from "./model/GameState";

test("Game computes correct hand for lost self call", () => {
  const gameResult: CompletedGameState = {
    players: ["1", "2", "3", "4", "5"],
    bidder: "1",
    bid: 40,
    partner: "1",
    dog: [
      ["T", "11"],
      ["H", "4"],
      ["C", "V"],
    ],
    calls: {},
    outcomes: {},
    shows: [],
    pointsEarned: 32,
    bouts: [],
    bidderWon: false,
    pointsResult: -70,
  };
  const hand = getHandForPlayer(gameResult, "bidder", "1");
  expect(hand.pointsEarned).toBe(-280);
});
