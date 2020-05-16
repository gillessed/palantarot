import {
  Card,
  DealtHandTransition,
  DogRevealTransition, EnteredChatTransition,
  GameplayState, LeftChatTransition,
  PlayCardAction,
  Player,
  PlayerEvent,
  SetDogAction
} from "../common";
import {cardsWithout, compareCards} from "../cardUtils";
import _ from "lodash";

export interface PlayState {
  readonly state: GameplayState
  readonly hand: Card[]
  readonly player_order: Player[]
  readonly in_chat: Player[]
}

export const blank_state: PlayState = {
  state: "new_game",
  hand: [],
  player_order: [],
  in_chat: [],
};

export function updateForEvent(state: PlayState, event: PlayerEvent, player: Player): PlayState {
  switch (event.type) {
    case 'dealt_hand':
      const dealtHand = event as DealtHandTransition;
      return {
        ...state,
        state: "bidding",
        hand: dealtHand.hand,
        player_order: dealtHand.player_order,
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
    case 'game_aborted':
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
    case 'entered_chat':
      const enteredChat = event as EnteredChatTransition;
      return {
        ...state,
        in_chat: [...state.in_chat, enteredChat.player],
      };
    case 'left_chat':
      const leftChat = event as LeftChatTransition;
      return {
        ...state,
        in_chat: _.without(state.in_chat, leftChat.player),
      }
    default:
      return state;
  }
}