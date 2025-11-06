import type { Bout, Card } from "./Card.ts";
import type {
  Action,
  BidAction,
  CallPartnerAction,
  DeclareSlam,
  EnterGameAction,
  GameSettingsAction,
  LeaveGameAction,
  PlayCardAction,
  PlayerEvent,
  PlayerNotReadyAction,
  PlayerReadyAction,
  SetDogAction,
  ShowTrumpAction,
} from "./GameEvents.ts";

export type GameplayState = "new_game" | "bidding" | "partner_call" | "dog_reveal" | "playing" | "completed";

export const isGamePlayState = (state: GameplayState, targetStates: GameplayState[]) => {
  return targetStates.indexOf(state) >= 0;
};

export const BidPass: BidValue = 0;

export type BidValue = 0 | 10 | 20 | 40 | 80 | 160;

export type Call = "russian" | "declared_slam";

export type Outcome = "slammed" | "one_last";

export type PlayerId = string;

export const DummyPlayer: PlayerId = "[dummy null player]";

export interface Trick {
  readonly trick_num: number;
  /** n-th card was played by n-th player */
  readonly cards: Card[];
  readonly players: PlayerId[];
  readonly current_player: number;
}

export interface CompletedTrick {
  readonly trick_num: number;
  readonly cards: Card[];
  readonly players: PlayerId[];
  readonly winner: PlayerId;
}

export interface Bid {
  readonly player: PlayerId;
  readonly bid: BidValue;
  readonly calls: Call[];
}

export interface CurrentBids {
  /** in order of bid */
  readonly bids: Bid[];
  /** remaining bidders, in order of bidding, 0-th position is next bidder */
  readonly bidders: PlayerId[];
  readonly current_high: Bid;
}

export interface CompletedBids {
  readonly winningBid: Bid;
  readonly calls: { [player: number]: Call[] };
}

export type ShowTrumpState = PlayerId[];

export interface JokerExchangeState {
  readonly player: PlayerId;
  readonly owed_to: PlayerId;
}

export interface CompletedGameState {
  readonly players: PlayerId[];
  readonly bidder: PlayerId;
  readonly bid: BidValue;
  readonly partner?: PlayerId;
  readonly dog: Card[];

  readonly calls: { [player: number]: Call[] };
  readonly outcomes: { [player: number]: Outcome[] };
  readonly shows: PlayerId[];
  readonly pointsEarned: number;
  readonly bouts: Bout[];
  readonly bidderWon: boolean;
  readonly pointsResult: number;
}

export interface ReducerResult<RESULT extends BoardState> {
  state: RESULT;
  events: PlayerEvent[];
  serverMessages?: string[];
}

export interface BoardReducer<STATE extends BoardState, ACTION extends Action, RESULT extends BoardState> {
  (state: STATE, action: ACTION): ReducerResult<RESULT>;
}

export interface BoardState {
  readonly name: GameplayState;
  readonly players: PlayerId[];
  readonly publicHands: boolean;
}

export interface DealtBoardState extends BoardState {
  readonly hands: Card[][];
  readonly dog: Card[];
  readonly shows: ShowTrumpState;
}

export interface NewGameBoardState extends BoardState {
  readonly name: "new_game";

  readonly ready: PlayerId[];
}
export type NewGameActions =
  | GameSettingsAction
  | EnterGameAction
  | LeaveGameAction
  | PlayerReadyAction
  | PlayerNotReadyAction;
export type NewGameStates = NewGameBoardState | BiddingBoardState;

export interface BiddingBoardState extends DealtBoardState {
  readonly name: "bidding";

  readonly bidding: CurrentBids;
}
export type BiddingStateActions = BidAction | ShowTrumpAction;
export type BiddingStates =
  | BiddingBoardState
  | PartnerCallBoardState
  | DogRevealAndExchangeBoardState
  | PlayingBoardState
  | NewGameBoardState;

export interface PartnerCallBoardState extends DealtBoardState {
  readonly name: "partner_call";

  readonly allBids: Bid[];
  readonly bidding: CompletedBids;
  readonly bidder: PlayerId;
}
export type PartnerCallStateActions = CallPartnerAction | DeclareSlam | ShowTrumpAction;
export type PartnerCallStates = PartnerCallBoardState | DogRevealAndExchangeBoardState | PlayingBoardState;

export interface DogRevealAndExchangeBoardState extends DealtBoardState {
  readonly name: "dog_reveal";

  readonly allBids: Bid[];
  readonly bidding: CompletedBids;
  readonly bidder: PlayerId;
  readonly called?: Card;
  readonly partner?: PlayerId;
}
/** {@link SetDogAction} is for bidder only */
export type DogRevealStateActions = SetDogAction | DeclareSlam | ShowTrumpAction;
export type DogRevealStates = DogRevealAndExchangeBoardState | PlayingBoardState;

/**
 * Transitions:
 *  - {@link CompletedBoardState}
 */
export interface PlayingBoardState extends DealtBoardState {
  readonly name: "playing";

  readonly allBids: Bid[];
  readonly bidding: CompletedBids;
  readonly bidder: PlayerId;
  readonly called?: Card;
  readonly partner?: PlayerId;

  readonly jokerState?: JokerExchangeState;

  readonly current_trick: Trick;
  readonly past_tricks: CompletedTrick[];
}
export type PlayingStateActions = PlayCardAction | DeclareSlam | ShowTrumpAction;
export type PlayingStates = PlayingBoardState | CompletedBoardState;

export interface CompletedBoardState extends BoardState {
  readonly name: "completed";

  readonly bidder: PlayerId;
  readonly called?: Card;
  readonly partner?: PlayerId;
  readonly dog: Card[];

  readonly allBids: Bid[];
  readonly bidding: CompletedBids;
  readonly shows: ShowTrumpState;
  readonly jokerState?: JokerExchangeState;
  readonly joker_exchanged?: Card;

  readonly past_tricks: CompletedTrick[];
  readonly end_state: CompletedGameState;
}
export type CompletedStateActions = any;
