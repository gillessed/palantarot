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

interface Player {
    readonly name: string
}

interface Trick {
    readonly trick_num: number
    /** n-th card was played by n-th player */
    readonly cards: Card[]
    readonly players: Player[]
    readonly leadSuit?: Suit
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
    readonly current_high?: Bid
}

interface CompletedBids {
    readonly winning_bid: Bid
    readonly calls: Map<Player, Call[]>
}

interface ShowTrumpState {
    readonly cards: TrumpCard[]
    readonly player_revealing: Player
    /** if empty, all done. */
    readonly players_unacked: Player[]
}

interface JokerExchangeState {
    readonly player: Player
    readonly owed_to: Player
    /** if present, exchange completed */
    readonly card_exchanged?: Card
}

interface CompletedGameState {
    readonly bidder: Player
    readonly partner?: Player

    readonly calls: Map<Player, Call[]>
    readonly outcomes: Map<Player, Outcome[]>
    readonly points_earned: number
    readonly bouts: number
    readonly bidder_won: boolean
    readonly points_result: number
}

interface PlayerEvent {
    readonly type: string
    readonly time: Date
}

/* ACTIONS */

interface Action extends PlayerEvent {
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
    readonly type: 'mark_player_ready'
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
    readonly showing_player: Player
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

interface Transition extends PlayerEvent {
    /** if contains state for only one player, which player to send to */
    readonly private_to?: Player
}

interface GameStartTransition extends Transition {
    readonly type: 'game_start'
    readonly private_to: Player

    readonly hand: Card[]
}

interface BiddingCompletedTransition extends Transition {
    readonly type: 'bidding_completed'
    readonly private_to: undefined

    readonly winner: Player
    readonly bid: BidValue
    readonly russian: boolean
}

interface DogRevealTransition extends Transition {
    readonly type: 'dog_reveal'
    readonly private_to: undefined

    readonly dog: Card[]
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


/* VIEWS */

interface PlayerView {
    events: Event[]
}

interface NewGameView extends PlayerView {

}

/* ERRORS */

const errorActionAlreadyHappened = function(action: Action, state: any) {
    return new Error(`Cannot ${action} as it has already happened! Existing state: ${state}`);
};

const errorTooManyPlayers = function(player: Player, players: Player[]) {
    return new Error(`Cannot add ${player} as there are already too many players: ${players}`);
}

const errorPlayerNotInGame = function(player: Player, players: Player[]) {
    return new Error(`Cannot mark ${player} as ready because they're not in the game! Existing players: ${players}`);
}
