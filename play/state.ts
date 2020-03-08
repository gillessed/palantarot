interface BoardReducer<STATE extends BoardState, ACTION extends Action, RESULT extends BoardState> {
    (state: STATE, action: ACTION): [RESULT, ...PlayerEvent[]]
}

const messageReducer = function<T extends BoardState>(state: T, action: MessageAction): T {
    return {
        ...state,
        events: [...state.events, action],
    };
};

/* STATES */

interface BoardState {
    readonly name: string
    readonly players: Player[]
    readonly events: PlayerEvent[]
}

interface NewGameBoardState extends BoardState {
    readonly name: 'new_game'

    readonly players: Player[]
    /** n-th value is readiness of n-th player */
    readonly ready: Player[]
}
type NewGameActions = EnterGameAction | PlayerReadyAction | MessageAction
type NewGameStates = NewGameBoardState | BiddingBoardState

const newGameBoardReducer: BoardReducer<NewGameBoardState, NewGameActions, NewGameStates> = function (state, action) {
    switch (action.type) {
        case "message":
            return [messageReducer(state, action), action];
        case 'enter_game':
            if (state.players.indexOf(action.player) >= 0) {
                throw errorActionAlreadyHappened(action, state.players);
            } else if (state.players.length > 5) {
                throw errorTooManyPlayers(action.player, state.players);
            } else {
                return [{
                    ...state,
                    events: [...state.events, action],
                    players: [...state.players, action.player]
                }, action];
            }
        case 'mark_player_ready':
            if (state.ready.indexOf(action.player) >= 0) {
                throw errorActionAlreadyHappened(action, state.ready)
            } else if (state.players.indexOf(action.player) < 0) {
                throw errorPlayerNotInGame(action.player, state.players);
            } else if (state.ready.length + 1 != state.players.length || state.players.length < 3) {
                return [{
                    ...state,
                    events: [...state.events, action],
                    ready: [...state.ready, action.player]
                }, action];
            } else {
                const {dog, hands} = dealCards(state.players);
                const time = new Date();
                return [{
                    name: 'bidding',
                    events: [...state.events, action],
                    players: state.players,
                    hands,
                    dog,
                    bidding: {
                        bids: [],
                        bidders: state.players,
                    },
                    shows: [],
                },
                action,
                    ...Array.from(hands.entries()).map(([player, hand]): GameStartTransition => ({
                        type: 'game_start',
                        private_to: player,
                        time,
                        hand,
                    }))
                ]
            }
    }
};

interface BiddingBoardState extends BoardState {
    readonly name: 'bidding'

    readonly hands: Map<Player, Card[]>
    readonly dog: Card[]

    readonly bidding: CurrentBids
    readonly shows: ShowTrumpState[]
}
type BiddingStateActions = BidAction | MakeCallAction | ShowTrumpAction | AckTrumpShowAction | MessageAction
type BiddingStates = PartnerCallBoardState | DogRevealBoardState | PlayingBoardState

const biddingBoardReducer: BoardReducer<BiddingStates, BiddingStateActions, BiddingStates> = function(state, action) {
    switch (action.type) {
        case "message":
            return [messageReducer(state, action), action];
        case "bid":
            break;
        case "make_call":
            break;
        case "show_trump":
            break;
        case "ack_trump_show":
            break;
    }
};

/**
 * Transitions:
 *  - {@link DogRevealState}
 *  - {@link PlayingBoardState}
 */
interface PartnerCallBoardState extends BoardState {
    readonly name: 'partner_call'

    readonly bidder: Player

    readonly hands: Map<Player, Card[]>
    readonly dog: Card[]

    readonly bidding: CompletedBids
    readonly shows: ShowTrumpState[]
}
type PartnerCallStateActions = CallPartnerAction | MakeCallAction | ShowTrumpAction | AckTrumpShowAction | MessageAction

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
    readonly playersUnacked: Player[]

    readonly bidding: CompletedBids
    readonly shows: ShowTrumpState[]
}
type DogRevealStateActions = AckDogAction | MakeCallAction | ShowTrumpAction | AckTrumpShowAction | TakeDogAction | MessageAction

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
    readonly shows: ShowTrumpState[]
}
/** {@link TakeDogAction}, {@link AddToDogAction}, and {@link AckDogAction} are for bidder only */
type BidderDogExchangeStateActions = TakeDogAction | AddToDogAction | AckDogAction |
    MakeCallAction | ShowTrumpAction | AckTrumpShowAction | MessageAction

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
    readonly shows: ShowTrumpState[]
    readonly joker_state?: JokerExchangeState

    readonly current_trick: Trick
    readonly current_player: Player
    readonly past_tricks: CompletedTrick[]
}
type PlayingStateActions = PlayCardAction | MakeCallAction | ShowTrumpAction | AckTrumpShowAction | MessageAction

interface CompletedBoardState extends BoardState {
    readonly name: 'completed'

    readonly bidder: Player
    readonly called?: Card
    readonly partner?: Player

    readonly dog: Card[]

    readonly bidding: CompletedBids
    readonly shows: ShowTrumpState[]
    readonly joker_state?: JokerExchangeState

    readonly past_tricks: CompletedTrick[]
    readonly end_state: CompletedGameState
}
type CompletedStateActions = MessageAction




