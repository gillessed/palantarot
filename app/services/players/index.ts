import { Loadable } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { Player } from './../../../server/model/Player';
import { generatePropertyService } from '../redux/serviceGenerator';

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
export const playersReducer = playersService.reducer;
export const playersSaga = playersService.saga;