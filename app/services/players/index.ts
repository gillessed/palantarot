import { Loadable } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { Player } from './../../../server/model/Player';
import { generatePropertyService } from '../redux/serviceGenerator';
import { addNewPlayerActions } from '../addPlayer/index';
import { PropertyDispatcher } from '../redux/serviceDispatcher';

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
  .handlePayload(addNewPlayerActions.SUCCESS, (loadable: Loadable<void, Map<string, Player>>, player: Player) => {
    const map = loadable.value || new Map<string, Player>();
    map.set(player.id, player);
    return {
      loading: false,
      value: map,
    };
  })
  .build();
export const playersSaga = playersService.saga;