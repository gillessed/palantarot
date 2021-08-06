import { TypedAction } from 'redoodle';
import { ReduxState } from '../rootReducer';
export interface RefreshState {
  refreshCounter: number;
}

export const InitialRefreshState: RefreshState = {
  refreshCounter: 0,
};

export const RefreshActions = {
  increment: TypedAction.define('REFRESH // INCREMENT')<void>(),
};

export const refreshSelector = (state: ReduxState) => {
  return state.refresh.refreshCounter;
};
