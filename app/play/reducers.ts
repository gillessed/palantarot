import _ from "lodash";
import { cardsContain, cardsEqual, cardsWithout, dealCards, getCardPoint, getCardsAllowedToPlay, getPlayerNum, getTrumps, getWinner } from './cardUtils';
import { Action, Bid, BidAction, BiddingCompletedTransition, BidValue, Bout, Call, Card, CompletedBids, CompletedGameState, CompletedTrick, CompletedTrickTransition, CurrentBids, DealtHandTransition, DeclareSlam, DogRevealTransition, DummyPlayer, errorActionAlreadyHappened, errorAfterFirstTurn, errorBiddingOutOfTurn, errorBidTooLow, errorCannotCallPartnerIfNotBidder, errorCannotCallTrump, errorCannotLeadCalledSuit, errorCannotPlayCard, errorCannotSetDogIfNotBidder, errorCannotShowTwice, errorCanOnlyCallRussianOnTwenties, errorCardNotInHand, errorInvalidActionForGameState, errorInvalidTrumpShow, errorNewDogDoesntMatchHand, errorNewDogWrongSize, errorNotEnoughTrump, errorOnlyBidderCanDeclareSlam, errorPlayerMarkedReady, errorPlayerNotInGame, errorPlayerNotReady, errorPlayingOutOfTurn, errorSetDogActionShouldBePrivate, errorTooManyPlayers, GameAbortedTransition, GameCompletedTransition, GameStartTransition, JokerExchangeState, Outcome, PlayerId, PlayersSetTransition, ShowTrumpAction, ShowTrumpState, TheJoker, TheOne, TrumpSuit, TrumpValue } from "./common";
import { BiddingBoardState, BiddingStateActions, BiddingStates, BoardReducer, CompletedBoardState, CompletedStateActions, DealtBoardState, DogRevealAndExchangeBoardState, DogRevealStateActions, DogRevealStates, GameplayState, NewGameActions, NewGameBoardState, NewGameStates, PartnerCallBoardState, PartnerCallStateActions, PartnerCallStates, PlayingBoardState, PlayingStateActions, PlayingStates } from "./state";

export const newGameBoardReducer: BoardReducer<NewGameBoardState, NewGameActions, NewGameStates> = function (state, action) {
  switch (action.type) {
    case "game_settings":
      return [state, action];
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
    case 'leave_game':
      if (state.players.indexOf(action.player) < 0) {
        throw errorPlayerNotInGame(action.player, state.players);
      } else if (state.ready.indexOf(action.player) >= 0) {
        throw errorPlayerMarkedReady(action.player);
      } else {
        return [
          {
            ...state,
            players: _.without(state.players, action.player),
          } as NewGameBoardState,
          action,
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
          action,
        ]
      } else {
        const { dog, hands } = dealCards(state.players.length);
        const playerOrder = _.shuffle(state.players);

        // For debugging shows - give player Greg Cole a hand that can show.
        // const { dog, hands } = SampleDeal;
        // const playerOrder = _.shuffle(_.without(state.players, "Greg Cole"));
        // playerOrder.push("Greg Cole");

        const bidState: BiddingBoardState = {
          name: GameplayState.Bidding,
          players: playerOrder,
          hands,
          dog,
          bidding: {
            bids: [],
            bidders: playerOrder,
            current_high: {
              player: DummyPlayer,
              bid: BidValue.PASS,
              calls: []
            },
          },
          shows: [],
        }

        return [
          bidState,
          action,
          {
            type: 'players_set',
            playerOrder,
          } as PlayersSetTransition,
          ..._.map(hands).map((hand: Card[], player: number) => ({
            type: 'dealt_hand',
            privateTo: playerOrder[player],
            hand,
          }) as DealtHandTransition)
        ]
      }
    case 'unmark_player_ready':
      if (state.players.indexOf(action.player) < 0) {
        throw errorPlayerNotInGame(action.player, state.players);
      } else if (state.ready.indexOf(action.player) < 0) {
        throw errorPlayerNotReady(action.player, state.ready);
      } else {
        return [
          {
            ...state,
            ready: _.without(state.ready, action.player),
          } as NewGameBoardState,
          action,
        ]
      }
    default:
      throw errorInvalidActionForGameState(action, state.name);
  }
};

function getTrickPlayerOrder(players: PlayerId[], firstPlayer: PlayerId) {
  const trickOrder = [...players];
  while (trickOrder[0] !== firstPlayer) {
    trickOrder.push(trickOrder.shift() as PlayerId)
  }
  return trickOrder;
}

function getAllCalls(players: PlayerId[], bidding: CurrentBids): { [player: number]: Call[] } {
  const calls: { [player: number]: Call[] } = {};
  for (const bid of bidding.bids) {
    const player_num = getPlayerNum(players, bid.player);
    if (!calls[player_num]) {
      calls[player_num] = []
    }
    calls[player_num].push(...bid.calls)
  }
  return calls;
}

const updateBids = function (state: CurrentBids, bid_action: BidAction): CurrentBids {
  const bid = {
    ...bid_action,
    calls: bid_action.calls || []
  } as Bid;
  if (state.bidders[0] !== bid.player) {
    throw errorBiddingOutOfTurn(bid.player, state.bidders[0])
  } else if (bid.calls.indexOf(Call.RUSSIAN) !== -1 && bid.bid !== BidValue.TWENTY) {
    throw errorCanOnlyCallRussianOnTwenties(bid);
  } else if (bid.bid === BidValue.PASS || bid.bid === undefined) {
    const bidders = state.bidders.slice(1);
    if (bidders.length == 1 && state.current_high.player === bidders[0]) {
      bidders.pop(); // all pass, only most recent bidder left -> bidding done.
    }
    return {
      bids: [...state.bids, bid],
      bidders,
      current_high: state.current_high,
    }
  } else if (state.current_high.bid >= bid.bid) {
    throw errorBidTooLow(bid.bid, state.current_high.bid);
  } else { // new bid is high
    const bidders = [...state.bidders];
    bidders.push(bidders.shift() as PlayerId);
    if (bidders.length == 1) {
      bidders.pop(); // all pass, only most recent bidder left -> bidding done.
    }
    return {
      bids: [...state.bids, bid],
      bidders,
      current_high: bid,
    }
  }
};

function showTrumpActionReducer<T extends DealtBoardState>(state: T, action: ShowTrumpAction): [T, ShowTrumpAction] {
  const player_num = getPlayerNum(state.players, action.player);
  if (state.shows.indexOf(action.player) >= 0) {
    throw errorCannotShowTwice(action.player);
  } else if (!cardsEqual(getTrumps(state.hands[player_num]), action.cards)) {
    throw errorInvalidTrumpShow(action, getTrumps(state.hands[player_num]));
  } else if (state.players.length === 5 && action.cards.length < 8) {
    throw errorNotEnoughTrump(action.cards.length, 8);
  } else if (state.players.length < 5 && action.cards.length < 10) {
    throw errorNotEnoughTrump(action.cards.length, 10);
  } else {
    return [
      {
        ...state,
        shows: [...state.shows, action.player],
      } as T,
      action,
    ]
  }
}

export const biddingBoardReducer: BoardReducer<BiddingBoardState, BiddingStateActions, BiddingStates> = function (state, action) {
  switch (action.type) {
    case "message":
      return [state, action];
    case "show_trump":
      return showTrumpActionReducer(state, action);
    case "bid":
      const new_bid_state = updateBids(state.bidding, action);
      if (new_bid_state.bidders.length > 0 && action.bid !== BidValue.ONESIXTY) {
        return [
          {
            ...state,
            bidding: new_bid_state,
          } as BiddingBoardState,
          action
        ]
      } else { // last bid
        if (new_bid_state.current_high.bid === BidValue.PASS) { // all passes
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
              ...state,
              name: 'partner_call',
              bidder: new_bid_state.current_high.player,
              allBids: new_bid_state.bids,
              bidding: {
                winningBid: new_bid_state.current_high,
                calls: getAllCalls(state.players, new_bid_state),
              },
            } as PartnerCallBoardState,
            action,
            {
              type: 'bidding_completed',
              winning_bid: new_bid_state.current_high,
            } as BiddingCompletedTransition,
          ]
        } else { // 3 or 4 players
          if (new_bid_state.current_high.bid <= BidValue.FORTY) {
            return [
              {
                ...state,
                name: 'dog_reveal',
                bidder: new_bid_state.current_high.player,
                allBids: new_bid_state.bids,
                bidding: {
                  allBids: new_bid_state.bids,
                  winningBid: new_bid_state.current_high,
                  calls: getAllCalls(state.players, new_bid_state),
                },
              } as DogRevealAndExchangeBoardState,
              action,
              {
                type: 'bidding_completed',
                winning_bid: new_bid_state.current_high,
              } as BiddingCompletedTransition,
              {
                type: 'dog_revealed',
                dog: state.dog,
                player: new_bid_state.current_high.player,
              } as DogRevealTransition,
            ]
          } else { // 80 or 160 bid
            const bidder = new_bid_state.current_high.player;
            return [
              {
                ...state,
                name: 'playing',
                bidder,
                allBids: new_bid_state.bids,
                bidding: {
                  allBids: state.bidding.bids,
                  winningBid: new_bid_state.current_high,
                  calls: getAllCalls(state.players, new_bid_state),
                },
                current_trick: getNewTrick(state.players, state.players[0], 0),
                past_tricks: [],
              } as PlayingBoardState,
              action,
              {
                type: 'bidding_completed',
                winning_bid: new_bid_state.current_high,
              } as BiddingCompletedTransition,
              {
                type: 'game_started',
                first_player: state.players[0],
              } as GameStartTransition,
            ]
          }
        }
      }
    default:
      throw errorInvalidActionForGameState(action, state.name);
  }
};

function declareSlamActionReducer<T extends DealtBoardState & { bidder: PlayerId, bidding: CompletedBids }>(state: T, action: DeclareSlam)
  : [T, DeclareSlam] {
  const player_num = getPlayerNum(state.players, action.player);
  if (action.player != state.bidder) {
    throw errorOnlyBidderCanDeclareSlam(action.player, state.bidder);
  }
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

function getNewTrick(players: PlayerId[], first_player: PlayerId, trick_num: number) {
  return {
    trick_num,
    cards: [],
    players: getTrickPlayerOrder(players, first_player),
    current_player: 0,
  };
}

export const partnerCallBoardReducer: BoardReducer<PartnerCallBoardState, PartnerCallStateActions, PartnerCallStates> = function (state, action) {
  switch (action.type) {
    case "message":
      return [state, action];
    case "declare_slam":
      return declareSlamActionReducer(state, action);
    case "show_trump":
      return showTrumpActionReducer(state, action);
    case "call_partner":
      if (action.player !== state.bidder) {
        throw errorCannotCallPartnerIfNotBidder(action.player, state.bidder);
      } else if (action.card[0] === TrumpSuit) {
        throw errorCannotCallTrump(action.card);
      }
      let partner = undefined;
      for (const player_num in state.hands) {
        if (cardsContain(state.hands[player_num], action.card)) {
          partner = state.players[player_num];
          break;
        }
      }
      if (state.bidding.winningBid.bid > BidValue.FORTY) {
        return [
          {
            ...state,
            name: 'playing',
            called: action.card,
            partner,

            current_trick: getNewTrick(state.players, state.players[0], 0),
            past_tricks: [],
          } as PlayingBoardState,
          action,
          {
            type: 'game_started',
            first_player: state.players[0],
          } as GameStartTransition,
        ]
      } else {
        return [
          {
            ...state,
            name: 'dog_reveal',
            called: action.card,
            partner,
          } as DogRevealAndExchangeBoardState,
          action,
          {
            type: 'dog_revealed',
            dog: state.dog,
            player: state.bidder,
          } as DogRevealTransition,
        ]
      }
    default:
      throw errorInvalidActionForGameState(action, state.name);
  }
};

export const dogRevealAndExchangeBoardReducer: BoardReducer<DogRevealAndExchangeBoardState, DogRevealStateActions, DogRevealStates> = function (state, action) {
  switch (action.type) {
    case "message":
      return [state, action];
    case "declare_slam":
      return declareSlamActionReducer(state, action);
    case "show_trump":
      return showTrumpActionReducer(state, action);
    case "set_dog":
      if (action.player !== state.bidder) {
        throw errorCannotSetDogIfNotBidder(action.player, state.bidder);
      } else if (!_.isEqual(action.player, action.privateTo)) {
        throw errorSetDogActionShouldBePrivate(action);
      } else if (action.dog.length !== state.dog.length) {
        throw errorNewDogWrongSize(action.dog, state.dog.length);
      } else {
        const player_num = getPlayerNum(state.players, state.bidder);
        const player_hand = state.hands[player_num];
        const cards = [...player_hand, ...state.dog];
        const new_player_hand = cardsWithout(cards, ...action.dog);
        if (new_player_hand.length !== player_hand.length) {
          throw errorNewDogDoesntMatchHand(action.dog, cards);
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
              current_trick: getNewTrick(state.players, state.players[0], 0),
              past_tricks: [],
            } as PlayingBoardState,
            action,
            {
              type: 'game_started',
              first_player: state.players[0],
            } as GameStartTransition,
          ]
        }
      }
    default:
      throw errorInvalidActionForGameState(action, state.name);
  }
};

function isAfterFirstTurn(state: PlayingBoardState, action: Action) {
  return state.past_tricks.length > 0 || state.current_trick.players.slice(state.current_trick.current_player).indexOf(action.player) == -1;
}

function getCardsWon(bidding_team: PlayerId[], tricks: CompletedTrick[], joker_state?: JokerExchangeState): Card[] {
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
          cards_won.push(..._.remove(cards_lost, (card) => _.isEqual(card, TheJoker)));
        }
      } else { // joker played by team, need to swap it back
        if (cards_lost.length > 0) {
          cards_won.push(_.sortBy(cards_lost, getCardPoint)[0]);
          cards_lost.push(..._.remove(cards_won, (card) => _.isEqual(card, TheJoker)));
        }
      }
    }
  }
  return cards_won
}

function getOutcomes(players: PlayerId[], bidding_team: PlayerId[], tricks: CompletedTrick[])
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

  if (cardsContain(tricks[tricks.length - 1].cards, TheOne)) {
    const one_last = players.indexOf(tricks[tricks.length - 1].winner);
    if (outcomes[one_last] === undefined) {
      outcomes[one_last] = []
    }
    outcomes[one_last].push(Outcome.ONE_LAST);
  }

  return outcomes;
}

function getFinalScore(
  players: PlayerId[],
  bidding_team: PlayerId[],
  bid: BidValue,
  cards_won: Card[],
  dog: Card[],
  shows: ShowTrumpState,
  calls: { [player: number]: Call[] },
  outcomes: { [player: number]: Outcome[] })
  : { pointsEarned: number, bouts: Bout[], bidderWon: boolean, pointsResult: number } {
  const bouts = _.filter(cards_won, (card): card is Bout =>
    card[0] === TrumpSuit && (
      card[1] === TrumpValue.Joker || card[1] === TrumpValue._1 || card[1] === TrumpValue._21));
  const trickPoints = cards_won.map(getCardPoint).reduce((a, b) => a + b, 0);
  const dogPoints = dog.map(getCardPoint).reduce((a, b) => a + b, 0);
  const pointsEarned = trickPoints + (dogPoints * (bid !== BidValue.ONESIXTY ? 1 : 0));
  const neededToWin = [56, 51, 41, 36][bouts.length];
  const bidderWon = pointsEarned >= neededToWin;

  let pointsResult = bid;
  pointsResult += Math.ceil(Math.abs(pointsEarned - neededToWin) / 10) * 10;
  for (const player of shows) {
    pointsResult += 10;
  }
  pointsResult *= bidderWon ? 1 : -1;

  for (const playerNum in calls) {
    if (calls[playerNum].indexOf(Call.DECLARED_SLAM) > -1) {
      let points = 200;
      points *= outcomes[playerNum].indexOf(Outcome.SLAMMED) > -1 ? 1 : -1;
      points *= bidding_team.indexOf(players[playerNum]) > -1 ? 1 : -1;
      pointsResult += points;
    }
  }

  for (const playerNum in outcomes) {
    if (outcomes[playerNum].indexOf(Outcome.SLAMMED) > -1) {
      pointsResult += bidding_team.indexOf(players[playerNum]) > -1 ? 200 : -200;
      break;
    }
  }

  for (const playerNum in outcomes) {
    if (outcomes[playerNum].indexOf(Outcome.ONE_LAST) > -1) {
      pointsResult += bidding_team.indexOf(players[playerNum]) > -1 ? 10 : -10;
      break;
    }
  }

  return {
    pointsEarned,
    bouts,
    bidderWon: bidderWon,
    pointsResult,
  }
}

export const playingBoardReducer: BoardReducer<PlayingBoardState, PlayingStateActions, PlayingStates> = function (state, action) {
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
    case "play_card":
      const player_num = getPlayerNum(state.players, action.player);
      const anyPlayerPlayedCard = !(state.current_trick.trick_num === 0 && state.current_trick.cards.length === 0);
      const allowedCards = getCardsAllowedToPlay(state.hands[player_num], state.current_trick.cards, anyPlayerPlayedCard, state.called);
      if (state.current_trick.players[state.current_trick.current_player] !== action.player) {
        throw errorPlayingOutOfTurn(action.player, state.current_trick.players[state.current_trick.current_player]);
      } else if (!cardsContain(state.hands[player_num], action.card)) {
        throw errorCardNotInHand(action, state.hands[player_num]);
      } else if (!cardsContain(allowedCards, action.card)) {
        throw errorCannotPlayCard(
          action.card,
          state.current_trick.cards,
          allowedCards);
      } else if (!isAfterFirstTurn(state, action) && player_num === 0 && state.called
        && action.card[0] === state.called[0] && action.card[1] !== state.called[1]) {
        throw errorCannotLeadCalledSuit(action.card, state.called);
      }
      const hands = {
        ...state.hands,
        [player_num]: cardsWithout(state.hands[player_num], action.card),
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
        const new_cards = [...state.current_trick.cards, action.card];
        const [winning_card, winner] = getWinner(new_cards, state.current_trick.players);
        const completed_trick = {
          trick_num: state.current_trick.trick_num,
          cards: new_cards,
          players: state.current_trick.players,
          winner,
        };
        let joker_state;
        if (cardsContain(completed_trick.cards, TheJoker) && hands[0].length > 0) { // joker is not kept on last trick
          joker_state = {
            player: completed_trick.players[_.findIndex(completed_trick.cards, (card) => _.isEqual(card, TheJoker))],
            owed_to: winner,
          };
        }
        if (hands[0].length > 0) { // next trick!
          return [
            {
              ...state,
              hands,
              joker_state: state.joker_state || joker_state,
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
        } else { // end of game!
          const tricks = [...state.past_tricks, completed_trick];
          const bidding_team = _.compact([state.bidder, state.partner]);
          const cards_won = getCardsWon(bidding_team, tricks, state.joker_state);
          const outcomes = getOutcomes(state.players, bidding_team, tricks);
          const final_score = getFinalScore(state.players, bidding_team, state.bidding.winningBid.bid,
            cards_won, state.dog, state.shows, state.bidding.calls, outcomes);
          const end_state = {
            players: state.players,
            bidder: state.bidder,
            bid: state.bidding.winningBid.bid,
            partner: state.partner,
            dog: state.dog,

            calls: state.bidding.calls,
            shows: state.shows,
            outcomes,
            ...final_score
          } as CompletedGameState;
          return [
            {
              ...state,
              name: 'completed',
              hands: undefined,
              joker_state: state.joker_state || joker_state,
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
    default:
      throw errorInvalidActionForGameState(action, state.name);
  }
};

export const completedBoardReducer: BoardReducer<CompletedBoardState, CompletedStateActions, CompletedBoardState> = function (state, action) {
  if (action.type === "message") {
    return [state, action];
  } else {
    throw errorInvalidActionForGameState(action, state.name);
  }
};
