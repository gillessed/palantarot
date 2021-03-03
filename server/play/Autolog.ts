import { PlayerRoles } from '../../app/components/forms/PlayerRoles';
import { getPointsEarned } from '../../app/components/forms/pointsEarned';
import { CompletedGameState, Outcome } from '../../app/play/common';
import { Game } from '../../app/play/server';
import { CompletedBoardState, GameplayState } from '../../app/play/state';
import { GameQuerier } from '../db/GameQuerier';
import { Game as Results, HandData, PlayerHand } from '../model/Game';

export function autologGame(
  game: Game | undefined,
  gameQuerier: GameQuerier,
) {
  if (!game || !game.settings.autologEnabled || game.getState().name !== GameplayState.Completed) {
    return;
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
  gameQuerier.saveGame(results);
}

function getHandForPlayer(
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
    oneLast:  (endState.outcomes[playerIndex] ?? []).indexOf(Outcome.ONE_LAST) >= 0,
  };
  return hand;
}
