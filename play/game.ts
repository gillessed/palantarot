/* STATES */

interface NewGameBoardState {
    readonly players: Player[]
    /** n-th value is readiness of n-th player */
    readonly ready: boolean[]
}
type NewGameActions = EnterGameAction | PlayerReadyAction | MessageAction

/**
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
type BiddingStateActions = BidAction | MakeCallAction | ShowTrumpAction | AckTrumpShowAction | MessageAction

/**
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
type PartnerCallStateActions = CallPartnerAction | MakeCallAction | ShowTrumpAction | AckTrumpShowAction | MessageAction

/**
 * Transitions:
 *  - {@link BidderDogExchangePhase}
 */
interface DogRevealBoardState {
    readonly players: Player[]
    readonly bidder: Player
    readonly called?: Card

    readonly hands: {Player: Hand}
    readonly dog: Card[]
    readonly playersUnacked: Player[]

    readonly bidding: CompletedBids
    readonly shows: ShowTrumpState[]
}
type DogRevealStateActions = AckDogAction | MakeCallAction | ShowTrumpAction | AckTrumpShowAction | TakeDogAction | MessageAction

/**
 * Transitions:
 *  - {@link PlayingBoardState}
 */
interface BidderDogExchangeBoardState {
    readonly players: Player[]
    readonly bidder: Player
    readonly called?: Card

    readonly hands: {Player: Hand}
    readonly dog: Card[]

    readonly bidding: CompletedBids
    readonly shows: ShowTrumpState[]
}
/** {@link TakeDogAction}, {@link AddToDogAction}, and {@link AckDogAction} are for bidder only */
type BidderDogExchangeStateActions = TakeDogAction | AddToDogAction | AckDogAction |
    MakeCallAction | ShowTrumpAction | AckTrumpShowAction | MessageAction

/**
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
type PlayingStateActions = PlayCardAction | MakeCallAction | ShowTrumpAction | AckTrumpShowAction | MessageAction

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
    readonly endState: CompletedGameState
}
type CompletedStateActions = MessageAction




