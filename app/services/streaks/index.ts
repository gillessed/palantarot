import { Streak } from '../../../server/model/Streak';
import { Dispatchers } from '../dispatchers';
import { Loader } from '../loader';
import { Loadable } from '../redux/loadable';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { generatePropertyService } from '../redux/serviceGenerator';
import { ReduxState } from '../rootReducer';
import { ServerApi } from './../../api/serverApi';

export type StreaksService = Loadable<void, Streak[]>;

const streaksService = generatePropertyService<void, Streak[]>(
  'streaks',
  (api: ServerApi) => {
    return () => {
      return api.getStreaks();
    };
  }
);

export const streaksActions = streaksService.actions;
export const StreaksDispatcher = streaksService.dispatcher;
export type StreaksDispatcher = PropertyDispatcher<void>;
export const streaksReducer = streaksService.reducer.build();
export const streaksSaga = streaksService.saga;
export const streaksLoader: Loader<ReduxState, void, Streak[]> = {
  get: (state: ReduxState) => state.streaks,
  load: (dispatchers: Dispatchers, _args: void, force?: boolean) =>
    dispatchers.streaks.request(undefined, force),
};
