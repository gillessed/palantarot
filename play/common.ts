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

type Bout = TrumpValue._1 | TrumpValue._21 | TrumpValue.Joker

interface BaseCard {
    readonly suit: Suit
    readonly value: RegValue | TrumpValue
}

interface RegCard extends BaseCard {
    readonly suit: RegSuit
    readonly value: RegValue
}

interface TrumpCard extends BaseCard {
    readonly suit: TrumpSuit
    readonly value: TrumpValue
}

type Card = RegCard | TrumpCard

function createAllCards() {
    let cards = []
    for (let suit in RegSuit) {
        for (let value in RegValue) {
            cards.push({ suit, value })
        }
    }
    for (let value in TrumpValue) {
        cards.push({ suit: TrumpSuit, value})
    }
}

/* STRUCTS */

enum BidValue {
    TEN = 10,
    TWENTY = 20,
    FORTY = 40,
    EIGHTY = 80,
    ONESIXTY = 160,
}

enum Call {
    RUSSIAN = "russian",
    DECLARED_SLAM = "declared_slam",
    SHOWED = "showed",
}

enum Outcome {
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
    readonly trickNum: number
    /** n-th card was played by n-th player */
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
    readonly bid: BidValue
    readonly calls: Call[]
}

interface CurrentBids {
    /** in order of bid */
    readonly bids: Bid[]
    /** remaining bidders, in order of bidding, 0-th position is next bidder */
    readonly bidders: Player[]
    readonly currentHigh: Bid
}

interface CompletedBids {
    readonly winningBid: Bid
    readonly calls: {Player: Call[]}
}

interface ShowTrumpState {
    readonly cards: TrumpCard[]
    readonly playerRevealing: Player
    /** if empty, all done. */
    readonly playersUnacked: Player[]
}

interface JokerExchangeState {
    readonly player: Player
    readonly owedTo: Player
    /** if present, exchange completed */
    readonly cardExchanged?: Card
}

interface CompletedGameState {
    readonly bidder: Player
    readonly partner?: Player

    readonly calls: {Player: Call[]}
    readonly outcomes: {Player: Outcome[]}
    readonly pointsEarned: number
    readonly bouts: number
    readonly bidderWon: boolean
    readonly pointsResult: number
}

/* ACTIONS */

interface Action {
    readonly type: string
    readonly player: Player;
}

interface MessageAction extends Action {
    readonly type: 'message'
    readonly text: String
}

interface EnterGameAction extends Action {
    readonly type: 'enter_game'
}

interface PlayerReadyAction extends Action {
    readonly type: 'player_ready'
}

interface BidAction extends Action {
    readonly type: 'bid'
    /** Null means pass */
    readonly bid?: BidValue
    readonly calls: Call[]
}

interface ShowTrumpAction extends Action {
    readonly type: 'show_trump'
    /** Needs to match all trumps in player's hand */
    readonly cards: TrumpCard[]
}

interface AckTrumpShowAction extends Action {
    readonly type: 'ack_trump_show'
    /** If equal to {@link $player}, is player returning show to hand */
    readonly showingPlayer: Player
}

interface CallPartnerAction extends Action {
    readonly type: 'call_partner'
    readonly card: Card
}

interface MakeCallAction extends Action {
    readonly type: 'make_call'
    readonly call: Call
}

interface AckDogAction extends Action {
    readonly type: 'ack_dog'
}

interface TakeDogAction extends Action {
    readonly type: 'take_dog'
}

interface AddToDogAction extends Action {
    readonly type: 'add_to_dog'
    readonly card: Card
}

interface PlayCardAction extends Action {
    readonly type: 'play_card'
    readonly card: Card
}

/* TRANSITIONS */

interface Transition {
    readonly type: String
    /** if contains state for only one player, which player to send to */
    readonly privateTransition?: Player
}

interface NewGameTransition extends Transition {
    readonly type: 'new_game'
    readonly privateTransition: Player

    readonly deal: Card[]
}

interface BiddingCompletedTransition extends Transition {
    readonly type: 'bidding_completed'
    readonly privateTransition: undefined

    readonly winner: Player
    readonly bid: BidValue
    readonly russian: boolean
}

interface DogRevealTransition extends Transition {
    readonly type: 'dog_reveal'
    readonly privateTransition: undefined

    readonly dog: Card[]
}

interface CompletedTrickTransition extends Transition {
    readonly type: 'completed_trick'
    readonly privateTransition: undefined

    readonly winner: Player
    readonly winningCard: Card
    readonly jokerState?: JokerExchangeState
}

interface GameCompletedTransition extends Transition {
    readonly type: 'game_completed'
    readonly privateTransition: undefined

    readonly endState: CompletedGameState
}

