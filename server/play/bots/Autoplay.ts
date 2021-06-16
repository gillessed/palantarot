import { Game } from '../game/Game';
import { getCardsAllowedToPlay, getPlayerNum } from '../model/CardUtils';
import { PlayCardAction } from '../model/GameEvents';
import { GameplayState, PlayingBoardState } from '../model/GameState';

export function autoplayNextCard(game: Game): PlayCardAction | undefined {
  const anyState = game.getState();
  if (anyState.name !== GameplayState.Playing) {
    return;
  }
  const state = anyState as PlayingBoardState;
  const toPlay = state.current_trick.players[state.current_trick.current_player];
  const playerNum = getPlayerNum(state.players, toPlay);
  const toPlayHand = state.hands[playerNum];
  const anyPlayerPlayedCard = (state.current_trick.trick_num === 0 && state.current_trick.cards.length === 0);
  const allowableCards = getCardsAllowedToPlay(toPlayHand, state.current_trick.cards, anyPlayerPlayedCard, state.called);
  const randomCard = allowableCards[Math.floor(Math.random() * allowableCards.length)];
  const action: PlayCardAction = {
    type: 'play_card',
    player: toPlay,
    card: randomCard,
    time: Date.now(),
  };
  return action;
}
