import { Loadable } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { Player } from './../../../server/model/Player';
import { generatePropertyService } from '../redux/serviceGenerator';
import { addNewPlayerActions } from '../addPlayer/index';

export type PlayersService = Loadable<Map<string, Player>>;

const playersService = generatePropertyService<void, Map<string, Player>>('PLAYERS',
  (api: ServerApi) => {
    return () => {
      return api.getPlayers();
    }
  }
);

export const playersActions = playersService.actions;
export const playersActionCreators = playersService.actionCreators;
export const playersReducer = playersService.reducer
  .handlePayload(addNewPlayerActions.SUCCESS, (loadable: Loadable<Map<string, Player>>, player: Player) => {
    const map = loadable.value || new Map<string, Player>();
    map.set(player.id, player);
    return {
      loading: false,
      value: map,
    };
  })
  .build();
export const playersSaga = playersService.saga;