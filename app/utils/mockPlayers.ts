import {Player} from '../../server/model/Player';
import {PlayerId} from '../../server/play/model/GameState';
import {PlayDispatcher} from '../services/room/ClientGameDispatcher';
import {RoomDispatcher} from '../services/room/RoomDispatcher';
import {getWindowRedux} from './consoleStore';

type DebugGroupActions = {
  numEnterGame(playerNum: number): void;
  numReady(playerNum: number): void;
};
type DebugDispatchers = {
  [key: string]: PlayDispatcher;
};
type DebugPlayers = {
  startGame(playerNumber: number): void;
  autoplay(): void;
} & DebugGroupActions &
  DebugDispatchers;
type DebugPlayerInfo = {
  key: string;
  id: string;
};

function getPlayerKey(player: Player) {
  return `${player.firstName.toLocaleLowerCase()}${player.lastName.toLocaleLowerCase()}`;
}

function buildDispatcher(
  playerId: PlayerId,
  roomId: string,
  dispatcher: RoomDispatcher
): PlayDispatcher {
  return dispatcher.play(playerId);
}

function getDebugPlayers(
  selfId: string,
  allPlayers: Player[]
): DebugPlayerInfo[] {
  const botPlayers: DebugPlayerInfo[] = allPlayers
    .filter(player => player.id !== selfId && player.isBot)
    .map(player => ({key: getPlayerKey(player), id: player.id}));
  const nonBotPlayers: DebugPlayerInfo[] = allPlayers
    .filter(player => player.id !== selfId && !player.isBot)
    .map(player => ({key: getPlayerKey(player), id: player.id}));
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
  action: keyof PlayDispatcher,
  selfId: PlayerId,
  gameId: string,
  players: Player[],
  roomDispatcher: RoomDispatcher
) {
  return (count: number) => {
    const debugPlayers = getDebugPlayers(selfId, players);
    if (debugPlayers.length < count) {
      console.warn(
        'Could not perform action as not enough players exist in the database.'
      );
      return;
    }
    for (let i = 0; i < count; i++) {
      const info = debugPlayers[i];
      const dispatcher = buildDispatcher(info.id, gameId, roomDispatcher);
      (dispatcher[action] as Function)();
    }
  };
}

function getStartGame(groupActions: DebugGroupActions) {
  return (count: number) => {
    groupActions.numEnterGame(count);
    groupActions.numReady(count);
  };
}

export function registerDebugPlayers(
  player: string,
  roomId: string,
  dispatcher: RoomDispatcher
) {
  const playerMap = getWindowRedux().getState().players.value;
  if (!playerMap) {
    return;
  }
  const players = [...playerMap.values()];
  const debugPlayers = getDebugPlayers(player, players);
  const groupActions: DebugGroupActions = {
    numEnterGame: getGroupAction(
      'enterGame',
      player,
      roomId,
      players,
      dispatcher
    ),
    numReady: getGroupAction(
      'markAsReady',
      player,
      roomId,
      players,
      dispatcher
    ),
  };
  const d = {
    ...groupActions,
    startGame: getStartGame(groupActions),
    autoplay: () => dispatcher.autoplay(),
  } as DebugPlayers;
  for (const debugPlayer of debugPlayers) {
    d[debugPlayer.key] = buildDispatcher(debugPlayer.id, roomId, dispatcher);
  }
  (window as any).d = d;
}

export function unregisterDebugPlayers() {
  delete (window as any).d;
}
