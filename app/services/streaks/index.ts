import { ServerApi } from './../../api/serverApi';
import { generatePropertyService } from '../redux/serviceGenerator';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { Loadable } from '../redux/loadable';
import { ReduxState } from '../rootReducer';
import { Dispatchers } from '../dispatchers';
import { Loader } from '../loader';
import { Streak } from '../../../server/model/Streak';

export type StreaksService = Loadable<void, Streak[]>;

const streaksService = generatePropertyService<void, Streak[]>('STREAKS',
  (api: ServerApi) => {
    return () => {
      return api.getStreaks();
    }
  }
);

export const streaksActions = streaksService.actions;
export const StreaksDispatcher = streaksService.dispatcher;
export type StreaksDispatcher = PropertyDispatcher<void>;
export const streaksReducer = streaksService.reducer.build();
export const streaksSaga = streaksService.saga;
export const streaksLoader: Loader<ReduxState, void, Streak[]> = {
  get: (state: ReduxState) => state.streaks,
  load: (dispatchers: Dispatchers) => dispatchers.streaks.request(),
}
