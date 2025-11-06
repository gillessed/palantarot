import { Game } from "../game/Game";
import { getCardsAllowedToPlay, getPlayerNum } from "../model/CardUtils";
import { type PlayCardAction } from "../model/GameEvents";
import { GameplayState, type PlayingBoardState } from "../model/GameState";

export function autoplayNextCard(game: Game, time: number): PlayCardAction {
  const anyState = game.getState();
  if (anyState.name !== GameplayState.Playing) {
    throw Error("Play has not begun.");
  }
  const state = anyState as PlayingBoardState;
  const toPlay = state.current_trick.players[state.current_trick.current_player];
  const playerNum = getPlayerNum(state.players, toPlay);
  const toPlayHand = state.hands[playerNum];
  const isFirstPlay = state.current_trick.trick_num === 0 && state.current_trick.cards.length === 0;
  const allowableCards = getCardsAllowedToPlay(toPlayHand, state.current_trick.cards, !isFirstPlay, state.called);
  const randomCard = allowableCards[Math.floor(Math.random() * allowableCards.length)];
  const action: PlayCardAction = {
    type: "play_card",
    player: toPlay,
    card: randomCard,
    time,
  };
  return action;
}
