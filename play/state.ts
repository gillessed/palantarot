interface BoardReducer<STATE extends BoardState, ACTION extends Action, RESULT extends BoardState> {
    (state: STATE, action: ACTION): [RESULT, ...PlayerEvent[]]
}

/* STATES */

interface BoardState {
    readonly name: string
    readonly players: Player[]
}

interface DealtBoardState extends BoardState {
    readonly hands: Map<Player, Card[]>
    readonly dog: Card[]
    readonly shows: ShowTrumpState
}

interface NewGameBoardState extends BoardState {
    readonly name: 'new_game'

    /** n-th value is readiness of n-th player */
    readonly ready: Player[]
}
type NewGameActions = EnterGameAction | PlayerReadyAction | MessageAction
type NewGameStates = NewGameBoardState | BiddingBoardState

interface BiddingBoardState extends DealtBoardState {
    readonly name: 'bidding'

    readonly bidding: CurrentBids
}
type BiddingStateActions = BidAction | DeclareSlam | ShowTrumpAction | AckTrumpShowAction | MessageAction
type BiddingStates = BiddingBoardState | PartnerCallBoardState | DogRevealBoardState | PlayingBoardState | NewGameBoardState

interface PartnerCallBoardState extends DealtBoardState {
    readonly name: 'partner_call'

    readonly bidding: CompletedBids
    readonly bidder: Player
}
type PartnerCallStateActions = CallPartnerAction | DeclareSlam | ShowTrumpAction | AckTrumpShowAction | MessageAction
type PartnerCallStates = PartnerCallBoardState | DogRevealBoardState | PlayingBoardState

/**
 * Transitions:
 *  - {@link BidderDogExchangePhase}
 */
interface DogRevealBoardState extends DealtBoardState {
    readonly name: 'dog_reveal'

    readonly bidding: CompletedBids
    readonly bidder: Player

    readonly called?: Card
    readonly players_acked: Player[]

}
type DogRevealStateActions = AckDogAction | DeclareSlam | ShowTrumpAction | AckTrumpShowAction | TakeDogAction | MessageAction

/**
 * Transitions:
 *  - {@link PlayingBoardState}
 */
interface BidderDogExchangeBoardState extends DealtBoardState {
    readonly name: 'bidder_dog_exchange'

    readonly bidding: CompletedBids
    readonly bidder: Player
    readonly called?: Card
}
/** {@link TakeDogAction}, {@link AddToDogAction}, and {@link AckDogAction} are for bidder only */
type BidderDogExchangeStateActions = TakeDogAction | AddToDogAction | AckDogAction |
    DeclareSlam | ShowTrumpAction | AckTrumpShowAction | MessageAction

/**
 * Transitions:
 *  - {@link CompletedBoardState}
 */
interface PlayingBoardState extends DealtBoardState {
    readonly name: 'playing'

    readonly bidding: CompletedBids
    readonly bidder: Player
    readonly called?: Card
    readonly partner?: Player

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




