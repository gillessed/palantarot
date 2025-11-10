import type { PlayerRole } from "../../app/components/forms/PlayerRoles.ts";
import { getPointsEarned } from "../../app/components/forms/getPointsEarned.ts";
import { GameRecordQuerier } from "../db/GameRecordQuerier.ts";
import {
  type HandData,
  type PlayerHand,
  type GameRecord as Results,
} from "../model/GameRecord.ts";
import { Game } from "./game/Game.ts";
import {
  type CompletedBoardState,
  type CompletedGameState,
} from "./model/GameState.ts";

export async function autologGame(
  game: Game,
  gameQuerier: GameRecordQuerier
): Promise<void> {
  if (
    !game.settings.autologEnabled ||
    game.getState().name !== "completed" ||
    game.logged
  ) {
    return Promise.resolve();
  }

  const state = game.getState() as CompletedBoardState;
  const endState = state.end_state;

  const bidderHand = getHandForPlayer(endState, "bidder", endState.bidder);

  let partnerHand: PlayerHand | undefined = undefined;
  if (endState.partner && endState.partner !== endState.bidder) {
    partnerHand = getHandForPlayer(endState, "partner", endState.partner);
  }

  const oppositionHands: PlayerHand[] = [];
  for (const player of state.players) {
    if (player === endState.bidder || player === endState.partner) {
      continue;
    }
    const hand = getHandForPlayer(endState, "player_1", player);
    oppositionHands.push(hand);
  }

  const handData: HandData = {
    bidder: bidderHand,
    partner: partnerHand,
    opposition: oppositionHands,
  };

  const results: Results = {
    id: "",
    bidderId: endState.bidder,
    partnerId: endState.partner,
    timestamp: "",
    numberOfPlayers: state.players.length,
    bidAmount: endState.bid,
    points: endState.pointsResult,
    slam: endState.pointsResult >= 270,
    handData,
  };
  await gameQuerier.saveGame(results);
  game.logged = true;
  return Promise.resolve();
}

export function getHandForPlayer(
  endState: CompletedGameState,
  playerRole: PlayerRole,
  playerId: string
): PlayerHand {
  const playerIndex = endState.players.indexOf(playerId);
  const hand: PlayerHand = {
    id: playerId,
    handId: "",
    pointsEarned: getPointsEarned(
      endState.pointsResult,
      playerRole,
      endState.players.length,
      endState.partner === endState.bidder
    ),
    showedTrump: endState.shows.indexOf(endState.bidder) >= 0,
    oneLast: (endState.outcomes[playerIndex] ?? []).indexOf("one_last") >= 0,
  };
  return hand;
}
