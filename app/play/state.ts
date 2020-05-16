/*
 * This file contains definitions used for the server.
 */

import {
    AckDogAction,
    AckTrumpShowAction,
    Action,
    BidAction,
    CallPartnerAction,
    Card,
    CompletedBids,
    CompletedGameState,
    CompletedTrick,
    CurrentBids,
    DeclareSlam,
    EnterGameAction, GameplayState,
    JokerExchangeState, LeaveGameAction,
    MessageAction,
    PlayCardAction,
    Player,
    PlayerEvent, PlayerNotReadyAction,
    PlayerReadyAction,
    SetDogAction,
    ShowTrumpAction,
    ShowTrumpState,
    Trick
} from "./common";

export interface BoardReducer<STATE extends BoardState, ACTION extends Action, RESULT extends BoardState> {
    (state: STATE, action: ACTION): [RESULT, ...PlayerEvent[]]
}

export interface BoardState {
    readonly name: GameplayState
    readonly players: Player[]
}

export interface DealtBoardState extends BoardState {
    readonly hands: { [player: number]: Card[] }
    readonly dog: Card[]
    readonly shows: ShowTrumpState
}

export interface NewGameBoardState extends BoardState {
    readonly name: 'new_game'

    readonly ready: Player[]
}
export type NewGameActions = EnterGameAction | LeaveGameAction | PlayerReadyAction | PlayerNotReadyAction | MessageAction
export type NewGameStates = NewGameBoardState | BiddingBoardState

export interface BiddingBoardState extends DealtBoardState {
    readonly name: 'bidding'

    readonly bidding: CurrentBids
}
export type BiddingStateActions = BidAction | ShowTrumpAction | AckTrumpShowAction | MessageAction
export type BiddingStates = BiddingBoardState | PartnerCallBoardState | DogRevealAndExchangeBoardState | PlayingBoardState | NewGameBoardState

export interface PartnerCallBoardState extends DealtBoardState {
    readonly name: 'partner_call'

    readonly bidding: CompletedBids
    readonly bidder: Player
}
export type PartnerCallStateActions = CallPartnerAction | DeclareSlam | ShowTrumpAction | AckTrumpShowAction | MessageAction
export type PartnerCallStates = PartnerCallBoardState | DogRevealAndExchangeBoardState | PlayingBoardState

export interface DogRevealAndExchangeBoardState extends DealtBoardState {
    readonly name: 'dog_reveal'

    readonly bidding: CompletedBids
    readonly bidder: Player
    readonly called?: Card
    readonly partner?: Player

    readonly players_acked: Player[]

}
/** {@link SetDogAction} is for bidder only */
export type DogRevealStateActions = SetDogAction | AckDogAction | DeclareSlam | ShowTrumpAction | AckTrumpShowAction | MessageAction
export type DogRevealStates = DogRevealAndExchangeBoardState | PlayingBoardState

/**
 * Transitions:
 *  - {@link CompletedBoardState}
 */
export interface PlayingBoardState extends DealtBoardState {
    readonly name: 'playing'

    readonly bidding: CompletedBids
    readonly bidder: Player
    readonly called?: Card
    readonly partner?: Player

    readonly joker_state?: JokerExchangeState

    readonly current_trick: Trick
    readonly past_tricks: CompletedTrick[]
}
export type PlayingStateActions = PlayCardAction | DeclareSlam | ShowTrumpAction | AckTrumpShowAction | MessageAction
export type PlayingStates = PlayingBoardState | CompletedBoardState

export interface CompletedBoardState extends BoardState {
    readonly name: 'completed'

    readonly bidder: Player
    readonly called?: Card
    readonly partner?: Player
    readonly dog: Card[]

    readonly bidding: CompletedBids
    readonly shows: ShowTrumpState
    readonly joker_state?: JokerExchangeState
    readonly joker_exchanged?: Card

    readonly past_tricks: CompletedTrick[]
    readonly end_state: CompletedGameState
}
export type CompletedStateActions = MessageAction




