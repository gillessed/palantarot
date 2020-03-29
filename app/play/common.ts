/*
 * This file contains definitions common to both the client and server code.
 */

/* CARDS */

export enum RegSuit {
    Spade = 'S',
    Heart = 'H',
    Diamond = 'D',
    Club = 'C',
}
export type TrumpSuit = 'T'
export const TrumpSuit : TrumpSuit = 'T';
RegSuit.Club

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

export type Player = String

export const DummyPlayer: Player = '[dummy null player]';

export interface Trick {
    readonly trick_num: number
    /** n-th card was played by n-th player */
    readonly cards: Card[]
    readonly players: Player[]
    readonly current_player: number
}

export interface CompletedTrick {
    readonly trick_num: number
    readonly cards: Card[]
    readonly players: Player[]
    readonly winner: Player
}

export interface Bid {
    readonly player: Player
    readonly bid: BidValue
    readonly calls: Call[]
}

export interface CurrentBids {
    /** in order of bid */
    readonly bids: Bid[]
    /** remaining bidders, in order of bidding, 0-th position is next bidder */
    readonly bidders: Player[]
    readonly current_high: Bid
}

export interface CompletedBids {
    readonly winning_bid: Bid
    readonly calls: { [player: number]: Call[] }
}

export type ShowTrumpState = { [player: number]: Player[] };

export interface JokerExchangeState {
    readonly player: Player
    readonly owed_to: Player
}

export interface CompletedGameState {
    readonly bidder: Player
    readonly bid: BidValue
    readonly partner?: Player
    readonly dog: Card[]

    readonly calls: { [player: number]: Call[] }
    readonly outcomes: { [player: number]: Outcome[] }
    readonly shows: Player[]
    readonly points_earned: number
    readonly bouts: Bout[]
    readonly bidder_won: boolean
    readonly points_result: number
}

export interface PlayerEvent {
    readonly type: string
    /** if contains state for only one player, which player to send to */
    readonly private_to?: Player
}

/* ACTIONS */

/**
 * Actions are sent by the player to the server,
 * and are then relayed by the server to other players (assuming they are public).
 *
 * Their types are present tense commands.
 */
export interface Action extends PlayerEvent {
    readonly player: Player
    readonly time: number
}

export interface PublicAction extends Action {
    readonly private_to?: undefined;
}

export interface MessageAction extends PublicAction {
    readonly type: 'message'
    readonly text: String
}

export interface EnterGameAction extends PublicAction {
    readonly type: 'enter_game'
}

export interface PlayerReadyAction extends PublicAction {
    readonly type: 'mark_player_ready'
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

export interface AckTrumpShowAction extends PublicAction {
    readonly type: 'ack_trump_show'
    readonly showing_player: Player
}

export interface CallPartnerAction extends PublicAction {
    readonly type: 'call_partner'
    readonly card: Card
}

export interface DeclareSlam extends PublicAction {
    readonly type: 'declare_slam'
}

export interface AckDogAction extends PublicAction {
    readonly type: 'ack_dog'
}

export interface SetDogAction extends Action {
    readonly type: 'set_dog'
    readonly dog: Card[]
    readonly private_to: Player
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
}

export interface DealtHandTransition extends Transition {
    readonly type: 'dealt_hand'
    readonly private_to: Player

    readonly hand: Card[]
}

export interface EndTrumpShowTransition extends Transition {
    readonly type: 'trump_show_ended'
    readonly player_showing_trump: Player
}

export interface BiddingCompletedTransition extends Transition {
    readonly type: 'bidding_completed'
    readonly private_to: undefined

    readonly winning_bid: Bid
}

export interface DogRevealTransition extends Transition {
    readonly type: 'dog_revealed'
    readonly private_to: undefined

    readonly dog: Card[]
}

export interface GameStartTransition extends Transition {
    readonly type: 'game_started'
    readonly private_to: undefined

    readonly first_player: Player
}

export interface CompletedTrickTransition extends Transition {
    readonly type: 'completed_trick'
    readonly private_to: undefined

    readonly winner: Player
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


/* USER ERRORS */

export const errorInvalidActionForGameState = function(action: Action, state: string) {
    return new Error(`Cannot ${action} as we're currently in game state ${state}!`)
};

export const errorActionAlreadyHappened = function(action: Action, state: any) {
    return new Error(`Cannot ${action} as it has already happened! Existing state: ${state}`)
};

export const errorTooManyPlayers = function(player: Player, players: Player[]) {
    return new Error(`Cannot add ${player} as there are already too many players: ${players}`)
};

export const errorPlayerNotInGame = function(player: Player, players: Player[]) {
    return new Error(`Cannot find ${player}! Existing players: ${players}`)
};

export const errorBiddingOutOfTurn = function(player: Player, current: Player) {
    return new Error(`${player} cannot bid because it is currently ${current}'s turn.`);
};

export const errorBidTooLow = function(action: BidValue, current: BidValue) {
    return new Error(`Bid value of ${action} is too low! Need to either pass or exceed ${current}.`)
};

export const errorCannotShowTwice = function(player: Player) {
    return new Error(`${player} cannot show trump twice!`)
};

export const errorInvalidTrumpShow = function(action: ShowTrumpAction, expected: TrumpCard[]) {
    return new Error(`Invalid trump show ${action}, didn't get the following expected trump: ${expected}.`)
};

export const errorTrumpNotBeingShown = function(player: Player, playersShowing: Player[]) {
    return new Error(`Cannot acknowledge ${player}'s trump show, as only ${playersShowing} are currently showing trump.`)
};

export const errorCannotCallTrump = function(card: Card) {
    return new Error(`You cannot call a trump card as your partner call! ${card}`)
};

export const errorCannotSetDogIfNotBidder = function(taker: Player, bidder: Player) {
    return new Error(`Player ${taker} cannot exchange with the dog, as they are not ${bidder}!`)
};

export const errorSetDogActionShouldBePrivate = function(action: SetDogAction) {
    return new Error(`${action} should be private, and should have 'private_to' attribute set to the player`)
};

export const errorNewDogWrongSize = function(dog: Card[], expected: number) {
    return new Error(`Proposed dog ${dog} does not have the expected number of cards, ${expected}.`)
};

export const errorNewDogDoesntMatchHand = function(dog: Card[], possible: Card[]) {
    return new Error(`Proposed dog ${dog} contains cards that are not in your hand or the dog: ${possible}.`)
};

export const errorAfterFirstTurn = function(action: Action) {
    return new Error(`Cannot ${action}, as it is after this player's first turn.`)
};

export const errorPlayingOutOfTurn = function(player: Player, current: Player) {
    return new Error(`${player} cannot play a card because it is currently ${current}'s turn.`);
};

export const errorCardNotInHand = function(action: Action & {card: Card}, hand: Card[]) {
    return new Error(`Cannot conduct ${action}, as requested card is not in the players hand! Hand contains ${hand}`)
};

export const errorCannotPlayCard = function(card: Card, trick: Card[], allowable: Card[]) {
    return new Error(`Cannot play card ${card} into played cards ${trick}. You must play one of ${allowable}.`);
};
