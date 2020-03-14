interface BoardReducer<STATE extends BoardState, ACTION extends Action, RESULT extends BoardState> {
    (state: STATE, action: ACTION): [RESULT, ...PlayerEvent[]]
}

/* STATES */

interface BoardState {
    readonly name: string
    readonly players: Player[]
}

interface NewGameBoardState extends BoardState {
    readonly name: 'new_game'

    /** n-th value is readiness of n-th player */
    readonly ready: Player[]
}
type NewGameActions = EnterGameAction | PlayerReadyAction | MessageAction
type NewGameStates = NewGameBoardState | BiddingBoardState

interface BiddingBoardState extends BoardState {
    readonly name: 'bidding'

    readonly hands: Map<Player, Card[]>
    readonly dog: Card[]

    readonly bidding: CurrentBids
    readonly shows: ShowTrumpState
}
type BiddingStateActions = BidAction | DeclareSlam | ShowTrumpAction | AckTrumpShowAction | MessageAction
type BiddingStates = BiddingBoardState | PartnerCallBoardState | DogRevealBoardState | PlayingBoardState | NewGameBoardState

interface PartnerCallBoardState extends BoardState {
    readonly name: 'partner_call'

    readonly bidder: Player

    readonly hands: Map<Player, Card[]>
    readonly dog: Card[]

    readonly bidding: CompletedBids
    readonly shows: ShowTrumpState
}
type PartnerCallStateActions = CallPartnerAction | DeclareSlam | ShowTrumpAction | AckTrumpShowAction | MessageAction
type PartnerCallStates = PartnerCallBoardState | DogRevealBoardState | PlayingBoardState

/**
 * Transitions:
 *  - {@link BidderDogExchangePhase}
 */
interface DogRevealBoardState extends BoardState {
    readonly name: 'dog_reveal'

    readonly bidder: Player
    readonly called?: Card

    readonly hands: Map<Player, Card[]>
    readonly dog: Card[]
    readonly players_acked: Player[]

    readonly bidding: CompletedBids
    readonly shows: ShowTrumpState
}
type DogRevealStateActions = AckDogAction | DeclareSlam | ShowTrumpAction | AckTrumpShowAction | TakeDogAction | MessageAction

/**
 * Transitions:
 *  - {@link PlayingBoardState}
 */
interface BidderDogExchangeBoardState extends BoardState {
    readonly name: 'bidder_dog_exchange'

    readonly bidder: Player
    readonly called?: Card

    readonly hands: Map<Player, Card[]>
    readonly dog: Card[]

    readonly bidding: CompletedBids
    readonly shows: ShowTrumpState
}
/** {@link TakeDogAction}, {@link AddToDogAction}, and {@link AckDogAction} are for bidder only */
type BidderDogExchangeStateActions = TakeDogAction | AddToDogAction | AckDogAction |
    DeclareSlam | ShowTrumpAction | AckTrumpShowAction | MessageAction

/**
 * Transitions:
 *  - {@link CompletedBoardState}
 */
interface PlayingBoardState extends BoardState {
    readonly name: 'playing'

    readonly bidder: Player
    readonly called?: Card
    readonly partner?: Player

    readonly hands: Map<Player, Card[]>
    readonly dog: Card[]

    readonly bidding: CompletedBids
    readonly shows: ShowTrumpState
    readonly joker_state?: JokerExchangeState

    readonly current_trick: Trick
    readonly past_tricks: CompletedTrick[]
}
type PlayingStateActions = PlayCardAction | DeclareSlam | ShowTrumpAction | AckTrumpShowAction | MessageAction

interface CompletedBoardState extends BoardState {
    readonly name: 'completed'

    readonly bidder: Player
    readonly called?: Card
    readonly partner?: Player

    readonly dog: Card[]

    readonly bidding: CompletedBids
    readonly shows: ShowTrumpState
    readonly joker_state?: JokerExchangeState

    readonly past_tricks: CompletedTrick[]
    readonly end_state: CompletedGameState
}
type CompletedStateActions = MessageAction




