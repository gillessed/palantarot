import {Loadable} from "../../services/redux/loadable";
import {generatePropertyService} from "../../services/redux/serviceGenerator";
import {ServerApi} from "../../api/serverApi";
import {ReduxState} from "../../services/rootReducer";
import {Loader} from "../../services/loader";
import {Dispatchers} from "../../services/dispatchers";
import {PropertyDispatcher} from "../../services/redux/serviceDispatcher";
import {GameDescription} from "../common";

export type Lobby = Map<string, GameDescription>;

export type LobbyService = Loadable<void, Lobby>;

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

export const lobbyReducer = lobbyService.reducer.build();
export type LobbyDispatcher = PropertyDispatcher<void>;
export const lobbyLoader: Loader<ReduxState, void, Lobby> = {
    get: (state: ReduxState) => state.lobby,
    load: (dispatchers: Dispatchers, request: void, force?: boolean) => dispatchers.lobby.request(force),
}

