import { Loadable } from './redux/loadable';
import { Dispatchers } from './dispatchers';

export interface Loaders<STATE> {
  [key: string]: Loader<STATE, any, any>;
}

export const DefaultArgToKey = (arg: any) => arg;

export interface Loader<STATE, ARG, RESULT, KEY = ARG> {
  get: (state: STATE, arg: KEY) => Loadable<KEY, RESULT>;
  load: (dispatchers: Dispatchers, arg: ARG | ARG[], force?: boolean) => void;
  argToKey?: (arg: ARG) => KEY;
}
