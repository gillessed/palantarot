import { ServerApi } from "../../api/serverApi";
import { Dispatchers } from "../../services/dispatchers";
import { Loader } from "../../services/loader";
import { generatePropertyService } from "../../services/redux/serviceGenerator";
import { ReduxState } from "../../services/rootReducer";
import { Lobby } from './LobbyTypes';

export const lobbyService = generatePropertyService<void, Lobby>('LOBBY',
  (api: ServerApi) => {
    return () => {
      return api.listPlayableGames()
        .then(games =>
          new Map(Object.keys(games).map(game => [game, games[game]]))
        )
    }
  },
);

export const lobbyLoader: Loader<ReduxState, void, Lobby> = {
  get: (state: ReduxState) => state.lobby,
  load: (dispatchers: Dispatchers, request: void, force?: boolean) => dispatchers.lobby.request(),
};

