import {TypedReducer} from 'redoodle';
import {PlayerEvent} from '../../../server/play/model/GameEvents';
import {GameSettings} from '../../../server/play/model/GameSettings';
import {PlayerId} from '../../../server/play/model/GameState';
import {ChatText} from '../../../server/play/room/ChatText';
import {PlayerStatus} from '../../../server/play/room/PlayerStatus';
import {SocketActions} from '../socket/socketService';
import {ClientGame} from './ClientGame';
import {BlankState, updateGameForEvent} from './ClientGameEventHandler';
import {RoomActions} from './RoomActions';
import {
  ClientRoom,
  GameUpdatesPayload,
  NewGameInfo,
  RoomStatusPayload,
  SetPlayerStatusPayload,
} from './RoomTypes';

const createEmptyGameState = (
  gameId: string,
  playerId: string,
  settings: GameSettings
): ClientGame => ({
  id: gameId,
  playerId,
  events: [],
  playState: BlankState,
  settings,
});

const roomStatusReducer = (
  state: ClientRoom | null,
  payload: RoomStatusPayload
): ClientRoom | null => {
  const {room, playerId} = payload;
  const players = new Map<PlayerId, PlayerStatus>();
  for (const playerId of Object.keys(room.players)) {
    players.set(playerId, room.players[playerId]);
  }

  const emptyGameState = createEmptyGameState(
    room.gameId,
    playerId,
    room.settings
  );

  const emptyRoomState: ClientRoom = {
    id: room.id,
    name: room.name,
    color: room.color,
    playerId,
    players,
    settings: room.settings,
    autoplay: false,
    autopass: false,
    chat: room.chat,
    game: emptyGameState,
  };

  const currentRoomState = gameUpdateReducer(emptyRoomState, {
    gameId: room.gameId,
    events: room.gameEvents,
  });

  return currentRoomState;
};

const chatReceivedReducer = (
  state: ClientRoom | null,
  chat: ChatText
): ClientRoom | null => {
  if (state == null) {
    return null;
  }
  return {
    ...state,
    chat: [...state.chat, chat],
  };
};

const updateGameWithEvents = (
  game: ClientGame,
  events: PlayerEvent[],
  playerId: string
): ClientGame => {
  let playState = game.playState;
  const settings = game.settings;
  for (const update of events) {
    playState = updateGameForEvent(playState, update, playerId);
  }
  return {
    ...game,
    playState,
    events: [...game.events, ...events],
    settings,
  };
};

const gameUpdateReducer = (
  state: ClientRoom | null,
  payload: GameUpdatesPayload
): ClientRoom | null => {
  if (state == null) {
    return null;
  }
  const {gameId, events} = payload;
  const nextGame = state.nextGame;
  if (gameId === state.game.id) {
    const updatedGame = updateGameWithEvents(
      state.game,
      events,
      state.playerId
    );
    return {
      ...state,
      game: updatedGame,
    };
  } else if (nextGame != null && gameId === nextGame.id) {
    const updatedGame = updateGameWithEvents(nextGame, events, state.playerId);
    return {
      ...state,
      nextGame: updatedGame,
    };
  } else {
    return state;
  }
};

const setAutopassReducer = (
  state: ClientRoom | null,
  autopass: boolean
): ClientRoom | null => {
  if (state == null) {
    return null;
  }
  return {...state, autopass};
};

const setAutoplayReducer = (
  state: ClientRoom | null,
  autoplay: boolean
): ClientRoom | null => {
  if (state == null) {
    return null;
  }
  return {...state, autoplay};
};

const closeShowWindowReducer = (
  state: ClientRoom | null
): ClientRoom | null => {
  if (state === null) {
    return null;
  }
  return {
    ...state,
    game: {
      ...state.game,
      playState: {
        ...state.game.playState,
        showIndex: null,
      },
    },
  };
};

const newGameCreatedReducer = (
  state: ClientRoom | null,
  newGameInfo: NewGameInfo
): ClientRoom | null => {
  if (state === null) {
    return null;
  }
  const emptyGameState = createEmptyGameState(
    newGameInfo.gameId,
    state?.playerId,
    newGameInfo.gameSettings
  );
  return {
    ...state,
    nextGame: emptyGameState,
  };
};

const moveToNewGameReducer = (state: ClientRoom | null): ClientRoom | null => {
  const nextGame = state?.nextGame;
  if (state == null || nextGame == null) {
    return null;
  }

  return {
    id: state.id,
    name: state.name,
    color: state.color,
    playerId: state.playerId,
    players: state.players,
    settings: state.settings,
    autoplay: false,
    autopass: false,
    chat: state.chat,
    game: nextGame,
    nextGame: undefined,
  };
};

const setPlayerStatusReducer = (
  state: ClientRoom | null,
  payload: SetPlayerStatusPayload
): ClientRoom | null => {
  if (state === null) {
    return state;
  }
  const {playerId, playerStatus} = payload;
  const newPlayers = new Map(state.players);
  newPlayers.set(playerId, playerStatus);
  return {
    ...state,
    players: newPlayers,
  };
};

export const roomReducer = TypedReducer.builder<ClientRoom | null>()
  .withDefaultHandler((state = null) => state)
  .withHandler(RoomActions.roomStatus.TYPE, roomStatusReducer)
  .withHandler(RoomActions.chatReceived.TYPE, chatReceivedReducer)
  .withHandler(RoomActions.gameUpdate.TYPE, gameUpdateReducer)
  .withHandler(RoomActions.closeShowWindow.TYPE, closeShowWindowReducer)
  .withHandler(RoomActions.setAutopass.TYPE, setAutopassReducer)
  .withHandler(RoomActions.setAutoplay.TYPE, setAutoplayReducer)
  .withHandler(RoomActions.newGameCreated.TYPE, newGameCreatedReducer)
  .withHandler(RoomActions.moveToNewGame.TYPE, moveToNewGameReducer)
  .withHandler(RoomActions.setPlayerStatus.TYPE, setPlayerStatusReducer)
  .withHandler(SocketActions.close.TYPE, () => null)
  .build();
