import { Loadable } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { Player } from './../../../server/model/Player';
import { generatePropertyService } from '../redux/serviceGenerator';
import { addNewPlayerActions } from '../addPlayer/index';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { ReduxState } from '../rootReducer';
import { Loader } from '../loader';
import { Dispatchers } from '../dispatchers';

export type PlayersService = Loadable<void, Map<string, Player>>;

const playersService = generatePropertyService<void, Map<string, Player>>('PLAYERS',
  (api: ServerApi) => {
    return () => {
      return api.getPlayers();
    }
  }
);

export const playersActions = playersService.actions;
export const PlayersDispatcher = playersService.dispatcher;
export type PlayersDispatcher = PropertyDispatcher<void>;
export const playersReducer = playersService.reducer
  .withHandler(addNewPlayerActions.success.TYPE, (loadable: Loadable<void, Map<string, Player>>, player: Player) => {
    const map = loadable.value || new Map<string, Player>();
    map.set(player.id, player);
    return {
      loading: false,
      value: map,
    };
  })
  .build();
export const playersSaga = playersService.saga;
export const playersLoader: Loader<ReduxState, void, Map<string, Player>> = {
  get: (state: ReduxState, _: undefined) => state.players,
  load: (dispatchers: Dispatchers, _: undefined) => dispatchers.players.request(undefined),
};
