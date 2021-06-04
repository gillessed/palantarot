import { Player } from '../../server/model/Player';
import { PlayerId } from '../play/common';
import { InGameDispatcher } from '../services/ingame/InGameDispatcher';
import { PlayDispatcher } from '../services/ingame/PlayDispatcher';
import { getWindowRedux } from './consoleStore';

type DebugGroupActions = {
  numJoinGame(playerNum: number): void;
  numEnterGame(playerNum: number): void;
  numReady(playerNum: number): void;
}
type DebugDispatchers = {
  [key: string]: DebugDispatcher;
}
type DebugPlayers = {
  startGame(playerNumber: number): void;
  autoplay(): void;
} & DebugGroupActions & DebugDispatchers;
type DebugDispatcher = PlayDispatcher & { joinGame: () => void };
type DebugPlayerInfo = {
  key: string;
  id: string;
}

function getPlayerKey(player: Player) {
  return `${player.firstName.toLocaleLowerCase()}${player.lastName.toLocaleLowerCase()}`;
}

function buildDispatcher(playerId: PlayerId, game: string, dispatcher: InGameDispatcher): DebugDispatcher {
  const obj: Partial<DebugDispatcher> = dispatcher.play(playerId, true);
  obj.joinGame = () => dispatcher.debugJoinGame(playerId, game);
  return obj as DebugDispatcher;
}

function getDebugPlayers(selfId: string, allPlayers: Player[]): DebugPlayerInfo[] {
  const botPlayers: DebugPlayerInfo[] = allPlayers
    .filter((player) => player.id !== selfId && player.isBot)
    .map((player) => ({ key: getPlayerKey(player), id: player.id }));
  const nonBotPlayers: DebugPlayerInfo[] = allPlayers
      .filter((player) => player.id !== selfId && !player.isBot)
      .map((player) => ({ key: getPlayerKey(player), id: player.id }));
  const debugPlayers: DebugPlayerInfo[] = [];
  for (const nonDebugPlayer of botPlayers) {
    debugPlayers.push(nonDebugPlayer);
  }
  for (const nonDebugPlayer of nonBotPlayers) {
    debugPlayers.push(nonDebugPlayer);
  }
  return debugPlayers;
}

function getGroupAction(
  action: keyof DebugDispatcher,
  selfId: PlayerId,
  gameId: string,
  players: Player[],
  inGameDispatcher: InGameDispatcher,
) {
  return (count: number) => {
    const debugPlayers = getDebugPlayers(selfId, players);
    if (debugPlayers.length < count) {
      console.warn('Could not perform action as not enough players exist in the database.');
      return;
    }
    for (let i = 0; i < count; i++) {
      const info = debugPlayers[i];
      const dispatcher =  buildDispatcher(info.id, gameId, inGameDispatcher);
      (dispatcher[action] as Function)();
    }
  }
}

function getStartGame(groupActions: DebugGroupActions) {
  return (count: number) => {
    groupActions.numJoinGame(count);
    groupActions.numEnterGame(count);
    groupActions.numReady(count);
  }
}

export function registerDebugPlayers(player: string, gameId: string, dispatcher: InGameDispatcher) {
  const playerMap = getWindowRedux().getState().players.value;
  if (!playerMap) {
    return;
  }
  const players = [...playerMap.values()];
  const debugPlayers = getDebugPlayers(player, players);
  const groupActions: DebugGroupActions = {
    numJoinGame: getGroupAction('joinGame', player, gameId, players, dispatcher),
    numEnterGame: getGroupAction('enterGame', player, gameId, players, dispatcher),
    numReady: getGroupAction('markAsReady', player, gameId, players, dispatcher),
  }
  const d = {
    ...groupActions,
    startGame: getStartGame(groupActions),
    autoplay: () => dispatcher.autoplay(),
  } as DebugPlayers;
  for (const debugPlayer of debugPlayers) {
    const playDispatcher = buildDispatcher(debugPlayer.id, gameId, dispatcher);
    d[debugPlayer.key] = playDispatcher;
  }
  (window as any).d = d;
}

export function unregisterDebugPlayers() {
  delete (window as any).d;
}
