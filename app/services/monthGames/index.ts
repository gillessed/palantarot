import { ServerApi } from './../../api/serverApi';
import { Game } from './../../../server/model/Game';
import { generateService } from '../redux/serviceGenerator';
import { Month } from '../../../server/model/Month';
import { LoadableCache } from '../redux/loadable';
import { ServiceDispatcher } from '../redux/serviceDispatcher';
import { wrapAsBatchCall } from '../redux/utils';

export type MonthGamesService = LoadableCache<Month, Game[]>;

const monthGamesService = generateService<Month, Game[]>('MONTH_GAMES',
  (api: ServerApi) => {
    return (months: Month[]) => {
      return wrapAsBatchCall((month: Month) => {
        return api.getMonthGames(month).then((result: Game[]) => {
          return result;
        });
      })(months);
    }
  }
);

export const monthGamesActions = monthGamesService.actions;
export const MonthGamesDispatcher = monthGamesService.dispatcher;
export type MonthGamesDispatcher = ServiceDispatcher<Month>;
export const monthGamesReducer = monthGamesService.reducer.build();
export const monthGamesSaga = monthGamesService.saga;