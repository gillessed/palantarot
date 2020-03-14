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
            } else if (state.ready.length + 1 !== state.players.length || state.players.length < 3) {
                return [
                    {
                        ...state,
                        ready: [...state.ready, action.player]
                    } as NewGameBoardState,
                    action
                ]
            } else {
                const {dog, hands} = dealCards(state.players);
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
                        shows: new Map<Player, Set<Player>>(),
                    } as BiddingBoardState,
                    action,
                    ...Array.from(hands.entries()).map(([player, hand]): DealtHandTransition => ({
                        type: 'dealt_hand',
                        private_to: player,
                        hand,
                    }))
                ]
            }
    }
};

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

const updateBids = function(state: CurrentBids, bid: BidAction): CurrentBids {
    if (state.bidders[0] !== bid.player) {
        throw errorBiddingOutOfTurn(bid.player, state.bidders[0])
    } else if (bid.bid == BidValue.PASS) {
        return {
            bids: [...state.bids, bid],
            bidders: state.bidders.slice(1),
            current_high: state.current_high,
        }
    } else if (state.current_high.bid >= bid.bid) {
        throw errorBidTooLow(bid.bid, state.current_high.bid);
    } else { // new bid is high
        const bidders = [...state.bidders];
        bidders.push(bidders.shift() as Player);
        return {
            bids: [...state.bids, bid],
            bidders,
            current_high: bid,
        }
    }
};

const biddingBoardReducer: BoardReducer<BiddingBoardState, BiddingStateActions, BiddingStates> = function(state, action) {
    switch (action.type) {
        case "message":
            return [state, action];
        case "declare_slam":
            return [
                {
                    ...state,
                    bidding: {
                        ...state.bidding,
                        bids: [
                            ...state.bidding.bids,
                            {
                                player: action.player,
                                bid: BidValue.PASS,
                                calls: [Call.DECLARED_SLAM],
                            },
                        ],
                    },
                },
                action,
            ];
        case "show_trump":
            if (state.shows.has(action.player)) {
                throw errorCannotShowTwice(action.player);
            } else if (!cardsEqual(getTrumps(state.hands.get(action.player)), action.cards)) {
                throw errorInvalidTrumpShow(action, getTrumps(state.hands.get(action.player)));
            } else {
                const shows = new Map<Player, Set<Player>>(state.shows);
                shows.set(action.player, new Set(state.players));
                return [{...state, shows}, action]
            }
        case "ack_trump_show":
            const current_show = state.shows.get(action.showing_player);
            if (current_show === undefined) {
                throw errorTrumpNotBeingShown(action.showing_player, [...state.shows.keys()]);
            } else if (!current_show.has(action.player)) {
                return [state] // no-op, already acked
            } else {
                const shows = new Map<Player, Set<Player>>(state.shows);
                const new_show = new Set<Player>(current_show);
                new_show.delete(action.player);
                shows.set(action.showing_player, new_show);
                return [{...state, shows}, action]
            }
        case "bid":
            const new_bid_state = updateBids(state.bidding, action);
            if (state.bidding.bidders.length > 0 && action.bid !== BidValue.ONESIXTY) {
                return [
                    {
                        ...state,
                        bidding: new_bid_state,
                    } as BiddingBoardState,
                    action
                ]
            } else { // last bid
                if (state.bidding.current_high.bid === BidValue.PASS) { // all passes
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

const partnerCallBoardReducer: BoardReducer<PartnerCallBoardState, PartnerCallStateActions, PartnerCallStates> = function(state, action) {
    switch (action.type) {
        case "message":
            return [state, action];
        case "declare_slam":
            break;
        case "show_trump":
            break;
        case "ack_trump_show":
            break;
        case "call_partner":
            break;
    }
};