import {ServerApi} from '../../api/serverApi';
import {Dispatchers} from '../../services/dispatchers';
import {Loader} from '../../services/loader';
import {generatePropertyService} from '../../services/redux/serviceGenerator';
import {ReduxState} from '../../services/rootReducer';
import {Lobby} from './LobbyTypes';

export const lobbyService = generatePropertyService<void, Lobby>(
  'lobby',
  (api: ServerApi) => {
    return () => {
      return api
        .listRooms()
        .then(
          rooms =>
            new Map(Object.keys(rooms).map(roomId => [roomId, rooms[roomId]]))
        );
    };
  }
);

export const lobbyLoader: Loader<ReduxState, void, Lobby> = {
  get: (state: ReduxState) => state.lobby,
  load: (dispatchers: Dispatchers, request: void, force?: boolean) =>
    dispatchers.lobby.request(),
};
