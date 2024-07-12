import { PlayerRoles } from '../../app/components/forms/PlayerRoles';
import { getPointsEarned } from '../../app/components/forms/pointsEarned';
import { GameRecordQuerier } from '../db/GameRecordQuerier';
import { GameRecord as Results, HandData, PlayerHand } from '../model/GameRecord';
import { Game } from './game/Game';
import { RegValue, Suit, TrumpValue } from './model/Card';
import { CompletedBoardState, CompletedGameState, GameplayState, Outcome } from './model/GameState';
import { getHandForPlayer } from "./Autolog";

test('Game computes correct hand for lost self call', () => {
  const gameResult: CompletedGameState = {
    players: ["1", "2", "3", "4", "5"],
    bidder: "1",
    bid: 40,
    partner: "1",
    dog: [[Suit.Trump, TrumpValue._11], [Suit.Heart, RegValue._4], [Suit.Club, RegValue.V]],
    calls: {},
    outcomes: {},
    shows: [],
    pointsEarned: 32,
    bouts: [],
    bidderWon: false,
    pointsResult: -70
  };
  const hand = getHandForPlayer(
    gameResult,
    PlayerRoles.BIDDER,
    "1",
  );
  expect(hand.pointsEarned).toBe(-280);
})