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

const newGameBoardReducer: BoardReducer<NewGameBoardState, NewGameActions, NewGameStates> = function (state, action) {
    switch (action.type) {
        case "message":
            return [state, action];
        case 'enter_game':
            if (state.players.indexOf(action.player) >= 0) {
                throw errorActionAlreadyHappened(action, state.players);
            } else if (state.players.length > 5) {
                throw errorTooManyPlayers(action.player, state.players);
            } else {
                return [
                    {
                        ...state,
                        players: [...state.players, action.player]
                    } as NewGameBoardState,
                    action
                ]
            }
        case 'mark_player_ready':
            if (state.ready.indexOf(action.player) >= 0) {
                throw errorActionAlreadyHappened(action, state.ready)
            } else if (state.players.indexOf(action.player) < 0) {
                throw errorPlayerNotInGame(action.player, state.players);
            } else if (state.ready.length + 1 != state.players.length || state.players.length < 3) {
                return [
                    {
                        ...state,
                        ready: [...state.ready, action.player]
                    } as NewGameBoardState,
                    action
                ]
            } else {
                const {dog, hands} = dealCards(state.players);
                const time = new Date();
                return [
                    {
                        name: 'bidding',
                        players: state.players,
                        hands,
                        dog,
                        bidding: {
                            bids: [],
                            bidders: state.players,
                            current_high: {
                                player: DummyPlayer,
                                bid: BidValue.PASS,
                                calls: []
                            },
                        },
                        shows: [],
                    } as BiddingBoardState,
                    action,
                    ...Array.from(hands.entries()).map(([player, hand]): DealtHandTransition => ({
                        type: 'dealt_hand',
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
type BiddingStates = PartnerCallBoardState | DogRevealBoardState | PlayingBoardState | NewGameBoardState

function getTrickPlayerOrder(players: Player[], firstPlayer: Player) {
    const trickOrder = [...players];
    while (players[0] !== firstPlayer) {
        trickOrder.push(trickOrder.shift() as Player)
    }
    return trickOrder;
}

function getAllCalls(players: Player[], bidding: CurrentBids) {
    const calls = new Map<Player, Call[]>(players.map((player) => [player, []]));
    for (const bid of bidding.bids.values()) {
        (calls.get(bid.player) as Call[]).push(...bid.calls)
    }
    return calls;
}

const biddingBoardReducer: BoardReducer<BiddingBoardState, BiddingStateActions, BiddingStates> = function(state, action) {
    switch (action.type) {
        case "message":
            return [state, action];
        case "make_call":
            break;
        case "show_trump":
            break;
        case "ack_trump_show":
            break;
        case "bid":
            if (state.bidding.bidders[0] !== action.player) {
                throw errorBiddingOutOfTurn(action.player, state.bidding.bidders[0])
            } else if (action.bid != BidValue.PASS && state.bidding.current_high.bid >= action.bid) {
                throw errorBidTooLow(action.bid, state.bidding.current_high.bid);
            } else if (state.bidding.bidders.length > 1) {
                // TODO update bids
                return [state, action]
            } else { // last bid
                // TODO update bids
                if (state.bidding.current_high.bid == BidValue.PASS) { // all passes
                    return [
                        {
                            name: 'new_game',
                            players: state.players,
                            ready: [],
                            events: [],
                        } as NewGameBoardState,
                        action,
                        {
                            type: 'game_aborted',
                            reason: 'Everybody passed!',
                        }
                    ]
                } else if (state.players.length === 5) {
                    return [
                        {
                            name: 'partner_call',
                            players: state.players,
                            bidder: state.bidding.current_high.player,
                            hands: state.hands,
                            dog: state.dog,
                            bidding: {
                                winning_bid: state.bidding.current_high,
                                calls: getAllCalls(state.players, state.bidding),
                            },
                            shows: state.shows,
                        } as PartnerCallBoardState,
                        action,
                        {
                            type: 'bidding_completed',
                            winning_bid: state.bidding.current_high,
                        }
                    ]
                } else { // 3 or 4 players
                    if (state.bidding.current_high.bid <= BidValue.FORTY) {
                        return [
                            {
                                name: 'dog_reveal',
                                players: state.players,

                                bidder: state.bidding.current_high.player,
                                hands: state.hands,
                                dog: state.dog,
                                players_acked: [],

                                bidding: {
                                    winning_bid: state.bidding.current_high,
                                    calls: getAllCalls(state.players, state.bidding),
                                },
                                shows: state.shows,
                            } as DogRevealBoardState,
                            action,
                            {
                                type: 'bidding_completed',
                                winning_bid: state.bidding.current_high,
                            },
                            {
                                type: 'dog_reveal',
                                dog: state.dog,
                            },
                        ]
                    } else { // 80 or 160 bid
                        const trickOrder = getTrickPlayerOrder(state.players, state.bidding.current_high.player);
                        return [
                            {
                                name: 'playing',
                                players: state.players,

                                bidder: state.bidding.current_high.player,
                                hands: state.hands,
                                dog: state.dog,

                                bidding: {
                                    winning_bid: state.bidding.current_high,
                                    calls: getAllCalls(state.players, state.bidding),
                                },
                                shows: state.shows,

                                current_trick: {
                                    trick_num: 1,
                                    cards: [],
                                    players: trickOrder,
                                    current_player: 0,
                                },
                                past_tricks: [],
                            } as PlayingBoardState,
                            action,
                            {
                                type: 'bidding_completed',
                                winning_bid: state.bidding.current_high,
                            },
                            {
                                type: 'game_start',
                                first_player: trickOrder[0],
                            },
                        ]

                    }
                }
            }
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
    readonly players_acked: Player[]

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




