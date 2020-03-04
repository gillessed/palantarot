/* CARDS */

enum RegSuits {
    Spade = 'S',
    Heart = 'H',
    Diamond = 'D',
    Club = 'C',
}
type TrumpSuit = 'T'
const TrumpSuit : TrumpSuit = 'T';

type Suit = RegSuits.Spade | RegSuits.Heart | RegSuits.Club | RegSuits.Diamond | TrumpSuit

enum RegValues {
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

enum TrumpValues {
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

type Bout = TrumpValues._1 | TrumpValues._21 | TrumpValues.Joker

interface BaseCard {
    readonly suit: Suit
    readonly value: RegValues | TrumpValues
}

interface RegCard extends BaseCard {
    readonly suit: RegSuits
    readonly value: RegValues
}

interface TrumpCard extends BaseCard {
    readonly suit: TrumpSuit
    readonly value: TrumpValues
}

type Card = RegCard | TrumpCard

function createAllCards() {
    let cards = []
    for (let suit in RegSuits) {
        for (let value in RegValues) {
            cards.push({ suit, value })
        }
    }
    for (let value in TrumpValues) {
        cards.push({ suit: TrumpSuit, value})
    }
}

/* STRUCTS */

enum BidValues {
    TEN = 10,
    TWENTY = 20,
    FORTY = 40,
    EIGHTY = 80,
    ONESIXTY = 160,
}

enum Calls {
    RUSSIAN = "russian",
    DECLARED_SLAM = "declared_slam",
    SHOWED = "showed",
}

enum Outcomes {
    SLAMMED = "slammed",
    ONE_LAST = "one_last",
}

interface Hand {
    readonly cards: Card[]
}

interface Player {
    readonly name: String
}

interface Trick {
    // n-th card was played by n-th player
    readonly cards: Card[]
    readonly players: Player[]
    readonly leadSuit?: Suit
}

interface CompletedTrick {
    readonly trickNum: number
    readonly cards: Card[]
    readonly players: Player[]
    readonly winner: Player
}

interface Bid {
    readonly player: Player
    readonly bid: BidValues
    readonly calls: Calls[]
}

interface CurrentBids {
    // in order of bid
    readonly bids: Bid[]
    // remaining bidders, in order of bidding, 0-th position is next bidder
    readonly bidders: Player[]
    readonly currentHigh: Bid
}

interface CompletedBids {
    readonly winningBid: Bid
    readonly calls: {Player: Calls[]}
}

interface ShowTrumpState {
    readonly cards: TrumpCard[]
    readonly playerRevealing?: Player
    readonly playersUnacked: Player[] // if empty, all done.
}

interface JokerExchangeState {
    readonly player: Player
    readonly owedTo: Player
    readonly cardExchanged?: Card // if present, exchange completed
}

/* ACTIONS */

interface CallPartner {
    readonly card: Card
}

interface MakeCall {
    readonly call: Calls
}

interface PlayCard {
    readonly card: Card
}

/* STATES */

/**
 * Actions:
 *  - {@link Bid}
 *  - {@link MakeCall}
 *  - {@link AckTrump}
 *
 * Transitions:
 *  - {@link PartnerCallBoardState}
 *  - {@link DogRevealState}
 *  - {@link PlayingBoardState}
 */
interface BiddingBoardState {
    readonly players: Player[]

    readonly hands: {Player: Hand}
    readonly dog: Card[]

    readonly bidding: CurrentBids
    readonly currentBidder: Player
    readonly shows: ShowTrumpState[]
}

/**
 * Actions:
 *  - {@link CallPartner}
 *  - {@link MakeCall}
 *  - {@link AckTrump}
 *
 * Transitions:
 *  - {@link DogRevealState}
 *  - {@link PlayingBoardState}
 */
interface PartnerCallBoardState {
    readonly players: Player[]
    readonly bidder: Player

    readonly hands: {Player: Hand}
    readonly dog: Card[]

    readonly bidding: CompletedBids
    readonly shows: ShowTrumpState[]
}

/**
 * Actions:
 *  - {@link AckDog}
 *  - {@link MakeCall}
 *  - {@link AckTrump}
 *
 * Transitions:
 *  - {@link BidderDogExchangePhase}
 */
interface DogRevealState {
    readonly players: Player[]
    readonly bidder: Player
    readonly called?: Card

    readonly hands: {Player: Hand}
    readonly dog: Card[]
    readonly playersUnacked: Player[]

    readonly bidding: CompletedBids
    readonly shows: ShowTrumpState[]
}

/**
 * Actions:
 *  - {@link TakeDog} (bidder only)
 *  - {@link AddToDog} (bidder only)
 *  - {@link AckDog} (bidder only)
 *  - {@link MakeCall}
 *  - {@link AckTrump}
 *
 * Transitions:
 *  - {@link PlayingBoardState}
 */
interface BidderDogExchangePhase {
    readonly players: Player[]
    readonly bidder: Player
    readonly called?: Card

    readonly hands: {Player: Hand}
    readonly dog: Card[]

    readonly bidding: CompletedBids
    readonly shows: ShowTrumpState[]
}

/**
 * Actions:
 *  - {@link PlayCard}
 *  - {@link MakeCall}
 *  - {@link AckTrump}
 *
 * Transitions:
 *  - {@link CompletedBoardState}
 */
interface PlayingBoardState {
    readonly players: Player[]
    readonly bidder: Player
    readonly called?: Card
    readonly partner?: Player

    readonly hands: {Player: Hand}
    readonly dog: Card[]

    readonly bidding: CompletedBids
    readonly shows: ShowTrumpState[]
    readonly jokerState?: JokerExchangeState

    readonly currentTrick: Trick
    readonly currentPlayer: Player
    readonly pastTricks: CompletedTrick[]
}

interface CompletedBoardState {
    readonly players: Player[]
    readonly bidder: Player
    readonly called?: Card
    readonly partner?: Player

    readonly dog: Card[]

    readonly bidding: CompletedBids
    readonly shows: ShowTrumpState[]
    readonly jokerState?: JokerExchangeState

    readonly pastTricks: CompletedTrick[]
    readonly outcomes: {Player: Outcomes[]}

    readonly pointsEarned: number
    readonly bouts: number
    readonly bidderWon: boolean
    readonly pointsResult: number
}




