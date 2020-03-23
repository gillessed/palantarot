interface BoardReducer<STATE extends BoardState, ACTION extends Action, RESULT extends BoardState> {
    (state: STATE, action: ACTION): [RESULT, ...PlayerEvent[]]
}

/* STATES */

interface BoardState {
    readonly name: string
    readonly players: Player[]
}

interface DealtBoardState extends BoardState {
    readonly hands: { [player: number]: Card[] }
    readonly dog: Card[]
    readonly shows: ShowTrumpState
}

interface NewGameBoardState extends BoardState {
    readonly name: 'new_game'

    readonly ready: Player[]
}
type NewGameActions = EnterGameAction | PlayerReadyAction | MessageAction
type NewGameStates = NewGameBoardState | BiddingBoardState

interface BiddingBoardState extends DealtBoardState {
    readonly name: 'bidding'

    readonly bidding: CurrentBids
}
type BiddingStateActions = BidAction | DeclareSlam | ShowTrumpAction | AckTrumpShowAction | MessageAction
type BiddingStates = BiddingBoardState | PartnerCallBoardState | DogRevealAndExchangeBoardState | PlayingBoardState | NewGameBoardState

interface PartnerCallBoardState extends DealtBoardState {
    readonly name: 'partner_call'

    readonly bidding: CompletedBids
    readonly bidder: Player
}
type PartnerCallStateActions = CallPartnerAction | DeclareSlam | ShowTrumpAction | AckTrumpShowAction | MessageAction
type PartnerCallStates = PartnerCallBoardState | DogRevealAndExchangeBoardState | PlayingBoardState

interface DogRevealAndExchangeBoardState extends DealtBoardState {
    readonly name: 'dog_reveal'

    readonly bidding: CompletedBids
    readonly bidder: Player
    readonly called?: Card
    readonly partner?: Player

    readonly players_acked: Player[]

}
/** {@link SetDogAction} is for bidder only */
type DogRevealStateActions = SetDogAction | AckDogAction | DeclareSlam | ShowTrumpAction | AckTrumpShowAction | MessageAction
type DogRevealStates = DogRevealAndExchangeBoardState | PlayingBoardState

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
type PlayingStates = PlayingBoardState | CompletedBoardState

interface CompletedBoardState extends BoardState {
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
type CompletedStateActions = MessageAction




