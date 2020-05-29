import { defaultMemoize } from 'reselect';
import { EventsToDisplay } from '../../containers/play/sidebar/PlaySidebar';
import { Card, MessageAction, PlayerId, RegValue, TrumpSuit } from '../../play/common';
import { TrickCards } from '../../play/ingame/playLogic';
import { InGameState, MessageGroup, SidebarEvent } from './InGameTypes';

const isParticipant = (state: InGameState) => {
  return state.state.playerOrder.indexOf(state.player) >= 0;
}

const isGameFull = (state: InGameState) => {
  return state.state.playerOrder.length === 5;
}

const isReady = (state: InGameState) => {
  return state.state.readiedPlayers.has(state.player);
}

const getHandSize = defaultMemoize((game: InGameState) => {
  if (game.state.playerOrder.length === 3) {
    return 24;
  } else if (game.state.playerOrder.length === 4) {
    return 18;
  } else {
    return 15;
  }
});

const getDogSize = defaultMemoize((game: InGameState) => {
  if (game.state.playerOrder.length === 3 || game.state.playerOrder.length === 4) {
    return 6;
  } else {
    return 3;
  }
});

const getRotatedPlayerOrder = defaultMemoize((game: InGameState) => {
  const playState = game.state;
  const isParticpant = InGameSelectors.isParticipant(game);
  const playerOrder = playState.playerOrder;
  if (!isParticpant || playerOrder.length <= 1) {
    return playerOrder;
  }
  const startIndex = playerOrder.indexOf(game.player);
  return [
    ...playerOrder.slice(startIndex, playerOrder.length),
    ...playerOrder.slice(0, startIndex),
  ];
});

const getHighestBid = defaultMemoize((game: InGameState) => {
  let highest = 0;
  for (const bid of game.state.playerBids.values()) {
    if (bid.bid > highest) {
      highest = bid.bid;
    }
  }
  return highest;
});

const getValueCounts = defaultMemoize((game: InGameState) => {
  const counts = new Map<string, number>();
  for (const card of game.state.hand) {
    const [ _, valueEnum ] = card;
    const value = `${valueEnum}`;
    if (!counts.has(value)) {
      counts.set(value, 1);
    } else {
      counts.set(value, counts.get(value) ?? 0 + 1);
    }
  }
  return counts;
});

const getSuitCounts = defaultMemoize((game: InGameState) => {
  const counts = new Map<string, number>();
  for (const card of game.state.hand) {
    const [ suitEnum ] = card;
    const suit = `${suitEnum}`;
    counts.set(suit, (counts.get(suit) ?? 0) + 1);
  }
  return counts;
});

const canDropTrump = defaultMemoize((game: InGameState) => {
  const valueCounts = getValueCounts(game);
  const suitCounts = getSuitCounts(game);
  const handSize = getHandSize(game);
  const dogSize = getDogSize(game);
  return (valueCounts.get(RegValue.R) ?? 0) + (suitCounts.get(TrumpSuit) ?? 0) > handSize - dogSize;
});

const getTrickCards = (trick?: TrickCards): Card[] => {
  if (!trick) {
    return [];
  }
  return trick.order.map((player: PlayerId) => trick.cards.get(player)) as Card[];
}

const canShow = defaultMemoize((game: InGameState) => {
  const hasNotShown = !game.state.shows.find((show) => show.player === game.player);
  const showLimit = game.state.playerOrder.length === 5 ? 8 : 10;
  const suitCount = getSuitCounts(game);
  const enoughTrump = (suitCount.get(TrumpSuit) ?? 0) >= showLimit;
  return hasNotShown && !game.state.playedFirstCard && enoughTrump;
});

const getEventsForSidebar = defaultMemoize((game: InGameState) => {
  const filteredEvents = game.events.filter((event) => EventsToDisplay.indexOf(event.type) >= 0);
  const groupedEvents: SidebarEvent[] = [];
  for (const event of filteredEvents) {
    if (groupedEvents.length === 0 || event.type !== 'message') {
      groupedEvents.push(event);
    } else {
      const currentMessage = event as MessageAction;
      const previousEvent = groupedEvents[groupedEvents.length - 1];
      if (previousEvent.type !== 'message_group' || previousEvent.author !== currentMessage.player) {
        const messageGroup: MessageGroup = {
          type: 'message_group',
          author: currentMessage.player,
          messages: [currentMessage.text],
          time: currentMessage.time,
        }
        groupedEvents.push(messageGroup);
      } else {
        previousEvent.messages.push(currentMessage.text);
      }
    }
  }
  return groupedEvents;
}); 

export const InGameSelectors = {
  isParticipant,
  isGameFull,
  isReady,
  getHandSize,
  getDogSize,
  getRotatedPlayerOrder,
  getHighestBid,
  getValueCounts,
  canDropTrump,
  getTrickCards,
  canShow,
  getEventsForSidebar,
};
