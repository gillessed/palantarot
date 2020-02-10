import { Loadable } from './redux/loadable';
import { Dispatchers } from './dispatchers';

export interface Loaders<STATE> {
  [key: string]: Loader<STATE, any, any>;
}

export interface Loader<STATE, ARG, RESULT> {
  get: (state: STATE, arg: ARG) => Loadable<ARG, RESULT>;
  load: (dispatchers: Dispatchers, arg: ARG | ARG[], force?: boolean) => void;
}
