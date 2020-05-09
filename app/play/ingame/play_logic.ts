import {
  Card,
  DealtHandTransition,
  DogRevealTransition,
  GameplayState,
  PlayCardAction,
  Player,
  PlayerEvent,
  SetDogAction
} from "../common";
import {cardsWithout, compareCards} from "../card_utils";

export interface PlayState {
  readonly state: GameplayState
  readonly hand: Card[]
}

export const blank_state: PlayState = {
  state: "new_game",
  hand: [],
};

export function updateForEvent(state: PlayState, event: PlayerEvent, player: Player): PlayState {
  switch (event.type) {
    case 'dealt_hand':
      return {
        ...state,
        state: "bidding",
        hand: (event as DealtHandTransition).hand,
      };
    case 'bidding_completed':
      return {
        ...state,
        state: "partner_call",
      };
    case 'dog_revealed':
      const dogRevealed = event as DogRevealTransition;
      if (dogRevealed.player === player) {
        return {
          ...state,
          state: "dog_reveal",
          hand: [...state.hand, ...dogRevealed.dog].sort(compareCards())
        }
      } else {
        return {
          ...state,
          state: "dog_reveal",
        };
      }
    case 'game_started':
      return {
        ...state,
        state: "playing",
      };
    case 'game_completed':
      return {
        ...state,
        state: "completed",
      };
    case 'play_card':
      const playCard = event as PlayCardAction;
      if (playCard.player === player) {
        return {
          ...state,
          hand: cardsWithout(state.hand, playCard.card),
        }
      } else {
        return state;
      }
    case 'set_dog':
      const set_dog = event as SetDogAction;
      return {
        ...state,
        hand: cardsWithout(state.hand, ...set_dog.dog),
      };

    default:
      return state;
  }
}