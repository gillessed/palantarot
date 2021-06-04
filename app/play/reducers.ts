import _ from "lodash";
import { cardsContain, cardsEqual, cardsWithout, dealCards, getCardPoint, getCardsAllowedToPlay, getPlayerNum, getTrumps, getWinner } from './cardUtils';
import { Action, Bid, BidAction, BiddingCompletedTransition, BidValue, Bout, Call, Card, CompletedBids, CompletedGameState, CompletedTrick, CompletedTrickTransition, CurrentBids, DealtHandTransition, DeclareSlam, DogRevealTransition, DummyPlayer, errorActionAlreadyHappened, errorAfterFirstTurn, errorBiddingOutOfTurn, errorBidTooLow, errorCannotCallPartnerIfNotBidder, errorCannotCallTrump, errorCannotLeadCalledSuit, errorCannotPlayCard, errorCannotSetDogIfNotBidder, errorCannotShowTwice, errorCanOnlyCallRussianOnTwenties, errorCardNotInHand, errorInvalidActionForGameState, errorInvalidTrumpShow, errorNewDogDoesntMatchHand, errorNewDogWrongSize, errorNotEnoughTrump, errorOnlyBidderCanDeclareSlam, errorPlayerMarkedReady, errorPlayerNotInGame, errorPlayerNotReady, errorPlayingOutOfTurn, errorSetDogActionShouldBePrivate, errorTooManyPlayers, GameAbortedTransition, GameCompletedTransition, GameStartTransition, JokerExchangeState, Outcome, PlayerEvent, PlayerId, PlayersSetTransition, SetDogAction, ShowDogToObservers, ShowTrumpAction, ShowTrumpState, TheJoker, TheOne, TrumpSuit, TrumpValue } from "./common";
import { BiddingBoardState, BiddingStateActions, BiddingStates, BoardReducer, BoardState, CompletedBoardState, CompletedStateActions, DealtBoardState, DogRevealAndExchangeBoardState, DogRevealStateActions, DogRevealStates, GameplayState, NewGameActions, NewGameBoardState, NewGameStates, PartnerCallBoardState, PartnerCallStateActions, PartnerCallStates, PlayingBoardState, PlayingStateActions, PlayingStates, ReducerResult } from "./state";

function simpleResult<RESULT extends BoardState>(state: RESULT, action: PlayerEvent): ReducerResult<RESULT> {
  return { state, events: [action] };
}

export const newGameBoardReducer: BoardReducer<NewGameBoardState, NewGameActions, NewGameStates> = function (state, action): ReducerResult<NewGameStates> {
  switch (action.type) {
    case "game_settings":
      return simpleResult(state, action);
    case "message":
      return simpleResult(state, action);
    case 'enter_game':
      if (state.players.indexOf(action.player) >= 0) {
        throw errorActionAlreadyHappened(action, state.players);
      } else if (state.players.length > 5) {
        throw errorTooManyPlayers(action.player, state.players);
      } else {
        const newState: NewGameBoardState = {
          ...state,
          players: [...state.players, action.player],
        };
        return simpleResult(newState, action);
      }
    case 'leave_game':
      if (state.players.indexOf(action.player) < 0) {
        throw errorPlayerNotInGame(action.player, state.players);
      } else if (state.ready.indexOf(action.player) >= 0) {
        throw errorPlayerMarkedReady(action.player);
      } else {
        const newState: NewGameBoardState = {
          ...state,
          players: _.without(state.players, action.player),
        };
        return simpleResult(newState, action);
      }
    case 'mark_player_ready':
      if (state.ready.indexOf(action.player) >= 0) {
        throw errorActionAlreadyHappened(action, state.ready)
      } else if (state.players.indexOf(action.player) < 0) {
        throw errorPlayerNotInGame(action.player, state.players);
      } else if (state.ready.length + 1 !== state.players.length || state.players.length < 3) {
        const newState: NewGameBoardState = {
          ...state,
          ready: [...state.ready, action.player],
        };
        return simpleResult(newState, action);
      } else {
        const { publicHands } = state;
        const { dog, hands } = dealCards(state.players.length);
        const playerOrder = _.shuffle(state.players);

        // For debugging shows - give player Greg Cole a hand that can show.
        // const { dog, hands } = SampleDeal;
        // const playerOrder = _.shuffle(_.without(state.players, "Greg Cole"));
        // playerOrder.push("Greg Cole");

        const bidState: BiddingBoardState = {
          publicHands: state.publicHands,
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
        };

        const setPlayersTransition: PlayersSetTransition = {
          type: 'players_set',
          playerOrder,
          privateTo: undefined,
        };

        const events: PlayerEvent[] = [
          action,
          setPlayersTransition,
          ..._.map(hands).map((hand: Card[], player: number) => {
            const transition: DealtHandTransition = {
              type: 'dealt_hand',
              hand,
              privateTo: undefined,
              playerId: playerOrder[player],
            };
            if (state.publicHands) {
              const exclude = [...playerOrder];
              exclude.splice(player, 1);
              return { ...transition, exclude: [] };
            } else {
              return {
                ...transition,
                privateTo: playerOrder[player],
              };
            }
          }),
        ];

        if (publicHands) {
          const showDogEvent: ShowDogToObservers = {
            type: 'show_dog_to_observers',
            dog,
            exclude: state.players,
          };
          events.push(showDogEvent);
        }
        return { state: bidState, events };
      }
    case 'unmark_player_ready':
      if (state.players.indexOf(action.player) < 0) {
        throw errorPlayerNotInGame(action.player, state.players);
      } else if (state.ready.indexOf(action.player) < 0) {
        throw errorPlayerNotReady(action.player, state.ready);
      } else {
        const newState: NewGameBoardState = {
          ...state,
          ready: _.without(state.ready, action.player),
        };
        return simpleResult(newState, action);
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

function showTrumpActionReducer<T extends DealtBoardState>(state: T, action: ShowTrumpAction): ReducerResult<T> {
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
    const newState: T = {
      ...state,
      shows: [...state.shows, action.player],
    };
    return simpleResult(newState, action);
  }
}

export const biddingBoardReducer: BoardReducer<BiddingBoardState, BiddingStateActions, BiddingStates> = function (state, action): ReducerResult<BiddingStates> {
  switch (action.type) {
    case "message":
      return simpleResult(state, action);
    case "show_trump":
      return showTrumpActionReducer(state, action);
    case "bid":
      const new_bid_state = updateBids(state.bidding, action);
      if (new_bid_state.bidders.length > 0 && action.bid !== BidValue.ONESIXTY) {
        const newState: BiddingBoardState = {
          ...state,
          bidding: new_bid_state,
        };
        return simpleResult(newState, action);
      } else { // last bid
        if (new_bid_state.current_high.bid === BidValue.PASS) { // all passes
          const newState: NewGameBoardState = {
            publicHands: state.publicHands,
            name: GameplayState.NewGame,
            players: state.players,
            ready: [],
          };
          const abortTransition: GameAbortedTransition = {
            type: 'game_aborted',
            reason: 'Everybody passed!',
          };
          const events = [action, abortTransition];
          return { state: newState, events };
        } else {
          let newState: PartnerCallBoardState | DogRevealAndExchangeBoardState | PlayingBoardState;
          const events: PlayerEvent[] = [];
          const biddingCompletedTransition: BiddingCompletedTransition = {
            type: 'bidding_completed',
            winning_bid: new_bid_state.current_high,
            privateTo: undefined,
          };
          if (state.players.length === 5) {
            newState = {
              ...state,
              name: GameplayState.PartnerCall,
              bidder: new_bid_state.current_high.player,
              allBids: new_bid_state.bids,
              bidding: {
                winningBid: new_bid_state.current_high,
                calls: getAllCalls(state.players, new_bid_state),
              },
            };
            events.push(action, biddingCompletedTransition);
          } else { // 3 or 4 players
            if (new_bid_state.current_high.bid <= BidValue.FORTY) {
              newState = {
                ...state,
                name: GameplayState.DogReveal,
                bidder: new_bid_state.current_high.player,
                allBids: new_bid_state.bids,
                bidding: {
                  winningBid: new_bid_state.current_high,
                  calls: getAllCalls(state.players, new_bid_state),
                },
              };
              const dogRevealTransition: DogRevealTransition = {
                type: 'dog_revealed',
                dog: state.dog,
                player: new_bid_state.current_high.player,
                privateTo: undefined,
              };
              events.push(action, biddingCompletedTransition, dogRevealTransition);
            } else { // 80 or 160 bid
              const bidder = new_bid_state.current_high.player;
              newState = {
                ...state,
                name: GameplayState.Playing,
                bidder,
                allBids: new_bid_state.bids,
                bidding: {
                  winningBid: new_bid_state.current_high,
                  calls: getAllCalls(state.players, new_bid_state),
                },
                current_trick: getNewTrick(state.players, state.players[0], 0),
                past_tricks: [],
              };
              const gameStartedTransition: GameStartTransition = {
                type: 'game_started',
                first_player: state.players[0],
                privateTo: undefined,
              }
              events.push(action, biddingCompletedTransition, gameStartedTransition);
            }
          }
          return { state: newState, events };
        }
      }
    default:
      throw errorInvalidActionForGameState(action, state.name);
  }
};

function declareSlamActionReducer<T extends DealtBoardState & { bidder: PlayerId, bidding: CompletedBids }>(state: T, action: DeclareSlam): ReducerResult<T> {
  const player_num = getPlayerNum(state.players, action.player);
  if (action.player != state.bidder) {
    throw errorOnlyBidderCanDeclareSlam(action.player, state.bidder);
  }
  const newState: T = {
    ...state,
    bidding: {
      ...state.bidding,
      calls: {
        ...state.bidding.calls,
        [player_num]: [...state.bidding.calls[player_num], Call.DECLARED_SLAM],
      },
    },
  }
  return simpleResult(newState, action);
}

function getNewTrick(players: PlayerId[], first_player: PlayerId, trick_num: number) {
  return {
    trick_num,
    cards: [],
    players: getTrickPlayerOrder(players, first_player),
    current_player: 0,
  };
}

export const partnerCallBoardReducer: BoardReducer<PartnerCallBoardState, PartnerCallStateActions, PartnerCallStates> = function (state, action): ReducerResult<PartnerCallStates> {
  switch (action.type) {
    case "message":
      return simpleResult(state, action);
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
        const newState: PlayingBoardState = {
          ...state,
          name: GameplayState.Playing,
          called: action.card,
          partner,

          current_trick: getNewTrick(state.players, state.players[0], 0),
          past_tricks: [],
        };
        const gameStartedTransition: GameStartTransition = {
          type: 'game_started',
          first_player: state.players[0],
          privateTo: undefined,
        };
        return { state: newState, events: [action, gameStartedTransition] };
      } else {
        const newState: DogRevealAndExchangeBoardState = {
          ...state,
          name: GameplayState.DogReveal,
          called: action.card,
          partner,
        };
        const dogRevealTransition: DogRevealTransition = {
          type: 'dog_revealed',
          dog: state.dog,
          player: state.bidder,
          privateTo: undefined,
        };
        return { state: newState, events: [action, dogRevealTransition] };
      }
    default:
      throw errorInvalidActionForGameState(action, state.name);
  }
};

export const dogRevealAndExchangeBoardReducer: BoardReducer<DogRevealAndExchangeBoardState, DogRevealStateActions, DogRevealStates> = function (state, action): ReducerResult<DogRevealStates> {
  switch (action.type) {
    case "message":
      return simpleResult(state, action);
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
          const newState: PlayingBoardState = {
            ...state,
            name: GameplayState.Playing,
            dog: action.dog,
            hands: {
              ...state.hands,
              [player_num]: new_player_hand
            },
            current_trick: getNewTrick(state.players, state.players[0], 0),
            past_tricks: [],
          };
          const gameStartedTransition: GameStartTransition = {
            type: 'game_started',
            first_player: state.players[0],
            privateTo: undefined,
          };
          const events: PlayerEvent[] = [action, gameStartedTransition];
          const { publicHands } = state;
          if (publicHands) {
            const setDogForObservers: SetDogAction = {
              player: action.player,
              time: action.time,
              type: 'set_dog',
              dog: action.dog,
              exclude: state.players,
            };
            events.push(setDogForObservers);
          }
          return { state: newState, events };
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

export const playingBoardReducer: BoardReducer<PlayingBoardState, PlayingStateActions, PlayingStates> = function (state, action): ReducerResult<PlayingStates> {
  switch (action.type) {
    case "message":
      return simpleResult(state, action);
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
        const newState: PlayingBoardState = {
          ...state,
          hands,
          current_trick: {
            ...state.current_trick,
            cards: [...state.current_trick.cards, action.card],
            current_player: state.current_trick.current_player + 1,
          },
        };
        return simpleResult(newState, action);
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
          const newState: PlayingBoardState = {
            ...state,
            hands,
            joker_state: state.joker_state || joker_state,
            current_trick: getNewTrick(state.players, winner, completed_trick.trick_num + 1),
            past_tricks: [...state.past_tricks, completed_trick],
          }
          const completedTrickTransition: CompletedTrickTransition = {
            type: 'completed_trick',
            winner,
            winning_card,
            joker_state,
            privateTo: undefined,
          };
          return { state: newState, events: [action, completedTrickTransition] };
        } else { // end of game!
          const tricks = [...state.past_tricks, completed_trick];
          const bidding_team = _.compact([state.bidder, state.partner]);
          const cards_won = getCardsWon(bidding_team, tricks, state.joker_state);
          const outcomes = getOutcomes(state.players, bidding_team, tricks);
          const final_score = getFinalScore(
            state.players,
            bidding_team,
            state.bidding.winningBid.bid,
            cards_won,
            state.dog,
            state.shows,
            state.bidding.calls,
            outcomes,
          );
          const endState: CompletedGameState = {
            players: state.players,
            bidder: state.bidder,
            bid: state.bidding.winningBid.bid,
            partner: state.partner,
            dog: state.dog,
            calls: state.bidding.calls,
            shows: state.shows,
            outcomes,
            ...final_score
          };
          const newBoardState: CompletedBoardState = {
            ...state,
            name: GameplayState.Completed,
            joker_state: state.joker_state || joker_state,
            past_tricks: tricks,
            end_state: endState,
          }
          const completedTrickTransition: CompletedTrickTransition = {
            type: 'completed_trick',
            winner,
            winning_card,
            joker_state,
            privateTo: undefined,
          };
          const completedGameTransition: GameCompletedTransition = {
            type: 'game_completed',
            end_state: endState,
            privateTo: undefined,
          };
          return { state: newBoardState, events: [action, completedTrickTransition, completedGameTransition] };
        }
      }
    default:
      throw errorInvalidActionForGameState(action, state.name);
  }
};

export const completedBoardReducer: BoardReducer<CompletedBoardState, CompletedStateActions, CompletedBoardState> = function (state, action): ReducerResult<CompletedBoardState> {
  if (action.type === "message") {
    return simpleResult(state, action);
  } else {
    throw errorInvalidActionForGameState(action, state.name);
  }
};
