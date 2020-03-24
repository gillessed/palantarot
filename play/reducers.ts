import {cardsEqual, dealCards, getCardPoint, getCardsAllowedToPlay, getPlayerNum, getTrumps, getWinner} from "./game";
import _ from "lodash";

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
                        shows: {},
                    } as BiddingBoardState,
                    action,
                    ..._.map(hands).map((hand: Card[], player: number) => ({
                        type: 'dealt_hand',
                        private_to: state.players[player],
                        hand,
                    }) as DealtHandTransition)
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

function getAllCalls(players: Player[], bidding: CurrentBids): { [player: number]: Call[] } {
    const calls: { [player: number]: Call[] } = {};
    for (const bid of bidding.bids.values()) {
        const player_num = getPlayerNum(players, bid.player);
        if (!calls[player_num]) {
            calls[player_num] = []
        }
        calls[player_num].push(...bid.calls)
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

function showTrumpActionReducer<T extends DealtBoardState>(state: T, action: ShowTrumpAction): [T, ShowTrumpAction] {
    const player_num = getPlayerNum(state.players, action.player);
    if (state.shows[player_num]) {
        throw errorCannotShowTwice(action.player);
    } else if (!cardsEqual(getTrumps(state.hands[player_num]), action.cards)) {
        throw errorInvalidTrumpShow(action, getTrumps(state.hands[player_num]));
    } else {
        return [
            {
                ...state,
                shows: {
                    ...state.shows,
                    [player_num]: state.players,
                } as ShowTrumpState,
            } as T,
            action,
        ]
    }
}

function ackTrumpShowActionReducer<T extends DealtBoardState>(state: T, action: AckTrumpShowAction)
        : [T, ...(AckTrumpShowAction | EndTrumpShowTransition)[]] {
    const showing_player_num = getPlayerNum(state.players, action.showing_player);
    const current_show = state.shows[showing_player_num];
    if (current_show === undefined) {
        throw errorTrumpNotBeingShown(action.showing_player, Object.keys(state.shows));
    } else {
        const new_show = _.filter(current_show, (player) => !_.isEqual(player, action.player));
        let actions;
        if (new_show.length === 0) {
            actions = [
                action
            ];
        } else {
            actions = [
                action,
                {
                    type: 'end_trump_show',
                    player_showing_trump: action.showing_player
                } as EndTrumpShowTransition
            ];
        }
        return [
            {
                ...state,
                shows: {
                    ...state.shows,
                    [showing_player_num]: new_show,
                }
            },
            ...actions,
        ]
    }
}

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
            return showTrumpActionReducer(state, action);
        case "ack_trump_show":
            return ackTrumpShowActionReducer(state, action);
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
                        } as GameAbortedTransition,
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
                        } as BiddingCompletedTransition,
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
                            } as DogRevealAndExchangeBoardState,
                            action,
                            {
                                type: 'bidding_completed',
                                winning_bid: state.bidding.current_high,
                            } as BiddingCompletedTransition,
                            {
                                type: 'dog_reveal',
                                dog: state.dog,
                            } as DogRevealTransition,
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
                            } as BiddingCompletedTransition,
                            {
                                type: 'game_start',
                                first_player: trickOrder[0],
                            } as GameStartTransition,
                        ]
                    }
                }
            }
    }
};

// Is this generic type declaration the best thing about Typescript, or the BEST thing about Typescript???
// Somebody please get me help...
function declareSlamActionReducer<T extends DealtBoardState & { bidding: CompletedBids }>(state: T, action: DeclareSlam)
        : [T, DeclareSlam] {
    const player_num = getPlayerNum(state.players, action.player);
    return [
        {
            ...state,
            bidding: {
                ...state.bidding,
                calls: {
                    ...state.bidding.calls,
                    [player_num]: [...state.bidding.calls[player_num], Call.DECLARED_SLAM],
                },
            },
        } as T,
        action,
    ];
}

function getNewTrick(players: Player[], first_player: Player, trick_num: number) {
    return {
        trick_num,
        cards: [],
        players: getTrickPlayerOrder(players, first_player),
        current_player: 0,
    };
}

const partnerCallBoardReducer: BoardReducer<PartnerCallBoardState, PartnerCallStateActions, PartnerCallStates> = function(state, action) {
    switch (action.type) {
        case "message":
            return [state, action];
        case "declare_slam":
            return declareSlamActionReducer(state, action);
        case "show_trump":
            return showTrumpActionReducer(state, action);
        case "ack_trump_show":
            return ackTrumpShowActionReducer(state, action);
        case "call_partner":
            if (action.card[0] === TrumpSuit) {
                throw errorCannotCallTrump(action.card);
            }
            let partner = undefined;
            for (const player_num in state.hands) {
                if (state.hands[player_num].indexOf(action.card) > -1) {
                    partner = player_num;
                    break;
                }
            }
            if (state.bidding.winning_bid.bid > BidValue.FORTY) {
                return [
                    {
                        ...state,
                        name: 'playing',
                        called: action.card,
                        partner,

                        current_trick: getNewTrick(state.players, state.bidder, 0),
                        past_tricks: [],
                    } as PlayingBoardState,
                    action,
                    {
                        type: 'game_start',
                        first_player: state.bidder,
                    } as GameStartTransition,
                ]
            } else {
                return [
                    {
                        ...state,
                        name: 'dog_reveal',
                        called: action.card,
                        partner,
                        players_acked: [],
                    } as DogRevealAndExchangeBoardState,
                    action,
                    {
                        type: 'dog_reveal',
                        dog: state.dog,
                    } as DogRevealTransition,
                ]
            }
    }
};

const dogRevealAndExchangeBoardReducer: BoardReducer<DogRevealAndExchangeBoardState, DogRevealStateActions, DogRevealStates> = function(state, action) {
    switch (action.type) {
        case "message":
            return [state, action];
        case "declare_slam":
            return declareSlamActionReducer(state, action);
        case "show_trump":
            return showTrumpActionReducer(state, action);
        case "ack_trump_show":
            return ackTrumpShowActionReducer(state, action);
        case "set_dog":
            if (!_.isEqual(action.player, state.bidder)) {
                throw errorCannotSetDogIfNotBidder(action.player, state.bidder);
            } else if (action.dog.length !== state.dog.length) {
                throw errorNewDogWrongSize(action.dog, state.dog.length);
            } else {
                const player_num = getPlayerNum(state.players, state.bidder);
                const player_hand = state.hands[player_num];
                const cards = [...player_hand, ...state.dog];
                const new_player_hand = _.intersectionWith(cards, player_hand, _.isEqual);
                if (new_player_hand.length !== player_hand.length) {
                    throw errorNewDogDoesntMatchHand(action.dog, cards);
                } else if (state.players_acked.length < state.players.length - 1) {
                    const players_acked = _.union(state.players_acked, [state.bidder]);
                    return [
                        {
                            ...state,
                            dog: action.dog,
                            hands: {
                                ...state.hands,
                                [player_num]: new_player_hand
                            },
                            players_acked,
                        } as DogRevealAndExchangeBoardState,
                        {
                            type: 'ack_dog',
                            player: action.player,
                            time: action.time,
                        } as AckDogAction,
                    ]
                } else {
                    return [
                        {
                            ...state,
                            name: 'playing',
                            dog: action.dog,
                            hands: {
                                ...state.hands,
                                [player_num]: new_player_hand
                            },
                            current_trick: getNewTrick(state.players, state.bidder, 0),
                            past_tricks: [],
                        } as PlayingBoardState,
                        {
                            type: 'ack_dog',
                            player: action.player,
                            time: action.time,
                        } as AckDogAction,
                        {
                            type: 'game_start',
                            first_player: state.bidder,
                        } as GameStartTransition,
                    ]
                }
            }
        case "ack_dog":
            const players_acked = _.union(state.players_acked, [state.bidder]);
            if (players_acked.length < state.players.length) {
                return [
                    {
                        ...state,
                        players_acked,
                    } as DogRevealAndExchangeBoardState,
                    action,
                ]
            } else {
                return [
                    {
                        ...state,
                        name: 'playing',
                        current_trick: getNewTrick(state.players, state.bidder, 0),
                        past_tricks: [],
                    } as PlayingBoardState,
                    action,
                    {
                        type: 'game_start',
                        first_player: state.bidder,
                    } as GameStartTransition,
                ]

            }
    }
};

function isAfterFirstTurn(state: PlayingBoardState, action: Action) {
    return state.past_tricks.length > 0 || state.current_trick.players.slice(state.current_trick.current_player).indexOf(action.player) == -1;
}

function getCardsWon(bidding_team: Player[], tricks: CompletedTrick[], joker_state?: JokerExchangeState): Card[] {
    const cards_won = [];
    const cards_lost = [];
    for (const trick of tricks) {
        if (bidding_team.indexOf(trick.winner) > -1) { // bidding team won
            cards_won.push(...trick.cards);
        } else {
            cards_lost.push(...trick.cards);
        }
    }

    if (joker_state) {
        if ((bidding_team.indexOf(joker_state.player) > -1) !== (bidding_team.indexOf(joker_state.owed_to) > -1)) {
            if (bidding_team.indexOf(joker_state.player) > -1) { // joker played by bidder/partner, need to swap it back
                if (cards_won.length > 0) {
                    cards_lost.push(_.sortBy(cards_won, getCardPoint)[0]);
                    cards_won.push(..._.remove(cards_lost, TheJoker));
                }
            } else { // joker played by team, need to swap it back
                if (cards_lost.length > 0) {
                    cards_won.push(_.sortBy(cards_lost, getCardPoint)[0]);
                    cards_lost.push(..._.remove(cards_won, TheJoker));
                }
            }
        }
    }
    return cards_won
}

function getOutcomes(players: Player[], bidding_team: Player[], tricks: CompletedTrick[])
        : { [player: number]: Outcome[] } {
    const outcomes: { [player: number]: Outcome[] } = {};

    const tricks_won = tricks
        .filter((trick) => bidding_team.indexOf(trick.winner) > -1)
        .length;
    if (tricks_won === tricks.length) {
        for (const player of bidding_team) {
            outcomes[players.indexOf(player)] = [Outcome.SLAMMED]
        }
    } else if (tricks_won === 0) {
        for (const player_num of players.keys()) {
            if (bidding_team.indexOf(players[player_num]) === -1) {
                outcomes[player_num] = [Outcome.SLAMMED]
            }
        }
    }

    if (_.find(tricks[-1].cards, TheOne)) {
        const one_last = players.indexOf(tricks[-1].winner);
        if(outcomes[one_last] === undefined) {
            outcomes[one_last] = []
        }
        outcomes[one_last].push(Outcome.ONE_LAST);
    }

    return outcomes;
}

function getFinalScore(
        players: Player[],
        bidding_team: Player[],
        bid: BidValue,
        cards_won: Card[],
        shows: ShowTrumpState,
        calls: { [player: number]: Call[] },
        outcomes: { [player: number]: Outcome[] })
        : { points_earned: number, bouts: Bout[], bidder_won: boolean, points_result: number} {
    const bouts = _.filter(cards_won, (card): card is Bout =>
        card[1] === TrumpValue.Joker || card[1] === TrumpValue._1 || card[1] === TrumpValue._21);
    const points_earned = cards_won.map(getCardPoint).reduce((a, b) => a + b, 0);
    const needed_to_win = [56, 51, 41, 36][bouts.length];
    const bidder_won = points_earned >= needed_to_win;

    let points_result = bid;
    points_result += Math.ceil(Math.abs(points_earned - needed_to_win) / 10) * 10;
    for (const player_num in shows) {
        points_result += 10;
    }
    points_result *= bidder_won ? 1 : -1;

    for (const player_num in calls) {
        if (calls[player_num].indexOf(Call.DECLARED_SLAM) > -1) {
            let points = 200;
            points *= outcomes[player_num].indexOf(Outcome.SLAMMED) > -1 ? 1 : -1;
            points *= bidding_team.indexOf(players[player_num]) > -1 ? 1 : -1;
            points_result += points;
        }
    }

    for (const player_num in outcomes) {
        if (outcomes[player_num].indexOf(Outcome.SLAMMED) > -1) {
            points_result += bidding_team.indexOf(players[player_num]) > -1 ? 200 : -200;
            break;
        }
    }

    for (const player_num in outcomes) {
        if (outcomes[player_num].indexOf(Outcome.ONE_LAST) > -1) {
            points_result += bidding_team.indexOf(players[player_num]) > -1 ? 10 : -10;
            break;
        }
    }

    return {
        points_earned,
        bouts,
        bidder_won,
        points_result,
    }
}


const playingBoardReducer: BoardReducer<PlayingBoardState, PlayingStateActions, PlayingStates> = function(state, action) {
    switch (action.type) {
        case "message":
            return [state, action];
        case "declare_slam":
            if (isAfterFirstTurn(state, action)) {
                throw errorAfterFirstTurn(action);
            } else {
                return declareSlamActionReducer(state, action);
            }
        case "show_trump":
            if (isAfterFirstTurn(state, action)) {
                throw errorAfterFirstTurn(action);
            } else {
                return showTrumpActionReducer(state, action);
            }
        case "ack_trump_show":
            if (isAfterFirstTurn(state, action)) {
                throw errorAfterFirstTurn(action);
            } else {
                return ackTrumpShowActionReducer(state, action);
            }
        case "play_card":
            const player_num = getPlayerNum(state.players, action.player);
            if (state.current_trick.players[state.current_trick.current_player] !== action.player) {
                throw errorPlayingOutOfTurn(action.player, state.current_trick.players[state.current_trick.current_player]);
            } else if (!_.find(state.hands[player_num], action.card)) {
                throw errorCardNotInHand(action, state.hands[player_num]);
            } else if (!_.find(getCardsAllowedToPlay(state.hands[player_num], state.current_trick.cards), action.card)) {
                throw errorCannotPlayCard(
                    action.card,
                    state.current_trick.cards,
                    getCardsAllowedToPlay(state.hands[player_num], state.current_trick.cards));
            }
            const hands = {
                ...state.hands,
                [player_num]: _.filter(state.hands[player_num], (card) => !_.isEqual(card, action.card)),
            };
            if (state.current_trick.current_player < state.current_trick.players.length - 1) {
                return [
                    {
                        ...state,
                        hands,
                        current_trick: {
                            ...state.current_trick,
                            cards: [...state.current_trick.cards, action.card],
                            current_player: state.current_trick.current_player + 1,
                        },
                    } as PlayingBoardState,
                    action,
                ]
            } else { // last card in trick
                const [winning_card, winner] = getWinner(state.current_trick.cards, state.players);
                const completed_trick = {
                    trick_num: state.current_trick.trick_num,
                    cards: [...state.current_trick.cards, action.card],
                    players: state.current_trick.players,
                    winner,
                };
                let joker_state = state.joker_state;
                if (_.find(completed_trick.cards, TheJoker) && hands[0].length > 0) { // joker is not kept on last trick
                    joker_state = {
                        player: completed_trick.players[_.findIndex(completed_trick.cards, TheJoker)],
                        owed_to: winner,
                    };
                }
                if (hands[0].length > 0) {
                   return [
                       {
                           ...state,
                           hands,
                           joker_state,
                           current_trick: getNewTrick(state.players, winner, completed_trick.trick_num + 1),
                           past_tricks: [...state.past_tricks, completed_trick],
                       } as PlayingBoardState,
                       action,
                       {
                           type: 'completed_trick',
                           winner,
                           winning_card,
                           joker_state,
                       } as CompletedTrickTransition,
                   ]
                } else {
                    const tricks = [...state.past_tricks, completed_trick];
                    const bidding_team = _.compact([state.bidder, state.partner]);
                    const cards_won = getCardsWon(bidding_team, tricks, state.joker_state);
                    const outcomes = getOutcomes(state.players, bidding_team, tricks);
                    const final_score = getFinalScore(state.players, bidding_team, state.bidding.winning_bid.bid,
                        cards_won, state.shows, state.bidding.calls, outcomes);
                    const end_state = {
                        bidder: state.bidder,
                        bid: state.bidding.winning_bid.bid,
                        partner: state.partner,
                        dog: state.dog,

                        calls: state.bidding.calls,
                        outcomes,
                        ...final_score
                    } as CompletedGameState;
                    return [
                        {
                            ...state,
                            name: 'completed',
                            hands: undefined,
                            joker_state,
                            current_trick: undefined,
                            past_tricks: tricks,

                            end_state,
                        } as CompletedBoardState,
                        action,
                        {
                            type: 'completed_trick',
                            winner,
                            winning_card,
                            joker_state,
                        } as CompletedTrickTransition,
                        {
                            type: 'game_completed',
                            end_state,
                        } as GameCompletedTransition,
                    ]
                }
            }
    }
};
