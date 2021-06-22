import _ from "lodash";
import { Card, TrumpCard } from "../../../server/play/model/Card";
import { cardsWithout, compareCards } from "../../../server/play/model/CardUtils";
import { BidAction, BiddingCompletedTransition, CallPartnerAction, CompletedTrickTransition, DealtHandTransition, DogRevealTransition, EnterGameAction, GameAbortedTransition, GameCompletedTransition, GameStartTransition, LeaveGameAction, PlayCardAction, PlayerEvent, PlayerNotReadyAction, PlayerReadyAction, PlayersSetTransition, SetDogAction, ShowDogToObservers, ShowTrumpAction } from "../../../server/play/model/GameEvents";
import { Bid, BidValue, CompletedGameState, GameplayState, PlayerId } from "../../../server/play/model/GameState";

export interface TrickCards {
  order: string[];
  cards: Map<string, Card>;
  completed: boolean;
  winner?: string;
}

export interface PlayState {
  readonly state: GameplayState;
  readonly hand: Card[];
  readonly dog: Card[];
  readonly playerOrder: PlayerId[];
  readonly readiedPlayers: Set<PlayerId>;
  readonly toPlay?: PlayerId;
  readonly toBid?: number;
  readonly playerBids: Map<PlayerId, Bid>;
  readonly winningBid?: Bid;
  readonly partner?: PlayerId;
  readonly partnerCard?: Card;
  readonly anyPlayerPlayedCard?: boolean;
  readonly trick: TrickCards;
  readonly completedTricks: TrickCards[];
  readonly endState?: CompletedGameState;
  readonly shows: ShowDetails[];
  readonly showIndex: number | null;
  readonly allHands: Map<PlayerId, Card[]>;
}

export interface ShowDetails {
  player: PlayerId;
  trumpCards: TrumpCard[];
}

export const BlankState: PlayState = {
  state: GameplayState.NewGame,
  hand: [],
  dog: [],
  playerOrder: [],
  readiedPlayers: new Set(),
  playerBids: new Map(),
  trick: {
    order: [],
    cards: new Map(),
    completed: false,
  },
  completedTricks: [],
  shows: [],
  showIndex: null,
  allHands: new Map(),
};

function markPlayerReady(state: PlayState, action: PlayerReadyAction): PlayState {
  return {
    ...state,
    readiedPlayers: new Set(state.readiedPlayers).add(action.player),
  };
}

function unmarkPlayerReady(state: PlayState, action: PlayerNotReadyAction): PlayState {
  const newReadiedPlayers = new Set(state.readiedPlayers);
  newReadiedPlayers.delete(action.player);
  return {
    ...state,
    readiedPlayers: newReadiedPlayers,
  };
}

function enterGame(state: PlayState, action: EnterGameAction): PlayState {
  return {
    ...state,
    playerOrder: [...state.playerOrder, action.player],
  };
}

function leaveGame(state: PlayState, action: LeaveGameAction): PlayState {
  return {
    ...state,
    playerOrder: _.without(state.playerOrder, action.player),
  };
}

function dealtHand(state: PlayState, action: DealtHandTransition, playerId: PlayerId): PlayState {
  const newState = {
    ...state,
    state: GameplayState.Bidding,
    toBid: 0,
  }
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

function playersSet(state: PlayState, action: PlayersSetTransition): PlayState {
  return {
    ...state,
    state: GameplayState.Bidding,
    playerOrder: action.playerOrder,
    toBid: 0,
  };
}

function showTrump(state: PlayState, action: ShowTrumpAction): PlayState {
  const newShows = [...state.shows, { player: action.player, trumpCards: action.cards }];
  return {
    ...state,
    shows: newShows,
    showIndex: newShows.length - 1,
  };
}

function bid(state: PlayState, action: BidAction): PlayState {
  const newBids = new Map(state.playerBids);
  newBids.set(action.player, {
    player: action.player,
    bid: action.bid,
    calls: action.calls ?? [],
  });
  const passCount = [...state.playerBids.values()].reduce((acc, value) => {
    return acc + (value.bid === BidValue.PASS ? 1 : 0);
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
  } while (state.playerBids.get(state.playerOrder[newBidder])?.bid === BidValue.PASS);
  return {
    ...state,
    toBid: newBidder,
    playerBids: newBids,
  };
}

function biddingCompleted(state: PlayState, action: BiddingCompletedTransition): PlayState {
  return {
    ...state,
    state: GameplayState.PartnerCall,
    winningBid: action.winning_bid,
  };
}

function callPartner(state: PlayState, action: CallPartnerAction): PlayState {
  return {
    ...state,
    state: GameplayState.PartnerCall,
    partnerCard: action.card,
  };
}

function dogRevealed(state: PlayState, action: DogRevealTransition, player: PlayerId): PlayState {
  const selfCall = !!action.dog.find((card) => _.isEqual(card, state.partnerCard));
  if (action.player === player) {
    return {
      ...state,
      state: GameplayState.DogReveal,
      hand: [...state.hand, ...action.dog].sort(compareCards()),
      partner: selfCall ? state.winningBid?.player : undefined,
      dog: action.dog,
    }
  } else {
    return {
      ...state,
      state: GameplayState.DogReveal,
      partner: selfCall ? state.winningBid?.player : undefined,
      dog: action.dog,
    };
  }
}

function dogRevealedToObservers(state: PlayState, action: ShowDogToObservers): PlayState {
  return {
    ...state,
    dog: action.dog,
  };
}

function setDog(state: PlayState, action: SetDogAction): PlayState {
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
    };  } else {
    return {
      ...state,
      hand: cardsWithout(state.hand, ...action.dog),
    };
  }
}

function gameStarted(state: PlayState, action: GameStartTransition): PlayState {
  return {
    ...state,
    state: GameplayState.Playing,
    toPlay: action.first_player,
  };
}

function playCard(state: PlayState, action: PlayCardAction, playerId: PlayerId): PlayState {
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
    newOrder = [...state.trick.order ?? [], action.player];
  }
  const newTrick: TrickCards = {
    order: newOrder,
    cards: newTrickCards,
    completed: false,
  };
  let partner = state.partner;
  if (!partner && _.isEqual(state.partnerCard, action.card)) {
    partner = action.player;
  }
  const globalHand = state.allHands.get(action.player);
  const newAllHands = new Map(state.allHands);
  if (globalHand != null) {
    newAllHands.set(action.player, cardsWithout(globalHand, action.card));
  }
  return {
    ...state,
    hand: action.player === playerId ? cardsWithout(state.hand, action.card) : state.hand,
    toPlay,
    trick: newTrick,
    completedTricks: newCompletedTricks,
    partner,
    anyPlayerPlayedCard: true,
    allHands: newAllHands,
  };
}

function completedTrick(state: PlayState, action: CompletedTrickTransition): PlayState {
  return {
    ...state,
    trick: { ...state.trick, completed: true, winner: action.winner },
    toPlay: action.winner,
  }
}

function gameComplete(state: PlayState, action: GameCompletedTransition): PlayState {
  return {
    ...state,
    state: GameplayState.Completed,
    endState: action.end_state,
  };
}

function gameAborted(state: PlayState, event: GameAbortedTransition): PlayState {
  return {
    ...BlankState,
    playerOrder: state.playerOrder,
  };
}

export function updateGameForEvent(state: PlayState, event: PlayerEvent, playerId: PlayerId): PlayState {
  switch (event.type) {
    case 'mark_player_ready':
      return markPlayerReady(state, event as PlayerReadyAction);
    case 'unmark_player_ready':
      return unmarkPlayerReady(state, event as PlayerNotReadyAction);
    case 'enter_game':
      return enterGame(state, event as EnterGameAction);
    case 'leave_game':
      return leaveGame(state, event as LeaveGameAction);
    case 'dealt_hand':
      return dealtHand(state, event as DealtHandTransition, playerId);
    case 'players_set':
      return playersSet(state, event as PlayersSetTransition);
    case 'show_trump':
      return showTrump(state, event as ShowTrumpAction);
    case 'bid':
      return bid(state, event as BidAction);
    case 'bidding_completed':
      return biddingCompleted(state, event as BiddingCompletedTransition);
    case 'call_partner':
      return callPartner(state, event as CallPartnerAction);
    case 'dog_revealed':
      return dogRevealed(state, event as DogRevealTransition, playerId);
    case 'show_dog_to_observers':
      return dogRevealedToObservers(state, event as ShowDogToObservers);
    case 'set_dog':
      return setDog(state, event as SetDogAction);
    case 'game_started':
      return gameStarted(state, event as GameStartTransition);
    case 'play_card':
      return playCard(state, event as PlayCardAction, playerId);
    case 'completed_trick':
      return completedTrick(state, event as CompletedTrickTransition);
    case 'game_completed':
      return gameComplete(state, event as GameCompletedTransition);
    case 'game_aborted':
      return gameAborted(state, event as GameAbortedTransition);
    default:
      return state;
  }
}
