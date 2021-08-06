import {defaultMemoize} from 'reselect';
import {Card, RegValue, Suit} from '../../../server/play/model/Card';
import {PlayerId} from '../../../server/play/model/GameState';
import {ChatText, ServerChatAuthorId} from '../../../server/play/room/ChatText';
import {ReduxState} from '../rootReducer';
import {ClientGame} from './ClientGame';
import {TrickCards} from './ClientGameEventHandler';
import {ChatMessageListItem, ChatTextGroup, isChatTextGroup} from './RoomTypes';

const getClientGame = (state: ReduxState) => state.room?.game;

const isParticipant = (game: ClientGame) => {
  return game.playState.playerOrder.indexOf(game.playerId) >= 0;
};

const isGameFull = (game: ClientGame) => {
  return game.playState.playerOrder.length === 5;
};

const isReady = (game: ClientGame) => {
  return game.playState.readiedPlayers.has(game.playerId);
};

const getHandSize = defaultMemoize((game: ClientGame) => {
  if (game.playState.playerOrder.length === 3) {
    return 24;
  } else if (game.playState.playerOrder.length === 4) {
    return 18;
  } else {
    return 15;
  }
});

const getDogSize = defaultMemoize((game: ClientGame) => {
  if (
    game.playState.playerOrder.length === 3 ||
    game.playState.playerOrder.length === 4
  ) {
    return 6;
  } else {
    return 3;
  }
});

const getRotatedPlayerOrder = defaultMemoize((game: ClientGame) => {
  const {playState} = game;
  const isParticpant = isParticipant(game);
  const playerOrder = playState.playerOrder;
  if (!isParticpant || playerOrder.length <= 1) {
    return playerOrder;
  }
  const startIndex = playerOrder.indexOf(game.playerId);
  return [
    ...playerOrder.slice(startIndex, playerOrder.length),
    ...playerOrder.slice(0, startIndex),
  ];
});

const getHighestBid = defaultMemoize((game: ClientGame) => {
  let highest = 0;
  for (const bid of game.playState.playerBids.values()) {
    if (bid.bid > highest) {
      highest = bid.bid;
    }
  }
  return highest;
});

const getValueCounts = defaultMemoize((game: ClientGame) => {
  const counts = new Map<string, number>();
  for (const card of game.playState.hand) {
    const [_, valueEnum] = card;
    const value = `${valueEnum}`;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
});

const getSuitCounts = defaultMemoize((game: ClientGame) => {
  const counts = new Map<string, number>();
  for (const card of game.playState.hand) {
    const [suitEnum] = card;
    const suit = `${suitEnum}`;
    counts.set(suit, (counts.get(suit) ?? 0) + 1);
  }
  return counts;
});

const canDropTrump = defaultMemoize((game: ClientGame) => {
  const valueCounts = getValueCounts(game);
  const suitCounts = getSuitCounts(game);
  const handSize = getHandSize(game);
  const dogSize = getDogSize(game);
  return (
    (valueCounts.get(RegValue.R) ?? 0) + (suitCounts.get(Suit.Trump) ?? 0) >
    handSize - dogSize
  );
});

const getTrickCards = (trick?: TrickCards): Card[] => {
  if (!trick) {
    return [];
  }
  return trick.order.map((player: PlayerId) =>
    trick.cards.get(player)
  ) as Card[];
};

const canShow = defaultMemoize((game: ClientGame) => {
  const hasNotShown = !game.playState.shows.find(
    show => show.player === game.playerId
  );
  const showLimit = game.playState.playerOrder.length === 5 ? 8 : 10;
  const suitCount = getSuitCounts(game);
  const enoughTrump = (suitCount.get(Suit.Trump) ?? 0) >= showLimit;
  return hasNotShown && !game.playState.anyPlayerPlayedCard && enoughTrump;
});

const getGroupedChatText = defaultMemoize((chat: ChatText[]) => {
  const items: ChatMessageListItem[] = [];
  for (const currentChat of chat) {
    if (currentChat.authorId === ServerChatAuthorId) {
      items.push(currentChat);
    } else {
      const previousItem: ChatMessageListItem | undefined =
        items.length > 0 ? items[items.length - 1] : undefined;
      if (
        previousItem == null ||
        !isChatTextGroup(previousItem) ||
        previousItem.authorId !== currentChat.authorId
      ) {
        const messageGroup: ChatTextGroup = {
          id: currentChat.id,
          type: 'group',
          authorId: currentChat.authorId,
          chat: [currentChat],
          time: currentChat.time,
        };
        items.push(messageGroup);
      } else {
        previousItem.chat.push(currentChat);
      }
    }
  }
  return items.reverse();
});

export const ClientGameSelectors = {
  getClientGame,
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
  getGroupedChatText,
};
