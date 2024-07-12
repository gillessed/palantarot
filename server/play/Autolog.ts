import { PlayerRoles } from '../../app/components/forms/PlayerRoles';
import { getPointsEarned } from '../../app/components/forms/pointsEarned';
import { GameRecordQuerier } from '../db/GameRecordQuerier';
import { GameRecord as Results, HandData, PlayerHand } from '../model/GameRecord';
import { Game } from './game/Game';
import { CompletedBoardState, CompletedGameState, GameplayState, Outcome } from './model/GameState';

export async function autologGame(
  game: Game,
  gameQuerier: GameRecordQuerier,
): Promise<void> {
  if (!game.settings.autologEnabled || game.getState().name !== GameplayState.Completed || game.logged) {
    return Promise.resolve();
  }

  const state = game.getState() as CompletedBoardState;
  const endState = state.end_state;
  
  const bidderHand = getHandForPlayer(
    endState,
    PlayerRoles.BIDDER,
    endState.bidder,
  );

  let partnerHand: PlayerHand | undefined = undefined;
  if (endState.partner && endState.partner !== endState.bidder) {
    partnerHand = getHandForPlayer(
      endState,
      PlayerRoles.PARTNER,
      endState.partner,
    );
  }

  const oppositionHands: PlayerHand[] = [];
  for (const player of state.players) {
    if (player === endState.bidder || player === endState.partner) {
      continue;
    } 
    const hand = getHandForPlayer(
      endState,
      PlayerRoles.PLAYER1,
      player,
    );
    oppositionHands.push(hand);
  }

  const handData: HandData = {
    bidder: bidderHand,
    partner: partnerHand,
    opposition: oppositionHands,
  };

  const results: Results = {
    id: '',
    bidderId: endState.bidder,
    partnerId: endState.partner,
    timestamp: '',
    numberOfPlayers: state.players.length,
    bidAmount: endState.bid,
    points: endState.pointsResult,
    slam: endState.pointsResult >= 270,
    handData,
  }
  await gameQuerier.saveGame(results);
  game.logged = true;
  return Promise.resolve();
}

export function getHandForPlayer(
  endState: CompletedGameState,
  playerRole: string,
  playerId: string,
): PlayerHand {
  const playerIndex = endState.players.indexOf(playerId);
  const hand: PlayerHand = {
    id: playerId,
    handId: '',
    pointsEarned: getPointsEarned(
      endState.pointsResult,
      playerRole,
      endState.players.length,
      endState.partner === endState.bidder,
    ),
    showedTrump: endState.shows.indexOf(endState.bidder) >= 0,
    oneLast: (endState.outcomes[playerIndex] ?? []).indexOf(Outcome.ONE_LAST) >= 0,
  };
  return hand;
}
