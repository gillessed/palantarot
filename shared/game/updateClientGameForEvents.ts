import pkg from "lodash";
import { assertNever } from "../../app/utils/assertNever.ts";
import {
  cardsWithout,
  compareCards,
} from "../../server/play/model/CardUtils.ts";
import {
  type BidAction,
  type BiddingCompletedTransition,
  type CallPartnerAction,
  type CompletedTrickTransition,
  type DealtHandTransition,
  type DogRevealTransition,
  type GameAbortedTransition,
  type GameCompletedTransition,
  type GameStartTransition,
  type NotifyEvent,
  type PlayCardAction,
  type PlayerEvent,
  type SetDogAction,
  type ShowDogToObservers,
  type ShowTrumpAction,
} from "../../server/play/model/GameEvents.ts";
import { type PlayerId } from "../../server/play/model/GameState.ts";
import type {
  BiddingClientGameState,
  ClientGameState,
} from "../types/ClientGameState.ts";
import {
  EmptyClientGame,
  type ClientGame,
  type ClientTrickCards,
} from "../types/ClientGameTypes.ts";
import { updateNewGameClientGameState } from "./updateNewGameClientGameState.ts";
import { updateBiddingClientGameState } from "./updateBiddingClientGameState.ts";

// const { isEqual } = pkg;

// function callPartner(state: ClientGame, action: CallPartnerAction): ClientGame {
//   return {
//     ...state,
//     gamePhase: "partner_call",
//     partnerCard: action.card,
//   };
// }

// function dogRevealed(
//   state: ClientGame,
//   action: DogRevealTransition,
//   player: PlayerId
// ): ClientGame {
//   const selfCall = !!action.dog.find((card) =>
//     isEqual(card, state.partnerCard)
//   );
//   if (action.player === player) {
//     return {
//       ...state,
//       gamePhase: "dog_reveal",
//       hand: [...state.hand, ...action.dog].sort(compareCards()),
//       partner: selfCall ? state.winningBid?.player : undefined,
//       dog: action.dog,
//     };
//   } else {
//     return {
//       ...state,
//       gamePhase: "dog_reveal",
//       partner: selfCall ? state.winningBid?.player : undefined,
//       dog: action.dog,
//     };
//   }
// }

// function dogRevealedToObservers(
//   state: ClientGame,
//   action: ShowDogToObservers
// ): ClientGame {
//   return {
//     ...state,
//     dog: action.dog,
//   };
// }

// function setDog(state: ClientGame, action: SetDogAction): ClientGame {
//   if (action.exclude != null) {
//     const globalHand = state.allHands.get(action.playerId);
//     const newAllHands = new Map(state.allHands);
//     if (globalHand != null) {
//       const handWithDog = [...globalHand, ...state.dog];
//       const droppedHand = cardsWithout(handWithDog, ...action.dog);
//       droppedHand.sort(compareCards());
//       newAllHands.set(action.playerId, droppedHand);
//     }
//     return {
//       ...state,
//       dog: action.exclude != null ? action.dog : state.dog,
//       allHands: newAllHands,
//     };
//   } else {
//     return {
//       ...state,
//       hand: cardsWithout(state.hand, ...action.dog),
//     };
//   }
// }

// function gameStarted(
//   state: ClientGame,
//   action: GameStartTransition
// ): ClientGame {
//   return {
//     ...state,
//     gamePhase: "playing",
//     toPlay: action.first_player,
//   };
// }

// function playCard(
//   state: ClientGame,
//   action: PlayCardAction,
//   playerId: PlayerId
// ): ClientGame {
//   const playerIndex = state.playerOrder.indexOf(action.playerId) + 1;
//   const toPlay = state.playerOrder[playerIndex % state.playerOrder.length];
//   let newTrickCards;
//   let newOrder;
//   let newCompletedTricks = state.completedTricks;
//   if (state.trick.completed) {
//     newTrickCards = new Map([[action.playerId, action.card]]);
//     newOrder = [action.playerId];
//     newCompletedTricks = [...state.completedTricks, state.trick];
//   } else {
//     newTrickCards = new Map(state.trick.cards);
//     newTrickCards.set(action.playerId, action.card);
//     newOrder = [...(state.trick.order ?? []), action.playerId];
//   }
//   const newTrick: ClientTrickCards = {
//     order: newOrder,
//     cards: newTrickCards,
//     completed: false,
//   };
//   let partner = state.partner;
//   if (!partner && isEqual(state.partnerCard, action.card)) {
//     partner = action.playerId;
//   }
//   const globalHand = state.allHands.get(action.playerId);
//   const newAllHands = new Map(state.allHands);
//   if (globalHand != null) {
//     newAllHands.set(action.playerId, cardsWithout(globalHand, action.card));
//   }
//   return {
//     ...state,
//     hand:
//       action.playerId === playerId
//         ? cardsWithout(state.hand, action.card)
//         : state.hand,
//     toPlay,
//     trick: newTrick,
//     completedTricks: newCompletedTricks,
//     partner,
//     anyPlayerPlayedCard: true,
//     allHands: newAllHands,
//     notifyPlayer: null,
//   };
// }

// function completedTrick(
//   state: ClientGame,
//   action: CompletedTrickTransition
// ): ClientGame {
//   return {
//     ...state,
//     trick: { ...state.trick, completed: true, winner: action.winner },
//     toPlay: action.winner,
//   };
// }

// function gameComplete(
//   state: ClientGame,
//   action: GameCompletedTransition
// ): ClientGame {
//   return {
//     ...state,
//     gamePhase: "completed",
//     endState: action.end_state,
//   };
// }

// function gameAborted(state: ClientGame, _: GameAbortedTransition): ClientGame {
//   return {
//     ...EmptyClientGame,
//     playerOrder: state.playerOrder,
//   };
// }

// function notifyPlayer(state: ClientGame, event: NotifyEvent): ClientGame {
//   return {
//     ...state,
//     notifyPlayer: event.playerId,
//   };
// }

export function updateClientGameForEvent(
  state: ClientGameState,
  event: PlayerEvent,
  playerId: PlayerId
): ClientGameState {
  const { phase } = state;
  switch (phase) {
    case "new_game":
      return updateNewGameClientGameState(state, event);
    case "bidding":
      return updateBiddingClientGameState(state, event);
    case "partner_call":
      return null as any;
      break;
    default:
      assertNever(phase);
  }
  // switch (event.type) {
  //   case "bidding_completed":
  //     return biddingCompleted(state, event);
  //   case "call_partner":
  //     return callPartner(state, event);
  //   case "dog_revealed":
  //     return dogRevealed(state, event, playerId);
  //   case "show_dog_to_observers":
  //     return dogRevealedToObservers(state, event);
  //   case "set_dog":
  //     return setDog(state, event);
  //   case "game_started":
  //     return gameStarted(state, event);
  //   case "play_card":
  //     return playCard(state, event, playerId);
  //   case "completed_trick":
  //     return completedTrick(state, event);
  //   case "game_completed":
  //     return gameComplete(state, event);
  //   case "game_aborted":
  //     return gameAborted(state, event);
  //   case "notify_player":
  //     return notifyPlayer(state, event);
  //   default:
  //     return state;
  // }
}

export function updateClientGameForEvents(
  state: ClientGameState,
  events: ReadonlyArray<PlayerEvent>,
  playerId: PlayerId
): ClientGameState {
  let newState = state;
  for (const event of events) {
    newState = updateClientGameForEvent(newState, event, playerId);
  }
  return newState;
}
