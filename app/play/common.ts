/*
 * This file contains definitions common to both the client and server code.
 */

/* CARDS */

import {toCardString} from "./cardUtils";

export enum RegSuit {
    Spade = 'S',
    Heart = 'H',
    Diamond = 'D',
    Club = 'C',
}
export type TrumpSuit = 'T'
export const TrumpSuit: TrumpSuit = 'T';

export type Suit = RegSuit.Spade | RegSuit.Heart | RegSuit.Club | RegSuit.Diamond | TrumpSuit

export enum RegValue {
    _1 = 1,
    _2 = 2,
    _3 = 3,
    _4 = 4,
    _5 = 5,
    _6 = 6,
    _7 = 7,
    _8 = 8,
    _9 = 9,
    _10 = 10,
    V = 'V',
    C = 'C',
    D = 'D',
    R = 'R',
}

export enum TrumpValue {
    Joker = 'Joker',
    _1 = 1,
    _2 = 2,
    _3 = 3,
    _4 = 4,
    _5 = 5,
    _6 = 6,
    _7 = 7,
    _8 = 8,
    _9 = 9,
    _10 = 10,
    _11 = 11,
    _12 = 12,
    _13 = 13,
    _14 = 14,
    _15 = 15,
    _16 = 16,
    _17 = 17,
    _18 = 18,
    _19 = 19,
    _20 = 20,
    _21 = 21,
}

export const TheJoker: [TrumpSuit, TrumpValue.Joker] = [TrumpSuit, TrumpValue.Joker];
export const TheOne: [TrumpSuit, TrumpValue._1] = [TrumpSuit, TrumpValue._1];
export const The21: [TrumpSuit, TrumpValue._21] = [TrumpSuit, TrumpValue._21];

export type RegCard = [RegSuit, RegValue];

export type TrumpCard = [TrumpSuit, TrumpValue];

export type Card = RegCard | TrumpCard

export type Bout = typeof TheJoker | typeof TheOne | typeof The21;

/* STRUCTS */

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
    readonly bids: Bid[]
    /** remaining bidders, in order of bidding, 0-th position is next bidder */
    readonly bidders: PlayerId[]
    readonly current_high: Bid
}

export interface CompletedBids {
    readonly winning_bid: Bid
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
    readonly points_earned: number
    readonly bouts: Bout[]
    readonly bidder_won: boolean
    readonly points_result: number
}

export interface PlayerEvent {
    readonly type: ActionType | TransitionType | 'error'
    /** if contains state for only one player, which player to send to */
    readonly private_to?: PlayerId
}

export interface ErrorEvent extends PlayerEvent {
    readonly type: 'error'
    readonly error: string
    readonly private_to: undefined
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

export type ActionType = 'message' | 'enter_game' | 'leave_game' | 'mark_player_ready' | 'unmark_player_ready'
    | 'bid' | 'show_trump' | 'call_partner' | 'declare_slam' | 'set_dog' | 'play_card';

export interface PublicAction extends Action {
    readonly private_to?: undefined;
}

export interface MessageAction extends PublicAction {
    readonly type: 'message'
    readonly text: string
}

export interface EnterGameAction extends PublicAction {
    readonly type: 'enter_game'
}

export interface LeaveGameAction extends PublicAction {
    readonly type: 'leave_game'
}

export interface PlayerReadyAction extends PublicAction {
    readonly type: 'mark_player_ready'
}

export interface PlayerNotReadyAction extends PublicAction {
    readonly type: 'unmark_player_ready'
}

export interface BidAction extends PublicAction {
    readonly type: 'bid'
    readonly bid: BidValue
    readonly calls?: Call[]
}

export interface ShowTrumpAction extends PublicAction {
    readonly type: 'show_trump'
    /** Needs to match all trumps in player's hand */
    readonly cards: TrumpCard[]
}

export interface CallPartnerAction extends PublicAction {
    readonly type: 'call_partner'
    readonly card: Card
}

export interface DeclareSlam extends PublicAction {
    readonly type: 'declare_slam'
}

export interface SetDogAction extends Action {
    readonly type: 'set_dog'
    readonly dog: Card[]
    readonly private_to: PlayerId
}

export interface PlayCardAction extends PublicAction {
    readonly type: 'play_card'
    readonly card: Card
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

export type TransitionType = 'dealt_hand' | 'bidding_completed' | 'dog_revealed' | 'game_started'
    | 'completed_trick' | 'game_completed' | 'game_aborted' | 'entered_chat' | 'left_chat';

export interface EnteredChatTransition extends Transition {
    readonly type: 'entered_chat'
    readonly player: PlayerId
}

export interface LeftChatTransition extends Transition {
    readonly type: 'left_chat'
    readonly player: PlayerId
}

export interface DealtHandTransition extends Transition {
    readonly type: 'dealt_hand'
    readonly private_to: PlayerId
    readonly player_order: PlayerId[]

    readonly hand: Card[]
}

export interface BiddingCompletedTransition extends Transition {
    readonly type: 'bidding_completed'
    readonly private_to: undefined

    readonly winning_bid: Bid
}

export interface DogRevealTransition extends Transition {
    readonly type: 'dog_revealed'
    readonly private_to: undefined
    readonly player: PlayerId

    readonly dog: Card[]
}

export interface GameStartTransition extends Transition {
    readonly type: 'game_started'
    readonly private_to: undefined

    readonly first_player: PlayerId
}

export interface CompletedTrickTransition extends Transition {
    readonly type: 'completed_trick'
    readonly private_to: undefined

    readonly winner: PlayerId
    readonly winning_card: Card
    readonly joker_state?: JokerExchangeState
}

export interface GameCompletedTransition extends Transition {
    readonly type: 'game_completed'
    readonly private_to: undefined

    readonly end_state: CompletedGameState
}

export interface GameAbortedTransition extends Transition {
    readonly type: 'game_aborted'
    readonly reason: string
}

/* LOBBY VIEW */

export interface GameDescription {
    readonly state: string
    readonly players: PlayerId[]
    readonly last_updated: number
}


/* USER ERRORS */

export const errorInvalidActionForGameState = function (action: Action, state: string) {
    return new Error(`Cannot ${action.type} as we're currently in game state ${state}!`)
};

export const errorActionAlreadyHappened = function (action: Action, state: PlayerId[]) {
    return new Error(`Cannot ${action.type} as it has already happened! Existing state: ${state}`)
};

export const errorTooManyPlayers = function (player: PlayerId, players: PlayerId[]) {
    return new Error(`Cannot add ${player} as there are already too many players: ${players}`)
};

export const errorPlayerNotInGame = function (player: PlayerId, players: PlayerId[]) {
    return new Error(`Cannot find ${player}! Existing players: ${players}`)
};

export const errorPlayerMarkedReady = function (player: PlayerId) {
    return new Error(`Player ${player} cannot currently leave the game! They must unmark themselves as ready first.`)
}

export const errorPlayerNotReady = function (player: PlayerId, players: PlayerId[]) {
    return new Error(`Player ${player} cannot unmark themselves as ready, because they weren't ready to start! ${players}`)
}

export const errorBiddingOutOfTurn = function (player: PlayerId, current: PlayerId) {
    return new Error(`${player} cannot bid because it is currently ${current}'s turn.`);
};

export const errorCanOnlyCallRussianOnTwenties = function (bid: Bid) {
    return new Error(`${bid.player} illegally tried to bid a Russian ${bid.bid}!`);
};

export const errorBidTooLow = function (action: BidValue, current: BidValue) {
    return new Error(`Bid value of ${action} is too low! Need to either pass or exceed ${current}.`)
};

export const errorOnlyBidderCanDeclareSlam = function (player: PlayerId, bidder: PlayerId) {
    return new Error(`Player ${player} cannot declare a slam, only ${bidder} can!`)
}

export const errorCannotShowTwice = function (player: PlayerId) {
    return new Error(`${player} cannot show trump twice!`)
};

export const errorInvalidTrumpShow = function (action: ShowTrumpAction, expected: TrumpCard[]) {
    return new Error(`Invalid trump show: Got ${action.cards.map(toCardString)}, expected ${expected.map(toCardString)}.`)
};

export const errorNotEnoughTrump = function (trumps: number, needed: number) {
    return new Error(`Not enough trump to show! You have ${trumps} but need ${needed}.`)
};

export const errorCannotCallPartnerIfNotBidder = function (player: PlayerId, bidder: PlayerId) {
    return new Error(`${player} cannot call a partner because they are not the the bidder, ${bidder}!`)
}

export const errorCannotCallTrump = function (card: Card) {
    return new Error(`You cannot call a trump card as your partner call! ${toCardString(card)}`)
};

export const errorCannotSetDogIfNotBidder = function (taker: PlayerId, bidder: PlayerId) {
    return new Error(`Player ${taker} cannot exchange with the dog, as they are not ${bidder}!`)
};

export const errorSetDogActionShouldBePrivate = function (action: SetDogAction) {
    return new Error(`Setting dog should have 'private_to' attribute set to the player, instead got ${action.private_to}`)
};

export const errorNewDogWrongSize = function (dog: Card[], expected: number) {
    return new Error(`Proposed dog ${dog.map(toCardString)} does not have the expected number of cards, ${expected}.`)
};

export const errorNewDogDoesntMatchHand = function (dog: Card[], possible: Card[]) {
    return new Error(`Proposed dog ${dog.map(toCardString)} contains cards that are not in your hand or the dog: ${possible.map(toCardString)}.`)
};

export const errorAfterFirstTurn = function (action: Action) {
    return new Error(`Cannot ${action.type}, as it is after this player's first turn.`)
};

export const errorPlayingOutOfTurn = function (player: PlayerId, current: PlayerId) {
    return new Error(`${player} cannot play a card because it is currently ${current}'s turn.`);
};

export const errorCardNotInHand = function (action: Action & {card: Card}, hand: Card[]) {
    return new Error(`Cannot conduct ${action.type} with ${toCardString(action.card)}, as requested card is not in the players hand! Hand contains ${hand.map(toCardString)}`)
};

export const errorCannotPlayCard = function (card: Card, trick: Card[], allowable: Card[]) {
    return new Error(`Cannot play card ${toCardString(card)} into played cards ${trick.map(toCardString)}. You must play one of ${allowable.map(toCardString)}.`);
};

export const errorCannotLeadCalledSuit = function (card: Card, called: Card) {
    return new Error(`Cannot play card ${toCardString(card)} first turn because you called ${toCardString(called)}.`)
}
