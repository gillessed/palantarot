import { type Card, type TrumpCard } from "./Card.ts";
import { type GameSettings } from "./GameSettings.ts";
import {
  type Bid,
  type BidValue,
  type Call,
  type CompletedGameState,
  type JokerExchangeState,
  type PlayerId,
} from "./GameState.ts";

interface BaseEvent {
  /** if contains state for only one player, which player to send to. */
  readonly privateTo?: PlayerId;
  /** if set, will not send to any of the following players */
  readonly exclude?: PlayerId[];
}

// export interface PlayerEvent {
//   readonly type: ActionType | TransitionType | OtherEventsType | "error";
//   /** if contains state for only one player, which player to send to. */
//   readonly privateTo?: PlayerId;
//   /** if set, will not send to any of the following players */
//   readonly exclude?: PlayerId[];
// }

export type ErrorCode = "DOES_NOT_EXIST";

export type ErrorEvent = BaseEvent & {
  readonly type: "error";
  readonly error: string;
  readonly errorCode?: ErrorCode;
};

/* ACTIONS */

/**
 * Actions are sent by the player to the server,
 * and are then relayed by the server to other players (assuming they are public).
 *
 * Their types are present tense commands.
 */
export interface BaseAction extends BaseEvent {
  readonly playerId: PlayerId;
  readonly time: number;
}

export interface GameSettingsAction extends BaseAction {
  readonly type: "game_settings";
  readonly settings: GameSettings;
}

export interface EnterGameAction extends BaseAction {
  readonly type: "enter_game";
}

export interface LeaveGameAction extends BaseAction {
  readonly type: "leave_game";
}

export interface PlayerReadyAction extends BaseAction {
  readonly type: "mark_player_ready";
}

export interface PlayerUnreadyAction extends BaseAction {
  readonly type: "mark_player_unready";
}

export interface BidAction extends BaseAction {
  readonly type: "bid";
  readonly bid: BidValue;
  readonly calls?: Call[];
}

export interface ShowTrumpAction extends BaseAction {
  readonly type: "show_trump";
  /** Needs to match all trumps in player's hand */
  readonly cards: TrumpCard[];
}

export interface CallPartnerAction extends BaseAction {
  readonly type: "call_partner";
  readonly card: Card;
}

export interface DeclareSlamAction extends BaseAction {
  readonly type: "declare_slam";
}

export interface SetDogAction extends BaseAction {
  readonly type: "set_dog";
  readonly dog: Card[];
  readonly privateTo?: PlayerId;
  readonly exclude?: PlayerId[];
}

export interface PlayCardAction extends BaseAction {
  readonly type: "play_card";
  readonly card: Card;
}

export type Action =
  | GameSettingsAction
  | EnterGameAction
  | LeaveGameAction
  | PlayerReadyAction
  | PlayerUnreadyAction
  | BidAction
  | ShowTrumpAction
  | CallPartnerAction
  | DeclareSlamAction
  | SetDogAction
  | PlayCardAction;

/* TRANSITIONS */

/**
 * The server is also allowed to send messages to the players about transitions to game state.
 *
 * Their types are all past tense.
 */

export interface PlayersSetTransition extends BaseEvent {
  readonly type: "players_set";
  readonly playerOrder: PlayerId[];
}

export interface DealtHandTransition extends BaseEvent {
  readonly type: "dealt_hand";
  readonly playerId: PlayerId;
  readonly hand: Card[];
}

export interface BiddingCompletedTransition extends BaseEvent {
  readonly type: "bidding_completed";
  readonly winning_bid: Bid;
}

export interface DogRevealTransition extends BaseEvent {
  readonly type: "dog_revealed";
  readonly player: PlayerId;
  readonly dog: Card[];
}

export interface GameStartTransition extends BaseEvent {
  readonly type: "game_started";
  readonly first_player: PlayerId;
}

export interface CompletedTrickTransition extends BaseEvent {
  readonly type: "completed_trick";
  readonly winner: PlayerId;
  readonly winning_card: Card;
  readonly jokerState?: JokerExchangeState;
}

export interface GameCompletedTransition extends BaseEvent {
  readonly type: "game_completed";
  readonly end_state: CompletedGameState;
}

export interface GameAbortedTransition extends BaseEvent {
  readonly type: "game_aborted";
  readonly reason: string;
}

export type Transition =
  | PlayersSetTransition
  | DealtHandTransition
  | BiddingCompletedTransition
  | DogRevealTransition
  | GameStartTransition
  | CompletedTrickTransition
  | GameCompletedTransition
  | GameAbortedTransition;

/* OTHER EVENTS */

export interface NotifyEvent extends BaseEvent {
  readonly type: "notify_player";
  readonly playerId: string;
}

export interface ShowDogToObservers extends BaseEvent {
  readonly type: "show_dog_to_observers";
  readonly dog: Card[];
  readonly exclude: PlayerId[];
}

export type PlayerEvent =
  | Action
  | Transition
  | NotifyEvent
  | ShowDogToObservers
  | ErrorEvent;
