import { assertNever } from "../../app/utils/assertNever.ts";
import { type PlayerId } from "../../server/play/model/GameState.ts";
import type { ClientGameState } from "../types/ClientGameState.ts";
import { updateNewGameClientGameState } from "./updateNewGameClientGameState.ts";
import { updateBiddingClientGameState } from "./updateBiddingClientGameState.ts";
import { updatePartnerCallClientGameState } from "./updatePartnerCallClientGameState.ts";
import type { PlayerEvent } from "../../server/play/model/GameEvents.ts";
import { updateDogRevealClientGameState } from "./updateDogRevealClientGameState.ts";
import { updatePlayingClientGameState } from "./updatePlayingClientGameState.ts";

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
  playerId: PlayerId,
): ClientGameState {
  const { phase } = state;
  switch (phase) {
    case "new_game":
      return updateNewGameClientGameState(state, event);
    case "bidding":
      return updateBiddingClientGameState(state, event);
    case "partner_call":
      return updatePartnerCallClientGameState(state, event);
    case "dog_reveal":
      return updateDogRevealClientGameState(state, event);
    case "playing":
      return updatePlayingClientGameState(state, event);
    default:
      assertNever(phase);
  }
  // switch (event.type) {
  //   case "show_dog_to_observers":
  //     return dogRevealedToObservers(state, event);
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
  playerId: PlayerId,
): ClientGameState {
  let newState = state;
  for (const event of events) {
    newState = updateClientGameForEvent(newState, event, playerId);
  }
  return newState;
}
