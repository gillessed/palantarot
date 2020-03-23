/*
 * This file contains definitions common to both the client and server code.
 */

/* CARDS */

enum RegSuit {
    Spade = 'S',
    Heart = 'H',
    Diamond = 'D',
    Club = 'C',
}
type TrumpSuit = 'T'
const TrumpSuit : TrumpSuit = 'T';

type Suit = RegSuit.Spade | RegSuit.Heart | RegSuit.Club | RegSuit.Diamond | TrumpSuit

enum RegValue {
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

enum TrumpValue {
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

const TheJoker: [TrumpSuit, TrumpValue.Joker] = [TrumpSuit, TrumpValue.Joker];
const TheOne: [TrumpSuit, TrumpValue._1] = [TrumpSuit, TrumpValue._1];
const The21: [TrumpSuit, TrumpValue._21] = [TrumpSuit, TrumpValue._21];

type RegCard = [RegSuit, RegValue];

type TrumpCard = [TrumpSuit, TrumpValue];

type Card = RegCard | TrumpCard

type Bouts = typeof TheJoker | typeof TheOne | typeof The21;

/* STRUCTS */

enum BidValue {
    PASS = 0,
    TEN = 10,
    TWENTY = 20,
    FORTY = 40,
    EIGHTY = 80,
    ONESIXTY = 160,
}

enum Call {
    RUSSIAN = 'russian',
    DECLARED_SLAM = 'declared_slam',
}

enum Outcome {
    SLAMMED = 'slammed',
    ONE_LAST = 'one_last',
}

type Player = String

const DummyPlayer: Player = '[dummy null player]';

interface Trick {
    readonly trick_num: number
    /** n-th card was played by n-th player */
    readonly cards: Card[]
    readonly players: Player[]
    readonly current_player: number
}

interface CompletedTrick {
    readonly trick_num: number
    readonly cards: Card[]
    readonly players: Player[]
    readonly winner: Player
}

interface Bid {
    readonly player: Player
    readonly bid: BidValue
    readonly calls: Call[]
}

interface CurrentBids {
    /** in order of bid */
    readonly bids: Bid[]
    /** remaining bidders, in order of bidding, 0-th position is next bidder */
    readonly bidders: Player[]
    readonly current_high: Bid
}

interface CompletedBids {
    readonly winning_bid: Bid
    readonly calls: { [player: number]: Call[] }
}

type ShowTrumpState = { [player: number]: Player[] };

interface JokerExchangeState {
    readonly player: Player
    readonly owed_to: Player
}

interface CompletedGameState {
    readonly bidder: Player
    readonly partner?: Player
    readonly dog: Card[]

    readonly calls: { [player: number]: Call[] }
    readonly outcomes: { [player: number]: Outcome[] }
    readonly joker_exchanged?: Card
    readonly points_earned: number
    readonly bouts: Bouts[]
    readonly bidder_won: boolean
    readonly points_result: number
}

interface PlayerEvent {
    readonly type: string
}

/* ACTIONS */

/**
 * Actions are sent by the player to the server,
 * and are then relayed by the server to other players (assuming they are public).
 */
interface Action extends PlayerEvent {
    readonly player: Player;
    readonly time: Date
}

interface MessageAction extends Action {
    readonly type: 'message'
    readonly text: String
}

interface EnterGameAction extends Action {
    readonly type: 'enter_game'
}

interface PlayerReadyAction extends Action {
    readonly type: 'mark_player_ready'
}

interface BidAction extends Action {
    readonly type: 'bid'
    readonly bid: BidValue
    readonly calls: Call[]
}

interface ShowTrumpAction extends Action {
    readonly type: 'show_trump'
    /** Needs to match all trumps in player's hand */
    readonly cards: TrumpCard[]
}

interface AckTrumpShowAction extends Action {
    readonly type: 'ack_trump_show'
    readonly showing_player: Player
}

interface CallPartnerAction extends Action {
    readonly type: 'call_partner'
    readonly card: Card
}

interface DeclareSlam extends Action {
    readonly type: 'declare_slam'
}

interface AckDogAction extends Action {
    readonly type: 'ack_dog'
}

interface SetDogAction extends Action {
    readonly type: 'set_dog'
    readonly dog: Card[]
}

interface PlayCardAction extends Action {
    readonly type: 'play_card'
    readonly card: Card
}

/* TRANSITIONS */

/**
 * The server is also allowed to send messages to the players about transitions to game state.
 */
interface Transition extends PlayerEvent {
    /** if contains state for only one player, which player to send to */
    readonly private_to?: Player
}

interface DealtHandTransition extends Transition {
    readonly type: 'dealt_hand'
    readonly private_to: Player

    readonly hand: Card[]
}

interface EndTrumpShowTransition extends Transition {
    readonly type: 'end_trump_show'
    readonly player_showing_trump: Player
}

interface BiddingCompletedTransition extends Transition {
    readonly type: 'bidding_completed'
    readonly private_to: undefined

    readonly winning_bid: Bid
}

interface DogRevealTransition extends Transition {
    readonly type: 'dog_reveal'
    readonly private_to: undefined

    readonly dog: Card[]
}

interface GameStartTransition extends Transition {
    readonly type: 'game_start'
    readonly private_to: undefined

    readonly first_player: Player
}

interface CompletedTrickTransition extends Transition {
    readonly type: 'completed_trick'
    readonly private_to: undefined

    readonly winner: Player
    readonly winning_card: Card
    readonly joker_state?: JokerExchangeState
}

interface GameCompletedTransition extends Transition {
    readonly type: 'game_completed'
    readonly private_to: undefined

    readonly end_state: CompletedGameState
}

interface GameAbortedTransition extends Transition {
    readonly type: 'game_aborted'
    readonly reason: string
}


/* ERRORS */

const errorActionAlreadyHappened = function(action: Action, state: any) {
    return new Error(`Cannot ${action} as it has already happened! Existing state: ${state}`)
};

const errorTooManyPlayers = function(player: Player, players: Player[]) {
    return new Error(`Cannot add ${player} as there are already too many players: ${players}`)
};

const errorPlayerNotInGame = function(player: Player, players: Player[]) {
    return new Error(`Cannot find ${player}! Existing players: ${players}`)
};

const errorBiddingOutOfTurn = function(player: Player, current: Player) {
    return new Error(`${player} cannot bid because it is currently ${current}'s turn.`);
};

const errorBidTooLow = function(action: BidValue, current: BidValue) {
    return new Error(`Bid value of ${action} is too low! Need to either pass or exceed ${current}.`)
};

const errorCannotShowTwice = function(player: Player) {
    return new Error(`${player} cannot show trump twice!`)
};

const errorInvalidTrumpShow = function(action: ShowTrumpAction, expected: TrumpCard[]) {
    return new Error(`Invalid trump show ${action}, didn't get the following expected trump: ${expected}.`)
};

const errorTrumpNotBeingShown = function(player: Player, playersShowing: Player[]) {
    return new Error(`Cannot acknowledge ${player}'s trump show, as only ${playersShowing} are currently showing trump.`)
};

const errorCannotCallTrump = function(card: Card) {
    return new Error(`You cannot call a trump card as your partner call! ${card}`)
};

const errorCannotSetDogIfNotBidder = function(taker: Player, bidder: Player) {
    return new Error(`Player ${taker} cannot exchange with the dog, as they are not ${bidder}!`)
};

const errorNewDogWrongSize = function(dog: Card[], expected: number) {
    return new Error(`Proposed dog ${dog} does not have the expected number of cards, ${expected}.`)
};

const errorNewDogDoesntMatchHand = function(dog: Card[], possible: Card[]) {
    return new Error(`Proposed dog ${dog} contains cards that are not in your hand or the dog: ${possible}.`)
};

const errorAfterFirstTurn = function(action: Action) {
    return new Error(`Cannot ${action}, as it is after this player's first turn.`)
};

const errorPlayingOutOfTurn = function(player: Player, current: Player) {
    return new Error(`${player} cannot play a card because it is currently ${current}'s turn.`);
};

const errorCardNotInHand = function(action: Action & {card: Card}, hand: Card[]) {
    return new Error(`Cannot conduct ${action}, as requested card is not in the players hand! Hand contains ${hand}`)
};

const errorCannotPlayCard = function(card: Card, trick: Card[], allowable: Card[]) {
    return new Error(`Cannot play card ${card} into played cards ${trick}. You must play one of ${allowable}.`);
}
