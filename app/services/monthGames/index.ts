import { GameRecord } from '../../../server/model/GameRecord';
import { Month } from '../../../server/model/Month';
import { Dispatchers } from '../dispatchers';
import { Loader } from '../loader';
import { LoadableCache } from '../redux/loadable';
import { ServiceDispatcher } from '../redux/serviceDispatcher';
import { generateService, identityMapper } from '../redux/serviceGenerator';
import { wrapAsBatchCall } from '../redux/utils';
import { ReduxState } from '../rootReducer';
import { ServerApi } from './../../api/serverApi';

export type MonthGamesService = LoadableCache<Month, GameRecord[]>;

const monthGamesService = generateService<Month, GameRecord[]>('monthGames',
  (api: ServerApi) => {
    return (months: Month[]) => {
      return wrapAsBatchCall((month: Month) => {
        return api.getMonthGames(month).then((result: GameRecord[]) => {
          return result;
        });
      })(months);
    }
  },
  identityMapper,
);

export const monthGamesActions = monthGamesService.actions;
export const MonthGamesDispatcher = monthGamesService.dispatcher;
export type MonthGamesDispatcher = ServiceDispatcher<Month>;
export const monthGamesReducer = monthGamesService.reducer.build();
export const monthGamesSaga = monthGamesService.saga;
export const monthGamesLoader: Loader<ReduxState, Month, GameRecord[]> = {
  get: (state: ReduxState, month: Month) => state.monthGames.get(month),
  load: (dispatchers: Dispatchers, month: Month, force?: boolean) => dispatchers.monthGames.requestSingle(month, force),
};

