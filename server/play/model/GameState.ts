import { Card } from "./Card";
import { Action, Bid, BidAction, CallPartnerAction, CompletedBids, CompletedGameState, CompletedTrick, CurrentBids, DeclareSlam, EnterGameAction, GameSettingsAction, JokerExchangeState, LeaveGameAction, PlayCardAction, PlayerEvent, PlayerId, PlayerNotReadyAction, PlayerReadyAction, SetDogAction, ShowTrumpAction, ShowTrumpState, Trick } from "./GameEvents";

export enum GameplayState {
  NewGame = 'new_game',
  Bidding = 'bidding',
  PartnerCall = 'partner_call',
  DogReveal = 'dog_reveal',
  Playing = 'playing',
  Completed = 'completed',
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
  readonly hands: { [player: number]: Card[] }
  readonly dog: Card[]
  readonly shows: ShowTrumpState
}

export interface NewGameBoardState extends BoardState {
  readonly name: GameplayState.NewGame;

  readonly ready: PlayerId[]
}
export type NewGameActions = GameSettingsAction | EnterGameAction | LeaveGameAction | PlayerReadyAction | PlayerNotReadyAction;
export type NewGameStates = NewGameBoardState | BiddingBoardState

export interface BiddingBoardState extends DealtBoardState {
  readonly name: GameplayState.Bidding;

  readonly bidding: CurrentBids;
}
export type BiddingStateActions = BidAction | ShowTrumpAction;
export type BiddingStates = BiddingBoardState | PartnerCallBoardState | DogRevealAndExchangeBoardState | PlayingBoardState | NewGameBoardState

export interface PartnerCallBoardState extends DealtBoardState {
  readonly name: GameplayState.PartnerCall

  readonly allBids: Bid[];
  readonly bidding: CompletedBids;
  readonly bidder: PlayerId;
}
export type PartnerCallStateActions = CallPartnerAction | DeclareSlam | ShowTrumpAction;
export type PartnerCallStates = PartnerCallBoardState | DogRevealAndExchangeBoardState | PlayingBoardState;

export interface DogRevealAndExchangeBoardState extends DealtBoardState {
  readonly name: GameplayState.DogReveal;

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
  readonly name: GameplayState.Playing;

  readonly allBids: Bid[];
  readonly bidding: CompletedBids;
  readonly bidder: PlayerId;
  readonly called?: Card;
  readonly partner?: PlayerId;

  readonly joker_state?: JokerExchangeState;

  readonly current_trick: Trick;
  readonly past_tricks: CompletedTrick[];
}
export type PlayingStateActions = PlayCardAction | DeclareSlam | ShowTrumpAction
export type PlayingStates = PlayingBoardState | CompletedBoardState

export interface CompletedBoardState extends BoardState {
  readonly name: GameplayState.Completed;

  readonly bidder: PlayerId;
  readonly called?: Card;
  readonly partner?: PlayerId;
  readonly dog: Card[];

  readonly allBids: Bid[];
  readonly bidding: CompletedBids;
  readonly shows: ShowTrumpState
  readonly joker_state?: JokerExchangeState;
  readonly joker_exchanged?: Card;

  readonly past_tricks: CompletedTrick[];
  readonly end_state: CompletedGameState;
}
export type CompletedStateActions = any;




