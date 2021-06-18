import { Bout, Card, TrumpCard } from './Card';
import { GameSettings } from './GameSettings';

export enum BidValue {
  PASS = 0,
  TEN = 10,
  TWENTY = 20,
  FORTY = 40,
  EIGHTY = 80,
  ONESIXTY = 160,
}

export enum Call {
  RUSSIAN = 'russian',
  DECLARED_SLAM = 'declared_slam',
}

export enum Outcome {
  SLAMMED = 'slammed',
  ONE_LAST = 'one_last',
}

export type PlayerId = string;

export const DummyPlayer: PlayerId = '[dummy null player]';

export interface Trick {
  readonly trick_num: number
  /** n-th card was played by n-th player */
  readonly cards: Card[]
  readonly players: PlayerId[]
  readonly current_player: number
}

export interface CompletedTrick {
  readonly trick_num: number
  readonly cards: Card[]
  readonly players: PlayerId[]
  readonly winner: PlayerId
}

export interface Bid {
  readonly player: PlayerId
  readonly bid: BidValue
  readonly calls: Call[]
}

export interface CurrentBids {
  /** in order of bid */
  readonly bids: Bid[];
  /** remaining bidders, in order of bidding, 0-th position is next bidder */
  readonly bidders: PlayerId[]
  readonly current_high: Bid
}

export interface CompletedBids {
  readonly winningBid: Bid
  readonly calls: { [player: number]: Call[] }
}

export type ShowTrumpState = PlayerId[];

export interface JokerExchangeState {
  readonly player: PlayerId
  readonly owed_to: PlayerId
}

export interface CompletedGameState {
  readonly players: PlayerId[]
  readonly bidder: PlayerId
  readonly bid: BidValue
  readonly partner?: PlayerId
  readonly dog: Card[]

  readonly calls: { [player: number]: Call[] }
  readonly outcomes: { [player: number]: Outcome[] }
  readonly shows: PlayerId[]
  readonly pointsEarned: number
  readonly bouts: Bout[]
  readonly bidderWon: boolean
  readonly pointsResult: number
}

export interface PlayerEvent {
  readonly type: ActionType | TransitionType | 'error';
  /** if contains state for only one player, which player to send to. */
  readonly privateTo?: PlayerId;
  /** if set, will not send to any of the following players */
  readonly exclude?: PlayerId[];
}

export enum ErrorCode {
  DOES_NOT_EXIST = 100,
}

export interface ErrorEvent extends PlayerEvent {
  readonly type: 'error';
  readonly error: string;
  readonly errorCode?: ErrorCode;
}

/* ACTIONS */

/**
 * Actions are sent by the player to the server,
 * and are then relayed by the server to other players (assuming they are public).
 *
 * Their types are present tense commands.
 */
export interface Action extends PlayerEvent {
  readonly type: ActionType
  readonly player: PlayerId
  readonly time: number
}

export type ActionType = 'game_settings' | 'enter_game' | 'leave_game' | 'mark_player_ready' | 'unmark_player_ready'
  | 'bid' | 'show_trump' | 'call_partner' | 'declare_slam' | 'set_dog' | 'play_card' | 'show_dog_to_observers';

export interface GameSettingsAction extends Action {
  readonly type: 'game_settings';
  readonly settings: GameSettings;
}

export interface EnterGameAction extends Action {
  readonly type: 'enter_game'
}

export interface LeaveGameAction extends Action {
  readonly type: 'leave_game'
}

export interface PlayerReadyAction extends Action {
  readonly type: 'mark_player_ready'
}

export interface PlayerNotReadyAction extends Action {
  readonly type: 'unmark_player_ready'
}

export interface BidAction extends Action {
  readonly type: 'bid'
  readonly bid: BidValue
  readonly calls?: Call[]
}

export interface ShowTrumpAction extends Action {
  readonly type: 'show_trump'
  /** Needs to match all trumps in player's hand */
  readonly cards: TrumpCard[];
}

export interface CallPartnerAction extends Action {
  readonly type: 'call_partner'
  readonly card: Card
}

export interface DeclareSlam extends Action {
  readonly type: 'declare_slam'
}

export interface SetDogAction extends Action {
  readonly type: 'set_dog'
  readonly dog: Card[]
  readonly privateTo?: PlayerId;
  readonly exclude?: PlayerId[];
}

export interface PlayCardAction extends Action {
  readonly type: 'play_card'
  readonly card: Card
}

export interface ShowDogToObservers extends PlayerEvent {
  readonly type: 'show_dog_to_observers';
  readonly dog: Card[];
  readonly exclude: PlayerId[];
}

/* TRANSITIONS */

/**
 * The server is also allowed to send messages to the players about transitions to game state.
 *
 * Their types are all past tense.
 */
export interface Transition extends PlayerEvent {
  readonly type: TransitionType
}

export type TransitionType = 'players_set' | 'dealt_hand' | 'bidding_completed' | 'dog_revealed' | 'game_started'
  | 'completed_trick' | 'game_completed' | 'game_aborted';

export interface PlayersSetTransition extends Transition {
  readonly type: 'players_set'
  readonly privateTo: undefined

  readonly playerOrder: PlayerId[]
}

export interface DealtHandTransition extends Transition {
  readonly type: 'dealt_hand'
  readonly playerId: PlayerId;
  readonly hand: Card[]
}

export interface BiddingCompletedTransition extends Transition {
  readonly type: 'bidding_completed'
  readonly privateTo: undefined

  readonly winning_bid: Bid
}

export interface DogRevealTransition extends Transition {
  readonly type: 'dog_revealed'
  readonly privateTo: undefined
  readonly player: PlayerId

  readonly dog: Card[]
}

export interface GameStartTransition extends Transition {
  readonly type: 'game_started'
  readonly privateTo: undefined

  readonly first_player: PlayerId
}

export interface CompletedTrickTransition extends Transition {
  readonly type: 'completed_trick'
  readonly privateTo: undefined

  readonly winner: PlayerId
  readonly winning_card: Card
  readonly joker_state?: JokerExchangeState
}

export interface GameCompletedTransition extends Transition {
  readonly type: 'game_completed'
  readonly privateTo: undefined

  readonly end_state: CompletedGameState
}

export interface GameAbortedTransition extends Transition {
  readonly type: 'game_aborted'
  readonly reason: string
}
