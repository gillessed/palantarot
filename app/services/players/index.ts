import { PlayerId } from "../../../server/play/model/GameState";
import { Dispatchers } from "../dispatchers";
import { Loader } from "../loader";
import { PropertyDispatcher } from "../redux/serviceDispatcher";
import { generatePropertyService } from "../redux/serviceGenerator";
import { ReduxState } from "../rootReducer";
import { Player } from "./../../../server/model/Player";
import { ServerApi } from "./../../api/serverApi";
import { Loadable } from "./../redux/loadable";

export type PlayersService = Loadable<void, Map<PlayerId, Player>>;

const playersService = generatePropertyService<void, Map<PlayerId, Player>>("players", (api: ServerApi) => {
  return () => {
    return api.getPlayers();
  };
});

export const playersActions = playersService.actions;
export const PlayersDispatcher = playersService.dispatcher;
export type PlayersDispatcher = PropertyDispatcher<void>;
export const playersReducer = playersService.reducer.build();
export const playersSaga = playersService.saga;
export const playersLoader: Loader<ReduxState, void, Map<PlayerId, Player>> = {
  get: (state: ReduxState, _: undefined) => state.players,
  load: (dispatchers: Dispatchers, _: undefined, force?: boolean) => dispatchers.players.request(undefined, force),
};

export const PlayersSelectors = {
  get: (state: ReduxState) => state.players.value,
  getBots: (players: Map<PlayerId, Player>): Player[] => {
    const bots: Player[] = [];
    for (const playerId of players.keys()) {
      const player = players.get(playerId);
      if (player != null && player?.isBot) {
        bots.push(player);
      }
    }
    return bots;
  },
};
