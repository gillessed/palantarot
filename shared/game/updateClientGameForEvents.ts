import pkg from "lodash";
import {
  cardsWithout,
  compareCards,
} from "../../server/play/model/CardUtils.ts";
import {
  type BidAction,
  type BiddingCompletedTransition,
  type CallPartnerAction,
  type CompletedTrickTransition,
  type DealtHandTransition,
  type DogRevealTransition,
  type EnterGameAction,
  type GameAbortedTransition,
  type GameCompletedTransition,
  type GameStartTransition,
  type LeaveGameAction,
  type PlayCardAction,
  type PlayerEvent,
  type PlayerReadyAction,
  type PlayersSetTransition,
  type SetDogAction,
  type ShowDogToObservers,
  type ShowTrumpAction,
  type NotifyEvent,
  type PlayerUnreadyAction,
} from "../../server/play/model/GameEvents.ts";
import { type PlayerId } from "../../server/play/model/GameState.ts";
import {
  EmptyClientGame,
  type ClientGame,
  type ClientTrickCards,
} from "../types/ClientGameTypes.ts";

const { isEqual, without } = pkg;

function markPlayerReady(
  state: ClientGame,
  action: PlayerReadyAction
): ClientGame {
  return {
    ...state,
    readiedPlayers: new Set(state.readiedPlayers).add(action.player),
  };
}

function unmarkPlayerReady(
  state: ClientGame,
  action: PlayerUnreadyAction
): ClientGame {
  const newReadiedPlayers = new Set(state.readiedPlayers);
  newReadiedPlayers.delete(action.player);
  return {
    ...state,
    readiedPlayers: newReadiedPlayers,
  };
}

function enterGame(state: ClientGame, action: EnterGameAction): ClientGame {
  return {
    ...state,
    playerOrder: [...state.playerOrder, action.player],
  };
}

function leaveGame(state: ClientGame, action: LeaveGameAction): ClientGame {
  return {
    ...state,
    playerOrder: without(state.playerOrder, action.player),
  };
}

function dealtHand(
  state: ClientGame,
  action: DealtHandTransition,
  playerId: PlayerId
): ClientGame {
  if (action.playerId === playerId) {
    return {
      ...state,
      hand: action.hand,
    };
  } else {
    const newHands = new Map(state.allHands);
    newHands.set(action.playerId, action.hand);
    return {
      ...state,
      allHands: newHands,
    };
  }
}

function playersSet(
  state: ClientGame,
  action: PlayersSetTransition
): ClientGame {
  return {
    ...state,
    gamePhase: "bidding",
    playerOrder: action.playerOrder,
    toBid: 0,
  };
}

function showTrump(state: ClientGame, action: ShowTrumpAction): ClientGame {
  const newShows = [
    ...state.shows,
    { player: action.player, trumpCards: action.cards },
  ];
  return {
    ...state,
    shows: newShows,
    showIndex: newShows.length - 1,
  };
}

function bid(state: ClientGame, action: BidAction): ClientGame {
  const newBids = new Map(state.playerBids);
  newBids.set(action.player, {
    player: action.player,
    bid: action.bid,
    calls: action.calls ?? [],
  });
  const passCount = [...state.playerBids.values()].reduce((acc, value) => {
    return acc + (value.bid === 0 ? 1 : 0);
  }, 0);
  if (state.playerOrder.length - passCount <= 1) {
    return {
      ...state,
      playerBids: newBids,
    };
  }
  let newBidder = state.toBid ?? 0;
  do {
    newBidder = (newBidder + 1) % state.playerOrder.length;
  } while (state.playerBids.get(state.playerOrder[newBidder])?.bid === 0);
  return {
    ...state,
    toBid: newBidder,
    playerBids: newBids,
  };
}

function biddingCompleted(
  state: ClientGame,
  action: BiddingCompletedTransition
): ClientGame {
  return {
    ...state,
    gamePhase: "partner_call",
    winningBid: action.winning_bid,
  };
}

function callPartner(state: ClientGame, action: CallPartnerAction): ClientGame {
  return {
    ...state,
    gamePhase: "partner_call",
    partnerCard: action.card,
  };
}

function dogRevealed(
  state: ClientGame,
  action: DogRevealTransition,
  player: PlayerId
): ClientGame {
  const selfCall = !!action.dog.find((card) =>
    isEqual(card, state.partnerCard)
  );
  if (action.player === player) {
    return {
      ...state,
      gamePhase: "dog_reveal",
      hand: [...state.hand, ...action.dog].sort(compareCards()),
      partner: selfCall ? state.winningBid?.player : undefined,
      dog: action.dog,
    };
  } else {
    return {
      ...state,
      gamePhase: "dog_reveal",
      partner: selfCall ? state.winningBid?.player : undefined,
      dog: action.dog,
    };
  }
}

function dogRevealedToObservers(
  state: ClientGame,
  action: ShowDogToObservers
): ClientGame {
  return {
    ...state,
    dog: action.dog,
  };
}

function setDog(state: ClientGame, action: SetDogAction): ClientGame {
  if (action.exclude != null) {
    const globalHand = state.allHands.get(action.player);
    const newAllHands = new Map(state.allHands);
    if (globalHand != null) {
      const handWithDog = [...globalHand, ...state.dog];
      const droppedHand = cardsWithout(handWithDog, ...action.dog);
      droppedHand.sort(compareCards());
      newAllHands.set(action.player, droppedHand);
    }
    return {
      ...state,
      dog: action.exclude != null ? action.dog : state.dog,
      allHands: newAllHands,
    };
  } else {
    return {
      ...state,
      hand: cardsWithout(state.hand, ...action.dog),
    };
  }
}

function gameStarted(
  state: ClientGame,
  action: GameStartTransition
): ClientGame {
  return {
    ...state,
    gamePhase: "playing",
    toPlay: action.first_player,
  };
}

function playCard(
  state: ClientGame,
  action: PlayCardAction,
  playerId: PlayerId
): ClientGame {
  const playerIndex = state.playerOrder.indexOf(action.player) + 1;
  const toPlay = state.playerOrder[playerIndex % state.playerOrder.length];
  let newTrickCards;
  let newOrder;
  let newCompletedTricks = state.completedTricks;
  if (state.trick.completed) {
    newTrickCards = new Map([[action.player, action.card]]);
    newOrder = [action.player];
    newCompletedTricks = [...state.completedTricks, state.trick];
  } else {
    newTrickCards = new Map(state.trick.cards);
    newTrickCards.set(action.player, action.card);
    newOrder = [...(state.trick.order ?? []), action.player];
  }
  const newTrick: ClientTrickCards = {
    order: newOrder,
    cards: newTrickCards,
    completed: false,
  };
  let partner = state.partner;
  if (!partner && isEqual(state.partnerCard, action.card)) {
    partner = action.player;
  }
  const globalHand = state.allHands.get(action.player);
  const newAllHands = new Map(state.allHands);
  if (globalHand != null) {
    newAllHands.set(action.player, cardsWithout(globalHand, action.card));
  }
  return {
    ...state,
    hand:
      action.player === playerId
        ? cardsWithout(state.hand, action.card)
        : state.hand,
    toPlay,
    trick: newTrick,
    completedTricks: newCompletedTricks,
    partner,
    anyPlayerPlayedCard: true,
    allHands: newAllHands,
    notifyPlayer: null,
  };
}

function completedTrick(
  state: ClientGame,
  action: CompletedTrickTransition
): ClientGame {
  return {
    ...state,
    trick: { ...state.trick, completed: true, winner: action.winner },
    toPlay: action.winner,
  };
}

function gameComplete(
  state: ClientGame,
  action: GameCompletedTransition
): ClientGame {
  return {
    ...state,
    gamePhase: "completed",
    endState: action.end_state,
  };
}

function gameAborted(state: ClientGame, _: GameAbortedTransition): ClientGame {
  return {
    ...EmptyClientGame,
    playerOrder: state.playerOrder,
  };
}

function notifyPlayer(state: ClientGame, event: NotifyEvent): ClientGame {
  return {
    ...state,
    notifyPlayer: event.playerId,
  };
}

export function updateClientGameForEvent(
  state: ClientGame,
  event: PlayerEvent,
  playerId: PlayerId
): ClientGame {
  switch (event.type) {
    case "mark_player_ready":
      return markPlayerReady(state, event);
    case "mark_player_unready":
      return unmarkPlayerReady(state, event);
    case "enter_game":
      return enterGame(state, event);
    case "leave_game":
      return leaveGame(state, event);
    case "dealt_hand":
      return dealtHand(state, event, playerId);
    case "players_set":
      return playersSet(state, event);
    case "show_trump":
      return showTrump(state, event);
    case "bid":
      return bid(state, event);
    case "bidding_completed":
      return biddingCompleted(state, event);
    case "call_partner":
      return callPartner(state, event);
    case "dog_revealed":
      return dogRevealed(state, event, playerId);
    case "show_dog_to_observers":
      return dogRevealedToObservers(state, event);
    case "set_dog":
      return setDog(state, event);
    case "game_started":
      return gameStarted(state, event);
    case "play_card":
      return playCard(state, event, playerId);
    case "completed_trick":
      return completedTrick(state, event);
    case "game_completed":
      return gameComplete(state, event);
    case "game_aborted":
      return gameAborted(state, event);
    case "notify_player":
      return notifyPlayer(state, event);
    default:
      return state;
  }
}

export function updateClientGameForEvents(
  state: ClientGame,
  events: ReadonlyArray<PlayerEvent>,
  playerId: PlayerId
): ClientGame {
  let newState = state;
  for (const event of events) {
    newState = updateClientGameForEvent(newState, event, playerId);
  }
  return newState;
}
